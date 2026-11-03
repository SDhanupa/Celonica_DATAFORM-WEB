# Google and SMS login on localhost

The project includes the Google button, password/SMS method chooser, and
TextWare OTP provider. SMS is now configured in the local realm using the
private environment archive supplied on 2 November 2026. Real SMS delivery
and code verification reached the protected admin dashboard successfully.
Google remains pending: the supplied archive contains no Google OAuth client
credentials. The local role policy is now:

- `admin` or `super_admin`: password **and then** SMS OTP are required.
- Regular users: password **or** SMS OTP may be chosen.
- An account holding both admin roles receives one OTP challenge.
- Admins without a stored phone cannot complete login; they cannot fall back
  to password-only authentication.

1. Fill `.local/google-oauth.json` with `client_id` and `client_secret` from a
   Google OAuth **Web application** client. Keep `redirect_uri` exactly:
   `http://localhost:8081/realms/celonica-admin/broker/google/endpoint`.
   Add that URI to the client's authorized redirect URIs in Google.
2. Fill `.local/sms-textware.json` with `username`, `password`, and the approved
   `sender_id` for the TextWare account. Both files are excluded from Git.
3. From the project root, run:

   ```powershell
   python scripts/setup-local-social-login.py --check
   python scripts/setup-local-social-login.py
   ```

Use `--google` or `--sms` to enable only that provider. The script backs up the
previous configuration in `.local/social-login-backup-*`, changes only the
localhost realm, and does not send an SMS or modify user records.

For Google, the existing first-broker-login flow handles new profiles and
account linking. The setup script attaches `local-google-admin-factors-v2`
after Google sign-in, preserving the mandatory local password and SMS checks
for admin roles. Google is still disabled until credentials are supplied.
Automatic trust of email and storage of Google tokens are disabled.
Existing roles are not changed.

For regular-user SMS login, enter the account's username, then select SMS OTP.
For administrators, enter the password first; SMS verification follows
automatically. SMS needs a stored `mobile_number` attribute in
Keycloak. The local test account has its user-authorized phone number.
Its original name, email, password and roles are preserved.
Use the intended account and its verified phone number for end-to-end testing;
the setup script does not invent or change phone numbers.

Before declaring setup complete, verify Google returns to localhost after
sign-in and an actual SMS code completes login. Configuration checks alone
do not validate the Google client secret or TextWare account credit/delivery.

When updating a user through Keycloak's Admin API, fetch and preserve the
full user representation before changing attributes. Sending only attributes
can clear profile fields such as the name and email. The original local
profile and its attribute schema were backed up in `.local/sms-phone-backup-*`.

See the official [Keycloak identity provider documentation](https://www.keycloak.org/docs/latest/server_admin/#_identity_broker)
for Google's client configuration and first-login behavior.

To roll back SMS, restore the `browserFlow` from the backup realm.json in
local Keycloak's Authentication bindings. The prior password flow is retained.
To roll back Google, disable the local Google provider (or restore its backed-up
configuration if it existed before). Do not delete user accounts to roll back.

Role policy verification on 2 November 2026: regular-user choice, admin-only
password step, dual-role password step, and real superadmin password followed
by SMS verification were checked. The protected Industry Surveys page opened
only after the code was accepted. Three temporary form-test accounts were
removed. A validation check rejected an optional admin OTP in a deliberately
weakened in-memory configuration. The frontend client's password grant and
authentication overrides are disabled. Changing the policy restarts local
Keycloak so earlier pending login attempts cannot use the old flow.
