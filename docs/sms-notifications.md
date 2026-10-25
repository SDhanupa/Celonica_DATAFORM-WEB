# Registration and login SMS

The `ceylonica-login-sms` Keycloak event listener sends a username greeting after
successful registration or a fresh successful login. It handles form and Google
registration, and password, SMS and Google login. The signup's automatic first
login is suppressed so it produces one welcome message. Silent SSO, refreshes,
failed attempts, admin-console clients and service accounts are excluded.

## Hosted configuration

Use realm `ceylonica-admin` and client `ceylonica-frontend`. Preserve its existing
Google OAuth client, credentials, browser/registration flows and event settings.
Add `ceylonica-login-sms` alongside the existing event listeners and set only:

| Realm attribute | Value |
| --- | --- |
| `ceylonica.sms-notifications.enabled` | `true` |
| `ceylonica.sms-notifications.clients` | `ceylonica-frontend` |
| `ceylonica.sms-notifications.config-id` | ID of an existing configured SMS authenticator in the frontend client's login flow (or registration step, if configured there) |

The user-profile `mobile_number` attribute must be required for the `user` role
and validated with `^(?:0[0-9]{9}|\+?94[0-9]{9})$`, so new Google registrants cannot
skip their number. Preserve its existing view/edit permissions and all other
profile fields. NIC remains required. Changing the requirement does not populate
or rewrite existing user records; accounts with no mobile cannot receive messages
until the user supplies one. Collecting a Google user's number is not SMS proof of
ownership; the notification itself is not an OTP verification step.

Deploy only the built `keycloak/providers/keycloak-sms-spi.jar` and restart the
Ceylonica Keycloak container. Do not apply `docker-compose.local.yml` on hosting,
import a realm, run migrations/seeders, or restart unrelated services.

Before deployment, save the previous JAR, realm attributes, event settings,
profile definition and database backups. Verify user-data fingerprints and the
other containers before/after. Rollback restores the previous JAR and the three
configuration objects, then restarts only Ceylonica Keycloak. It does not restore
databases or replace users.

When updating realm attributes, explicitly retain `browserSecurityHeaders`:
Keycloak 24 otherwise resets them to defaults. Preserve `enabledEventTypes` from
the realm representation when saving events; `/events/config` may expand an
empty stored list into the default event set. Compare full settings after save.

Messages are queued after transaction commit and sent asynchronously. Delivery
is best effort with a bounded in-memory queue; gateway failure, queue saturation
or a server crash can leave a message unsent. Authentication is never blocked by
notification failure. Disabling this listener does not disable OTP verification.

The Java tests cover commit/rollback, Google and form registration, all login
methods, duplicate suppression, silent SSO, missing phones/configuration and
queue failures. Live delivery must also be checked using a disposable test
account and an explicitly approved destination number.
