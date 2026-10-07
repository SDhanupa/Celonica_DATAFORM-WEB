---
name: setup-keycloak-sms-registration
description: >-
  Use this skill to rebuild the Keycloak SMS SPI jar, deploy it, and configure the custom SMS OTP registration flow in Keycloak. Use it when the user asks to "rebuild keycloak sms registration", "setup keycloak registration", or similar.
---

# Setup Keycloak SMS Registration

This skill automates the process of building the `keycloak-sms-spi` Java project, copying the resulting JAR to the Keycloak providers directory, restarting Keycloak, and configuring the `registration-with-sms` flow via the Keycloak Admin CLI.

## Steps

1.  Execute the setup script located in the `scripts` directory of this skill.
    [setup.ps1](./scripts/setup.ps1)
    
    ```powershell
    # Run this from the root of the workspace
    powershell -ExecutionPolicy Bypass -File ".agents\skills\setup-keycloak-sms-registration\scripts\setup.ps1"
    ```

2.  Verify the script output. It should indicate that:
    *   The Maven build was successful.
    *   Keycloak restarted.
    *   The `registration-with-sms` flow was created and set as the default registration flow.
    *   The TextWare SMS credentials (read from `backend/.env`) were applied to the configuration.
