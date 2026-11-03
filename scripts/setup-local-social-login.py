"""Configure real Google and/or TextWare SMS login in localhost Keycloak.

Credentials: ignored .local/google-oauth.json and .local/sms-textware.json.
Use --check for a read-only readiness check; --google or --sms for one provider.
Without either selection flag, both providers are requested. No SMS is sent by
this script. Admins require password plus SMS; regular users can choose either.
Changing the browser policy restarts local Keycloak to expire old login attempts.
"""
import argparse
import datetime
import json
import pathlib
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

import local_role_login

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = 'http://localhost:8081'
REALM = 'celonica-admin'
FLOW = local_role_login.FLOW
CALLBACK = BASE + '/realms/' + REALM + '/broker/google/endpoint'


def credentials(filename, keys):
    path = ROOT / '.local' / filename
    try:
        value = json.loads(path.read_text(encoding='utf-8-sig'))
    except (OSError, ValueError):
        raise ValueError('Create valid JSON in ' + str(path)) from None
    if not isinstance(value, dict):
        raise ValueError('Expected a JSON object in ' + str(path))
    missing = [key for key in keys if not isinstance(value.get(key), str) or not value[key].strip()]
    if missing:
        raise ValueError(filename + ': fill in ' + ', '.join(missing))
    return value


