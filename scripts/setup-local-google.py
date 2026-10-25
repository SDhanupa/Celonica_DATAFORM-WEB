"""Configure only the existing localhost realm; credentials stay in .local/.

Run after creating a separate Google Web OAuth client with the callback
http://localhost:8081/realms/celonica-admin/broker/google/endpoint.
Save client_id and client_secret in .local/google-oauth.json (never commit it).
No users, databases, hosted clients, or existing browser flows are replaced.
"""
import datetime
import json
import pathlib
import subprocess
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = 'http://localhost:8081'
REALM = 'celonica-admin'
FLOW = 'local-google-admin-factors'
credentials = json.loads((ROOT / '.local/google-oauth.json').read_text())
callback = BASE + '/realms/' + REALM + '/broker/google/endpoint'
assert credentials['redirect_uri'] == callback, 'Only the localhost OAuth client is allowed'
container = json.loads(subprocess.check_output(['docker', 'inspect', 'celonica-web-keycloak']))[0]
env = dict(s.split('=', 1) for s in container['Config']['Env'] if '=' in s)
body = urllib.parse.urlencode(dict(client_id='admin-cli', grant_type='password',
                                 username=env['KEYCLOAK_ADMIN'], password=env['KEYCLOAK_ADMIN_PASSWORD'])).encode()
token = json.load(urllib.request.urlopen(BASE + '/realms/master/protocol/openid-connect/token', data=body))['access_token']


def api(path, method='GET', value=None):
    request = urllib.request.Request(BASE + '/admin/realms/' + REALM + path, method=method,
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'},
        data=json.dumps(value).encode() if value is not None else None)
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read()
        return json.loads(data) if data else None


def executions(alias):
    return api('/authentication/flows/' + urllib.parse.quote(alias) + '/executions')


def requirement(parent, entry, value):
    entry['requirement'] = value
    api('/authentication/flows/' + parent + '/executions', 'PUT', entry)


def add_execution(parent, provider, config=None):
    before = {e['id'] for e in executions(parent)}
    api('/authentication/flows/' + parent + '/executions/execution', 'POST', {'provider': provider})
    entry = next(e for e in executions(parent) if e['id'] not in before and e.get('providerId') == provider)
    requirement(parent, entry, 'REQUIRED')
    if config is not None:
        api('/authentication/executions/' + entry['id'] + '/config', 'POST',
            {'alias': parent + '-' + entry['id'], 'config': config})


realm = api('')
assert realm['realm'] == REALM and realm['browserFlow'] == 'local-role-login'
providers = api('/identity-provider/instances')
existing = next((p for p in providers if p['alias'] == 'google'), None)
if existing:
    assert existing['config']['clientId'] == credentials['client_id'], 'Refusing to replace another Google client'
backup = ROOT / '.local' / ('google-backup-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True)
for name, value in [('realm', realm), ('profile', api('/users/profile')),
                    ('providers', providers), ('browser-flow', executions('local-role-login')),
                    ('first-broker', executions('first broker login'))]:
    (backup / (name + '.json')).write_text(json.dumps(value, indent=2))

if not any(f['alias'] == FLOW for f in api('/authentication/flows')):
    source = executions('local-role-login')
    sms = next(e for e in source if e.get('providerId') == 'sms-otp-authenticator' and e.get('authenticationConfig'))
    sms_config = api('/authentication/config/' + sms['authenticationConfig'])['config']
    api('/authentication/flows', 'POST', dict(alias=FLOW,
        description='Local Google login retains password and SMS for administrators',
        providerId='basic-flow', topLevel=True, builtIn=False))
    for role in ('admin', 'super_admin'):
        child = FLOW + '-' + role
        api('/authentication/flows/' + FLOW + '/executions/flow', 'POST',
            dict(alias=child, description=child, provider='basic-flow', type='basic-flow'))
        requirement(FLOW, next(e for e in executions(FLOW) if e['displayName'] == child), 'CONDITIONAL')
        add_execution(child, 'conditional-user-role', dict(condUserRole=role, negate='false'))
        if role == 'super_admin':
            add_execution(child, 'conditional-user-role', dict(condUserRole='admin', negate='true'))
        add_execution(child, 'auth-password-form')
        add_execution(child, 'sms-otp-authenticator', sms_config)
    add_execution(FLOW, 'allow-access-authenticator')

# Validate before enabling the provider, including after an interrupted prior run.
for role in ('admin', 'super_admin'):
    entries = executions(FLOW + '-' + role)
    for provider in ('conditional-user-role', 'auth-password-form', 'sms-otp-authenticator'):
        assert any(e.get('providerId') == provider and e['requirement'] == 'REQUIRED' for e in entries)

profile = api('/users/profile')
for attribute in profile['attributes']:
    if attribute['name'] in ('firstName', 'lastName'):
        attribute['required'] = {'roles': ['user']}
        attribute['permissions'] = {'view': ['admin', 'user'], 'edit': ['admin', 'user']}
    elif attribute['name'] in ('nic', 'mobile_number'):
        attribute['required'] = {'roles': ['user']}
        attribute['permissions'] = {'view': ['admin', 'user'], 'edit': ['admin', 'user']}
        attribute['displayName'] = 'National Identity Card (NIC)' if attribute['name'] == 'nic' else 'Mobile Number'
        pattern = r'^(?:[0-9]{9}[vVxX]|[0-9]{12})$' if attribute['name'] == 'nic' else r'^(?:0[0-9]{9}|\+?94[0-9]{9})$'
        attribute.setdefault('validations', {})['pattern'] = {'pattern': pattern}
    elif attribute['name'] == 'dummy_field':
        attribute.pop('required', None)
        attribute['permissions'] = {'view': ['admin'], 'edit': ['admin']}
api('/users/profile', 'PUT', profile)

provider = dict(alias='google', displayName='Google', providerId='google', enabled=True,
    trustEmail=False, storeToken=False, addReadTokenRoleOnCreate=False,
    linkOnly=False, authenticateByDefault=False, firstBrokerLoginFlowAlias='first broker login',
    postBrokerLoginFlowAlias=FLOW,
    config=dict(clientId=credentials['client_id'], clientSecret=credentials['client_secret'],
                defaultScope='openid email profile', syncMode='IMPORT', hideOnLoginPage='false', disableUserInfo='false'))
if existing:
    provider['internalId'] = existing['internalId']
    api('/identity-provider/instances/google', 'PUT', provider)
else:
    api('/identity-provider/instances', 'POST', provider)
assert api('/identity-provider/instances/google')['enabled']
assert executions('local-role-login') == json.loads((backup / 'browser-flow.json').read_text())
assert executions('first broker login') == json.loads((backup / 'first-broker.json').read_text())
print('Local Google login enabled; required NIC/mobile and admin password + SMS retained.')
print('Existing user records and login flows were not modified. Backup:', backup)
