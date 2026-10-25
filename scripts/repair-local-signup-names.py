"""Restore missing name-field permissions in localhost Keycloak; never edit users."""
import datetime
import json
import pathlib
import subprocess
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = 'http://localhost:8081'
REALM = 'celonica-admin'
container = json.loads(subprocess.check_output(['docker', 'inspect', 'celonica-web-keycloak']))[0]
env = dict(item.split('=', 1) for item in container['Config']['Env'] if '=' in item)
body = urllib.parse.urlencode(dict(client_id='admin-cli', grant_type='password',
    username=env['KEYCLOAK_ADMIN'], password=env['KEYCLOAK_ADMIN_PASSWORD'])).encode()
token = json.load(urllib.request.urlopen(BASE + '/realms/master/protocol/openid-connect/token', data=body))['access_token']
url = BASE + '/admin/realms/' + REALM + '/users/profile'
headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}
profile = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=headers)))
backup = ROOT / '.local' / ('name-profile-before-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S') + '.json')
backup.write_text(json.dumps(profile, indent=2))
found = set()
for attribute in profile['attributes']:
    if attribute['name'] in ('firstName', 'lastName'):
        found.add(attribute['name'])
        attribute['permissions'] = {'view': ['admin', 'user'], 'edit': ['admin', 'user']}
assert found == {'firstName', 'lastName'}
with urllib.request.urlopen(urllib.request.Request(url, headers=headers, method='PUT', data=json.dumps(profile).encode())) as response:
    assert response.status == 200
verified = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=headers)))
assert all(attribute['permissions'] == {'view': ['admin', 'user'], 'edit': ['admin', 'user']}
    for attribute in verified['attributes'] if attribute['name'] in found)
print('Local name-field view/edit permissions restored; no user records changed.')
print('Backup:', backup)
