#!/bin/bash
export PATH=$PATH:/opt/keycloak/bin

# 1. Authenticate
kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin123

# 1.5. Import realm
echo "Importing realm..."
kcadm.sh create realms -f /opt/keycloak/data/import/celonica-admin-realm.json || echo "Realm may already exist"

# 2. Get the admin-cli client ID in celonica-admin realm
CLIENT_ID=$(kcadm.sh get clients -r celonica-admin -q clientId=admin-cli | grep '"id"' | head -n 1 | sed -n 's/.*"id" *: *"\([^"]*\)".*/\1/p')

if [ -z "$CLIENT_ID" ]; then
  echo "admin-cli client not found!"
  exit 1
fi

echo "Client ID: $CLIENT_ID"

# 3. Enable Service Account on admin-cli
kcadm.sh update clients/$CLIENT_ID -r celonica-admin -s serviceAccountsEnabled=true -s publicClient=false

# 4. Generate/Get Client Secret
SECRET_JSON=$(kcadm.sh get clients/$CLIENT_ID/client-secret -r celonica-admin)
if echo "$SECRET_JSON" | grep -q "Client secret not found"; then
  SECRET_JSON=$(kcadm.sh post clients/$CLIENT_ID/client-secret -r celonica-admin)
fi
SECRET=$(echo "$SECRET_JSON" | grep '"value"' | sed -n 's/.*"value" *: *"\([^"]*\)".*/\1/p')

if [ -z "$SECRET" ]; then
  # Try to regenerate if it fails
  SECRET_JSON=$(kcadm.sh post clients/$CLIENT_ID/client-secret -r celonica-admin)
  SECRET=$(echo "$SECRET_JSON" | grep '"value"' | sed -n 's/.*"value" *: *"\([^"]*\)".*/\1/p')
fi

echo "Client Secret: $SECRET"

# 5. Get the Service Account user ID
SA_USER_ID=$(kcadm.sh get clients/$CLIENT_ID/service-account-user -r celonica-admin | grep '"id"' | head -n 1 | sed -n 's/.*"id" *: *"\([^"]*\)".*/\1/p')

# 6. Assign realm-management 'manage-users' role
REALM_MGMT_ID=$(kcadm.sh get clients -r celonica-admin -q clientId=realm-management | grep '"id"' | head -n 1 | sed -n 's/.*"id" *: *"\([^"]*\)".*/\1/p')

kcadm.sh add-roles -r celonica-admin --uusername service-account-admin-cli --cclientid realm-management --rolename manage-users
kcadm.sh add-roles -r celonica-admin --uusername service-account-admin-cli --cclientid realm-management --rolename view-users
kcadm.sh add-roles -r celonica-admin --uusername service-account-admin-cli --cclientid realm-management --rolename query-users

echo "KEYCLOAK_SECRET_IS=$SECRET"

