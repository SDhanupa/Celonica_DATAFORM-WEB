"""Set the existing local client's HTTPS origins without changing users or flows."""
import json, pathlib, subprocess, sys, urllib.parse, urllib.request

state_dir = pathlib.Path(sys.argv[1])
state_dir.mkdir(parents=True, exist_ok=True)
container = json.loads(subprocess.check_output(['docker','inspect','celonica-web-keycloak']))[0]
env = dict(value.split('=',1) for value in container['Config']['Env'] if '=' in value)
base = 'http://localhost:8081'
realm = 'celonica-admin'
payload = urllib.parse.urlencode({'client_id':'admin-cli','grant_type':'password','username':env['KEYCLOAK_ADMIN'],'password':env['KEYCLOAK_ADMIN_PASSWORD']}).encode()
token = json.load(urllib.request.urlopen(base+'/realms/master/protocol/openid-connect/token',data=payload,timeout=30))['access_token']
def api(path, method='GET', data=None):
    request = urllib.request.Request(base+'/admin/realms/'+realm+path, method=method, headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'}, data=json.dumps(data).encode() if data is not None else None)
    with urllib.request.urlopen(request,timeout=30) as response:
        content=response.read()
        return json.loads(content) if content else None
client = api('/clients?clientId=celonica-frontend')[0]
backup=state_dir/'frontend-client-before-https.json'
if not backup.exists(): backup.write_text(json.dumps(client,indent=2))
client['redirectUris']=['https://localhost:8443/*']
client['webOrigins']=['https://localhost:8443']
client.setdefault('attributes',{})['post.logout.redirect.uris']='https://localhost:8443/*'
api('/clients/'+client['id'],'PUT',client)
assert api('/clients/'+client['id'])['redirectUris']==['https://localhost:8443/*']
print('Local client now uses HTTPS-only redirects. Existing users, roles and login flows preserved.')
