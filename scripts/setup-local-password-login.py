"""Enable username-then-password login on localhost, preserving existing users.

Run after start.ps1: python scripts/setup-local-password-login.py
The prior realm binding is backed up under the ignored .local directory.
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
FLOW = 'local-password-login'
STEPS = FLOW + '-steps'
container = json.loads(subprocess.check_output(['docker', 'inspect', 'celonica-web-keycloak']))[0]
env = dict(s.split('=', 1) for s in container['Config']['Env'] if '=' in s)
body = urllib.parse.urlencode(dict(client_id='admin-cli', grant_type='password',
    username=env['KEYCLOAK_ADMIN'], password=env['KEYCLOAK_ADMIN_PASSWORD'])).encode()
token = json.load(urllib.request.urlopen(BASE + '/realms/master/protocol/openid-connect/token', data=body, timeout=30))['access_token']


def api(path, method='GET', value=None):
    request = urllib.request.Request(BASE + '/admin/realms/' + REALM + path, method=method,
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'},
        data=json.dumps(value).encode() if value is not None else None)
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read()
        return json.loads(data) if data else None


def executions(alias):
    return api('/authentication/flows/' + urllib.parse.quote(alias) + '/executions')


def require(parent, entry, requirement):
    entry['requirement'] = requirement
    api('/authentication/flows/' + parent + '/executions', 'PUT', entry)


def add(parent, provider, requirement):
    entries = executions(parent)
    entry = next((e for e in entries if e.get('providerId') == provider), None)
    if entry is None:
        api('/authentication/flows/' + parent + '/executions/execution', 'POST', {'provider': provider})
        entry = next(e for e in executions(parent) if e.get('providerId') == provider)
    require(parent, entry, requirement)


realm = api('')
assert realm['realm'] == REALM
assert realm['browserFlow'] in ('browser', FLOW), 'Review the existing custom flow before replacing it'
backup = ROOT / '.local' / ('password-login-backup-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True)
for name, value in [('realm', realm), ('browser-flow', executions(realm['browserFlow']))]:
    (backup / (name + '.json')).write_text(json.dumps(value, indent=2))

if not any(f['alias'] == FLOW for f in api('/authentication/flows')):
    api('/authentication/flows', 'POST', dict(alias=FLOW,
        description='Local username followed by password, with normal SSO',
        providerId='basic-flow', topLevel=True, builtIn=False))
add(FLOW, 'auth-cookie', 'ALTERNATIVE')
if not any(e['displayName'] == STEPS for e in executions(FLOW)):
    api('/authentication/flows/' + FLOW + '/executions/flow', 'POST',
        dict(alias=STEPS, description='Local password steps', provider='basic-flow', type='basic-flow'))
require(FLOW, next(e for e in executions(FLOW) if e['displayName'] == STEPS), 'ALTERNATIVE')
add(STEPS, 'auth-username-form', 'REQUIRED')
add(STEPS, 'auth-password-form', 'REQUIRED')
entries = executions(STEPS)
assert [(e.get('providerId'), e['requirement']) for e in entries] == [
    ('auth-username-form', 'REQUIRED'), ('auth-password-form', 'REQUIRED')]
api('', 'PUT', {'browserFlow': FLOW})
assert api('')['browserFlow'] == FLOW
print('Local two-step password login enabled. Existing accounts and passwords preserved.')
print('Previous configuration:', backup)
