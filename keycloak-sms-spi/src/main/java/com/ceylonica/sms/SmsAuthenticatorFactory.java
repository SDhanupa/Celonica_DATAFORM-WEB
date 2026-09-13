package com.ceylonica.sms;

import org.keycloak.Config;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

import java.util.Arrays;
import java.util.List;

public class SmsAuthenticatorFactory implements AuthenticatorFactory {

    public static final String PROVIDER_ID = "sms-otp-authenticator";
    private static final SmsAuthenticator SINGLETON = new SmsAuthenticator();

    public static final String CONF_USERNAME = "sms.textware.username";
    public static final String CONF_PASSWORD = "sms.textware.password";
    public static final String CONF_SENDER_ID = "sms.textware.senderId";

    @Override
    public String getDisplayType() {
        return "SMS OTP Authenticator";
    }

    @Override
    public String getReferenceCategory() {
        return "sms-otp";
    }

    @Override
    public boolean isConfigurable() {
        return true;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        return REQUIREMENT_CHOICES;
    }

    @Override
    public boolean isUserSetupAllowed() {
        return false;
    }

    @Override
    public String getHelpText() {
        return "Validates an OTP sent via TextWare SMS. Requires mobile_number attribute on user profile.";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        ProviderConfigProperty username = new ProviderConfigProperty();
        username.setType(ProviderConfigProperty.STRING_TYPE);
        username.setName(CONF_USERNAME);
        username.setLabel("TextWare Username");
        username.setHelpText("Your TextWare API Username");

        ProviderConfigProperty password = new ProviderConfigProperty();
        password.setType("Password");
        password.setName(CONF_PASSWORD);
        password.setLabel("TextWare Password");
        password.setHelpText("Your TextWare API Password (Hidden)");

        ProviderConfigProperty senderId = new ProviderConfigProperty();
        senderId.setType(ProviderConfigProperty.STRING_TYPE);
        senderId.setName(CONF_SENDER_ID);
        senderId.setLabel("Sender ID");
        senderId.setHelpText("Your registered SMS Sender ID (e.g., VIXVA)");
        senderId.setDefaultValue("VIXVA");

        return Arrays.asList(username, password, senderId);
    }

    @Override
    public Authenticator create(KeycloakSession session) {
        return SINGLETON;
    }

    @Override
    public void init(Config.Scope config) {
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
    }

    @Override
    public void close() {
    }

    @Override
    public String getId() {
        return PROVIDER_ID;
    }
}
