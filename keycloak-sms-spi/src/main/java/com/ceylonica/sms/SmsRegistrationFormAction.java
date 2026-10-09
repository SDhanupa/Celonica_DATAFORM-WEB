package com.ceylonica.sms;

import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormContext;
import org.keycloak.authentication.ValidationContext;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.utils.FormMessage;
import org.keycloak.sessions.AuthenticationSessionModel;
import org.jboss.logging.Logger;

import org.keycloak.userprofile.UserProfile;
import org.keycloak.userprofile.UserProfileContext;
import org.keycloak.userprofile.UserProfileProvider;

import jakarta.ws.rs.core.MultivaluedMap;
import java.util.ArrayList;
import java.util.List;

public class SmsRegistrationFormAction implements FormAction {
    private static final Logger logger = Logger.getLogger(SmsRegistrationFormAction.class);

    @Override
    public void buildPage(FormContext context, LoginFormsProvider form) {}

    @Override
    public void validate(ValidationContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        List<FormMessage> errors = new ArrayList<>();

        try {
            UserProfileProvider provider = context.getSession().getProvider(UserProfileProvider.class);
            UserProfile profile = provider.create(UserProfileContext.REGISTRATION, formData);
            
            StringBuilder requiredFields = new StringBuilder("Required Profile Attributes: ");
            profile.getAttributes().attributeSet().forEach(attr -> {
                if (attr.isRequired()) {
                    requiredFields.append(attr.getName()).append(", ");
                }
            });
            errors.add(new FormMessage("otp", requiredFields.toString()));
            context.validationError(formData, errors);
            return;
        } catch (Exception e) {
            errors.add(new FormMessage("otp", "Error dumping attributes: " + e.getMessage()));
            context.validationError(formData, errors);
            return;
        }
    }

    @Override public void success(FormContext context) {}
    @Override public boolean requiresUser() { return false; }
    @Override public boolean configuredFor(KeycloakSession s, RealmModel r, UserModel u) { return true; }
    @Override public void setRequiredActions(KeycloakSession s, RealmModel r, UserModel u) { }
    @Override public void close() { }
}