class Keycloak:
    def __init__(self):
        container = json.loads(subprocess.check_output(['docker', 'inspect', 'celonica-web-keycloak']))[0]
        env = dict(s.split('=', 1) for s in container['Config']['Env'] if '=' in s)
        body = urllib.parse.urlencode(dict(client_id='admin-cli', grant_type='password',
            username=env['KEYCLOAK_ADMIN'], password=env['KEYCLOAK_ADMIN_PASSWORD'])).encode()
        with urllib.request.urlopen(BASE + '/realms/master/protocol/openid-connect/token', data=body, timeout=30) as response:
            self.token = json.load(response)['access_token']

    def api(self, path, method='GET', value=None):
        request = urllib.request.Request(BASE + '/admin/realms/' + REALM + path, method=method,
            headers={'Authorization': 'Bearer ' + self.token, 'Content-Type': 'application/json'},
            data=json.dumps(value).encode() if value is not None else None)
        with urllib.request.urlopen(request, timeout=30) as response:
            data = response.read()
            return json.loads(data) if data else None

    def entries(self, alias):
        return self.api('/authentication/flows/' + urllib.parse.quote(alias, safe='') + '/executions')

    def requirement(self, parent, entry, requirement):
        entry['requirement'] = requirement
        self.api('/authentication/flows/' + parent + '/executions', 'PUT', entry)

    def execution(self, parent, provider, requirement):
        entry = next((e for e in self.entries(parent) if e.get('providerId') == provider), None)
        if entry is None:
            self.api('/authentication/flows/' + parent + '/executions/execution', 'POST', {'provider': provider})
            entry = next(e for e in self.entries(parent) if e.get('providerId') == provider)
        self.requirement(parent, entry, requirement)
        return entry

    def subflow(self, parent, alias, requirement):
        if not any(e['displayName'] == alias for e in self.entries(parent)):
            self.api('/authentication/flows/' + parent + '/executions/flow', 'POST',
                dict(alias=alias, description=alias, provider='basic-flow', type='basic-flow'))
        self.requirement(parent, next(e for e in self.entries(parent) if e['displayName'] == alias), requirement)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--google', action='store_true')
    parser.add_argument('--sms', action='store_true')
    args = parser.parse_args()
    google_requested = args.google or not args.sms
    sms_requested = args.sms or not args.google
    errors = []
    google = sms = None
    for enabled, filename, keys in [
        (google_requested, 'google-oauth.json', ('client_id', 'client_secret', 'redirect_uri')),
        (sms_requested, 'sms-textware.json', ('username', 'password', 'sender_id')),
    ]:
        if not enabled:
            continue
        try:
            value = credentials(filename, keys)
            if filename == 'google-oauth.json':
                if value['redirect_uri'] != CALLBACK:
                    raise ValueError('Google redirect_uri must be ' + CALLBACK)
                if not value['client_id'].endswith('.apps.googleusercontent.com'):
                    raise ValueError('Use a Google Web application OAuth client ID')
                google = value
            else:
                sms = value
        except ValueError as error:
            errors.append(str(error))
    if errors:
        print('\n'.join(errors))
        print('No Keycloak settings changed. Fill the ignored local files and run again.')
        return 2

    kc = Keycloak()
    realm = kc.api('')
    if realm['realm'] != REALM or realm['browserFlow'] not in ('browser', 'local-password-login', 'local-password-or-sms', FLOW):
        raise ValueError('Unexpected local browser flow; review it before replacing it')
    providers = kc.api('/identity-provider/instances')
    existing_google = next((p for p in providers if p['alias'] == 'google'), None)
    if google and existing_google and existing_google['config'].get('clientId') != google['client_id']:
        raise ValueError('Refusing to replace a different existing Google OAuth client')
    if sms and not any(p['id'] == 'sms-otp-authenticator' for p in kc.api('/authentication/authenticator-providers')):
        raise ValueError('Install the existing SMS provider JAR in local Keycloak first')
    client = kc.api('/clients?clientId=celonica-frontend')[0]
    if client.get('directAccessGrantsEnabled') or client.get('authenticationFlowBindingOverrides'):
        raise ValueError('Review frontend password grants or flow overrides before enabling the role policy')
    if args.check:
        print('Credential fields and local providers are ready. No changes made or SMS sent.')
        print('Google credentials and SMS delivery still require live login verification.')
        return 0

    backup = ROOT / '.local' / ('social-login-backup-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
    backup.mkdir(parents=True)
    for name, value in [('realm', realm), ('providers', providers), ('flows', kc.api('/authentication/flows'))]:
        (backup / (name + '.json')).write_text(json.dumps(value, indent=2), encoding='utf-8')
    # Include execution configs so reruns also preserve previous SMS credentials.
    for flow in kc.api('/authentication/flows'):
        if flow.get('topLevel'):
            entries = kc.entries(flow['alias'])
            (backup / (flow['id'] + '-executions.json')).write_text(json.dumps(entries, indent=2), encoding='utf-8')
            for entry in entries:
                if entry.get('authenticationConfig'):
                    config = kc.api('/authentication/config/' + entry['authenticationConfig'])
                    (backup / (entry['authenticationConfig'] + '-config.json')).write_text(json.dumps(config, indent=2), encoding='utf-8')

    if sms:
        local_role_login.build(kc, sms)
    elif google:
        # Google must never bypass the required local factors for administrators.
        local_role_login.validate(kc)

    if google:
        provider = dict(alias='google', displayName='Google', providerId='google', enabled=True,
            trustEmail=False, storeToken=False, addReadTokenRoleOnCreate=False, linkOnly=False,
            authenticateByDefault=False, firstBrokerLoginFlowAlias='first broker login',
            postBrokerLoginFlowAlias=local_role_login.BROKER_FLOW,
            config=dict(clientId=google['client_id'], clientSecret=google['client_secret'],
                defaultScope='openid email profile', syncMode='IMPORT', hideOnLoginPage='false'))
        if existing_google:
            provider['internalId'] = existing_google['internalId']
            kc.api('/identity-provider/instances/google', 'PUT', provider)
        else:
            kc.api('/identity-provider/instances', 'POST', provider)
    # Bind only after the choices and SMS credentials have been installed.
    if sms:
        kc.api('', 'PUT', {'browserFlow': FLOW})
        for provider in providers:
            if provider.get('enabled'):
                provider['postBrokerLoginFlowAlias'] = local_role_login.BROKER_FLOW
                kc.api('/identity-provider/instances/' + urllib.parse.quote(provider['alias'], safe=''), 'PUT', provider)
        # Existing sessions from the old single-factor policy must not remain valid.
        if realm['browserFlow'] != FLOW:
            for role in ('admin', 'super_admin'):
                kc.api('/roles/' + role)  # Confirm both policy roles exist before session invalidation.
            first = 0
            while True:
                users = kc.api('/users?first=' + str(first) + '&max=100')
                for user in users:
                    roles = kc.api('/users/' + user['id'] + '/role-mappings/realm/composite')
                    if any(r['name'] in ('admin', 'super_admin') for r in roles):
                        kc.api('/users/' + user['id'] + '/logout', 'POST')
                if len(users) < 100:
                    break
                first += len(users)
    print('Enabled locally:', ', '.join(name for name, enabled in [('Google', google), ('SMS', sms)] if enabled))
    print('Existing users/passwords preserved. No SMS sent. Backup:', backup)
    if sms:
        print('Admins require password AND SMS. Regular users can choose password OR SMS. Google admin checks are prepared.')
        if realm['browserFlow'] != FLOW:
            # Keycloak 24 keeps pending authentication sessions in memory. Clearing
            # user sessions alone leaves old username/password-only attempts alive.
            subprocess.run(['docker', 'restart', 'celonica-web-keycloak'], check=True, stdout=subprocess.DEVNULL)
            print('Local Keycloak restarted to expire pending attempts from the previous policy.')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, urllib.error.URLError) as error:
        # Do not print response bodies, configuration values, or credentials.
        print('Setup stopped:', str(error))
        sys.exit(1)
