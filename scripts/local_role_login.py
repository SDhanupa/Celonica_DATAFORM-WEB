"""Local Keycloak role policy: admins need both factors, users can choose."""

FLOW = 'local-role-login'
STEPS = FLOW + '-steps'
BROKER_FLOW = 'local-google-admin-factors-v2'

# Ordered, mutually exclusive branches; a user holding both roles gets one OTP.
BRANCHES = (
    ('admin', (('admin', False),), True),
    ('super-admin', (('super_admin', False), ('admin', True)), True),
    ('user', (('admin', True), ('super_admin', True)), False),
)


def configure(kc, entry, alias, values):
    value = {'alias': alias, 'config': values}
    if entry.get('authenticationConfig'):
        kc.api('/authentication/config/' + entry['authenticationConfig'], 'PUT', value)
    else:
        kc.api('/authentication/executions/' + entry['id'] + '/config', 'POST', value)


def top_flow(kc, alias, description):
    if not any(f['alias'] == alias for f in kc.api('/authentication/flows')):
        kc.api('/authentication/flows', 'POST', dict(alias=alias, description=description,
            providerId='basic-flow', topLevel=True, builtIn=False))


def direct(kc, parent):
    return [e for e in kc.entries(parent) if e.get('level', 0) == 0]


def role_condition(kc, parent, role, negate):
    alias = parent + ('-not-' if negate else '-is-') + role
    entry = None
    for candidate in direct(kc, parent):
        if candidate.get('providerId') == 'conditional-user-role' and candidate.get('authenticationConfig'):
            if kc.api('/authentication/config/' + candidate['authenticationConfig'])['alias'] == alias:
                entry = candidate
                break
    if entry is None:
        # Reuse an unconfigured condition left by an interrupted setup.
        entry = next((e for e in direct(kc, parent) if e.get('providerId') == 'conditional-user-role'
                      and not e.get('authenticationConfig')), None)
    if entry is None:
        before = {e['id'] for e in kc.entries(parent)}
        kc.api('/authentication/flows/' + parent + '/executions/execution', 'POST', {'provider': 'conditional-user-role'})
        entry = next(e for e in kc.entries(parent) if e['id'] not in before)
    kc.requirement(parent, entry, 'REQUIRED')
    configure(kc, entry, alias, {'condUserRole': role, 'negate': str(negate).lower()})


def sms_execution(kc, parent, requirement, sms):
    entry = kc.execution(parent, 'sms-otp-authenticator', requirement)
    configure(kc, entry, parent + '-textware', {
        'sms.textware.username': sms['username'], 'sms.textware.password': sms['password'],
        'sms.textware.senderId': sms['sender_id']})


def branches(kc, parent, sms, broker=False):
    for name, conditions, privileged in BRANCHES:
        child = parent + '-' + name
        kc.subflow(parent, child, 'CONDITIONAL')
        for role, negate in conditions:
            role_condition(kc, child, role, negate)
        if privileged:
            kc.execution(child, 'auth-password-form', 'REQUIRED')
            sms_execution(kc, child, 'REQUIRED', sms)
        elif broker:
            kc.execution(child, 'allow-access-authenticator', 'REQUIRED')
        else:
            choice = child + '-choice'
            kc.subflow(child, choice, 'REQUIRED')
            kc.execution(choice, 'auth-password-form', 'ALTERNATIVE')
            sms_execution(kc, choice, 'ALTERNATIVE', sms)


def expect(kc, parent, expected):
    actual = [(e['displayName'] if e.get('authenticationFlow') else e.get('providerId'), e['requirement'])
              for e in direct(kc, parent)]
    if actual != expected:
        raise ValueError('Unexpected authentication structure in ' + parent + '; refusing to enable it')


def validate(kc):
    expect(kc, FLOW, [('auth-cookie', 'ALTERNATIVE'), (STEPS, 'ALTERNATIVE')])
    expect(kc, STEPS, [('auth-username-form', 'REQUIRED')] +
           [(STEPS + '-' + name, 'CONDITIONAL') for name, _, _ in BRANCHES])
    expect(kc, BROKER_FLOW, [(BROKER_FLOW + '-' + name, 'CONDITIONAL') for name, _, _ in BRANCHES])
    for parent, broker in ((STEPS, False), (BROKER_FLOW, True)):
        for name, conditions, privileged in BRANCHES:
            child = parent + '-' + name
            expected = [('conditional-user-role', 'REQUIRED')] * len(conditions)
            expected += ([('auth-password-form', 'REQUIRED'), ('sms-otp-authenticator', 'REQUIRED')] if privileged
                         else [('allow-access-authenticator', 'REQUIRED')] if broker else [(child + '-choice', 'REQUIRED')])
            expect(kc, child, expected)
            for entry, (role, negate) in zip(direct(kc, child), conditions):
                config = kc.api('/authentication/config/' + entry['authenticationConfig'])['config']
                if config != {'condUserRole': role, 'negate': str(negate).lower()}:
                    raise ValueError('Incorrect role condition in ' + child)
            if not privileged and not broker:
                expect(kc, child + '-choice', [('auth-password-form', 'ALTERNATIVE'), ('sms-otp-authenticator', 'ALTERNATIVE')])
    for parent in (FLOW, BROKER_FLOW):
        for entry in kc.entries(parent):
            if entry.get('providerId') == 'sms-otp-authenticator':
                config = kc.api('/authentication/config/' + entry['authenticationConfig'])['config']
                if not all(config.get('sms.textware.' + key) for key in ('username', 'password', 'senderId')):
                    raise ValueError('Missing SMS configuration in ' + parent)


def build(kc, sms):
    top_flow(kc, FLOW, 'Admin and super_admin: password then SMS; regular users: password or SMS')
    kc.execution(FLOW, 'auth-cookie', 'ALTERNATIVE')
    kc.subflow(FLOW, STEPS, 'ALTERNATIVE')
    kc.execution(STEPS, 'auth-username-form', 'REQUIRED')
    branches(kc, STEPS, sms)
    top_flow(kc, BROKER_FLOW, 'Google sign-in still requires both local factors for administrators')
    branches(kc, BROKER_FLOW, sms, broker=True)
    validate(kc)
