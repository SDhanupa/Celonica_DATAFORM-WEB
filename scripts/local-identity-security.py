"""Local-only backup and audience configuration; never contacts production."""
import argparse
import datetime
import json
import pathlib
import subprocess
import sys
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('action', choices=['backup', 'audience'])
action = parser.parse_args().action


def inspect(name):
    result = subprocess.run(['docker', 'inspect', name], capture_output=True, text=True)
    if result.returncode:
        if 'No such' in result.stderr:
            raise FileNotFoundError(name)
        raise RuntimeError('Local Docker is unavailable; no database operation was performed.')
    return json.loads(result.stdout)[0]


def environment(container):
    return dict(item.split('=', 1) for item in container['Config']['Env'] if '=' in item)


if action == 'backup':
    try:
        identity = inspect('celonica-web-keycloak')
    except FileNotFoundError:
        print('No existing local identity container to back up.')
        sys.exit(0)
    if ':24.' in identity['Config']['Image']:
        db = inspect('celonica-web-keycloakdb')
        env = environment(db)
        folder = ROOT / '.local' / ('identity-before-26-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
        folder.mkdir(parents=True)
        dump = folder / 'identity.dump'
        with dump.open('wb') as target:
            subprocess.run(['docker', 'exec', '-e', 'PGOPTIONS=-c default_transaction_read_only=on',
                            'celonica-web-keycloakdb', 'pg_dump', '-U', env['POSTGRES_USER'],
                            '-d', env['POSTGRES_DB'], '-Fc'], stdout=target, check=True)
        with dump.open('rb') as source:
            subprocess.run(['docker', 'exec', '-i', 'celonica-web-keycloakdb', 'pg_restore',
                            '--file=/dev/null'], stdin=source, check=True)
        print('Verified local identity backup:', dump)
else:
    env = environment(inspect('celonica-web-keycloak'))
    # Fixed loopback destination. Do not derive this address from production env.
    base = 'http://127.0.0.1:8081'
    for attempt in range(90):
        try:
            urllib.request.urlopen(base + '/realms/master/.well-known/openid-configuration', timeout=3).close()
            break
        except Exception:
            if attempt == 89:
                raise RuntimeError('Local identity server did not become ready; data was not reset.')
            time.sleep(2)
    data = urllib.parse.urlencode({
        'client_id': 'admin-cli', 'grant_type': 'password',
        'username': env.get('KC_BOOTSTRAP_ADMIN_USERNAME', env.get('KEYCLOAK_ADMIN', 'admin')),
        'password': env.get('KC_BOOTSTRAP_ADMIN_PASSWORD', env.get('KEYCLOAK_ADMIN_PASSWORD', '')),
    }).encode()
    token = json.load(urllib.request.urlopen(base + '/realms/master/protocol/openid-connect/token', data=data, timeout=20))['access_token']

    def api(path, method='GET', payload=None):
        request = urllib.request.Request(base + '/admin/realms/celonica-admin/' + path, method=method,
            headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'},
            data=json.dumps(payload).encode() if payload is not None else None)
        with urllib.request.urlopen(request, timeout=20) as response:
            raw = response.read()
            return json.loads(raw) if raw else None

    client = next(c for c in api('clients') if c['clientId'] == 'celonica-frontend')
    path = 'clients/' + client['id'] + '/protocol-mappers/models'
    mapper = {'name': 'ceylonica-api-audience', 'protocol': 'openid-connect',
              'protocolMapper': 'oidc-audience-mapper', 'consentRequired': False,
              'config': {'included.custom.audience': 'ceylonica-api', 'id.token.claim': 'false', 'access.token.claim': 'true'}}
    existing = next((m for m in api(path) if m['name'] == mapper['name']), None)
    if existing:
        api(path + '/' + existing['id'], 'PUT', dict(mapper, id=existing['id']))
    else:
        api(path, 'POST', mapper)
    print('Local frontend audience configured. Sign in again to refresh existing tokens.')
