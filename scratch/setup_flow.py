import requests
import json
import sys

URL = "http://localhost:8081/admin/realms/ceylonica-admin"
TOKEN = sys.argv[1]
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

# 1. Copy Browser flow
res = requests.post(f"{URL}/authentication/flows/browser/copy", json={"newName": "Browser with SMS"}, headers=HEADERS)
print("Copy Browser:", res.status_code)

# 2. Get executions of Browser with SMS
res = requests.get(f"{URL}/authentication/flows/Browser with SMS/executions", headers=HEADERS)
executions = res.json()

# 3. Find the "forms" subflow execution and delete it
for exe in executions:
    if exe.get("flowAlias") == "forms":
        exe_id = exe["id"]
        res = requests.delete(f"{URL}/authentication/executions/{exe_id}", headers=HEADERS)
        print("Deleted forms subflow:", res.status_code)

# 4. Add auth-username-form to the top level
res = requests.post(f"{URL}/authentication/flows/Browser with SMS/executions/execution", json={"provider": "auth-username-form"}, headers=HEADERS)
print("Added auth-username-form:", res.status_code)

# 5. Create Password or SMS subflow
res = requests.post(f"{URL}/authentication/flows/Browser with SMS/executions/flow", json={"alias": "Password or SMS Choice", "description": "Choose between Password or SMS", "provider": "registration-page-form", "type": "basic-flow"}, headers=HEADERS)
print("Added Subflow:", res.status_code)

# Update the subflow requirement to REQUIRED and auth-username-form to REQUIRED
res = requests.get(f"{URL}/authentication/flows/Browser with SMS/executions", headers=HEADERS)
executions = res.json()
for exe in executions:
    if exe.get("authenticator") == "auth-username-form":
        exe["requirement"] = "REQUIRED"
        requests.put(f"{URL}/authentication/flows/Browser with SMS/executions", json=exe, headers=HEADERS)
    if exe.get("flowAlias") == "Password or SMS Choice":
        exe["requirement"] = "REQUIRED"
        requests.put(f"{URL}/authentication/flows/Browser with SMS/executions", json=exe, headers=HEADERS)

# 6. Add Password form to the subflow
res = requests.post(f"{URL}/authentication/flows/Password or SMS Choice/executions/execution", json={"provider": "auth-password-form"}, headers=HEADERS)
print("Added auth-password-form:", res.status_code)

# 7. Add SMS OTP Authenticator to the subflow
res = requests.post(f"{URL}/authentication/flows/Password or SMS Choice/executions/execution", json={"provider": "sms-otp-authenticator"}, headers=HEADERS)
print("Added sms-otp-authenticator:", res.status_code)

# Get the subflow executions to set them to ALTERNATIVE and bind the configuration to SMS OTP
res = requests.get(f"{URL}/authentication/flows/Password or SMS Choice/executions", headers=HEADERS)
executions = res.json()
sms_exe_id = None
for exe in executions:
    exe["requirement"] = "ALTERNATIVE"
    requests.put(f"{URL}/authentication/flows/Browser with SMS/executions", json=exe, headers=HEADERS)
    if exe.get("authenticator") == "sms-otp-authenticator":
        sms_exe_id = exe["id"]

# 8. Configure SMS OTP
res = requests.post(f"{URL}/authentication/executions/{sms_exe_id}/config", json={"alias": "TextWare Config", "config": {"textware.username": "TW01176_vixva_tr", "textware.password": "Vixva#663", "textware.sender_id": "VIXVA"}}, headers=HEADERS)
print("Configured SMS OTP:", res.status_code)

# 9. Bind flow to browser
res = requests.put(f"{URL}", json={"browserFlow": "Browser with SMS"}, headers=HEADERS)
print("Bound Browser flow:", res.status_code)
