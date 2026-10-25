"""Enable successful registration/login SMS only in localhost Keycloak.

Build and install the provider JAR first. Run with --disable to stop these
notifications; OTP verification and all existing users remain unchanged.
"""
import datetime
import json
import pathlib
import subprocess
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = 'http://localhost:8081'
REALM = 'celonica-admin'
LISTENER = 'ceylonica-login-sms'
PREFIX = 'ceylonica.sms-notifications.'
container = json.loads(subprocess.check_output(['docker', 'inspect', 'celonica-web-keycloak']))[0]
env = dict(s.split('=', 1) for s in container['Config']['Env'] if '=' in s)
data = urllib.parse.urlencode(dict(client_id='admin-cli', grant_type='password',
    username=env['KEYCLOAK_ADMIN'], password=env['KEYCLOAK_ADMIN_PASSWORD'])).encode()
token = json.load(urllib.request.urlopen(BASE + '/realms/master/protocol/openid-connect/token', data=data))['access_token']


def api(path, method='GET', value=None):
    request = urllib.request.Request(BASE + '/admin' + path, method=method,
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'},
        data=json.dumps(value).encode() if value is not None else None)
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read()
        return json.loads(data) if data else None


path = '/realms/' + REALM
realm = api(path)
assert realm['realm'] == REALM
events = api(path + '/events/config')
attributes = dict(realm.get('attributes', {}))
backup = ROOT / '.local' / ('sms-notifications-backup-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True)
(backup / 'realm-attributes.json').write_text(json.dumps(attributes, indent=2))
(backup / 'events-config.json').write_text(json.dumps(events, indent=2))
updated_events = dict(events)
# /events/config expands default event types; preserve the stored realm value.
updated_events['enabledEventTypes'] = realm.get('enabledEventTypes', [])
listeners = list(events.get('eventsListeners', []))
enabled = '--disable' not in sys.argv[1:]
if enabled:
    server = api('/serverinfo')
    assert LISTENER in server['providers']['eventsListener']['providers'], 'Rebuild provider JAR and restart local Keycloak first'
    executions = api(path + '/authentication/flows/' + urllib.parse.quote(realm['registrationFlow']) + '/executions')
    sms = next(e for e in executions if e.get('providerId') == 'sms-registration-action' and e.get('authenticationConfig'))
    config = api(path + '/authentication/config/' + sms['authenticationConfig'])['config']
    assert all(config.get(k) for k in ['sms.textware.username', 'sms.textware.password', 'sms.textware.senderId'])
    attributes.update({PREFIX + 'enabled': 'true', PREFIX + 'clients': 'celonica-frontend',
                       PREFIX + 'config-id': sms['authenticationConfig']})
    if LISTENER not in listeners:
        listeners.append(LISTENER)
else:
    attributes[PREFIX + 'enabled'] = 'false'
    listeners = [name for name in listeners if name != LISTENER]
updated_events['eventsListeners'] = listeners
try:
    api(path, 'PUT', {'attributes': attributes, 'browserSecurityHeaders': realm['browserSecurityHeaders']})
    api(path + '/events/config', 'PUT', updated_events)
except Exception:
    api(path, 'PUT', {'attributes': realm.get('attributes', {}), 'browserSecurityHeaders': realm['browserSecurityHeaders']})
    events['enabledEventTypes'] = realm.get('enabledEventTypes', [])
    api(path + '/events/config', 'PUT', events)
    raise
assert (LISTENER in api(path + '/events/config')['eventsListeners']) == enabled
print('Local registration/login SMS notifications:', 'enabled' if enabled else 'disabled')
print('Settings backup:', backup)
print('No users, OTP flows, schema, hosted settings or other projects were modified.')
