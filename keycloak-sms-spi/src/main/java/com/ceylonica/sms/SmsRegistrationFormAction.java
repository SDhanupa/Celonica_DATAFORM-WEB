package com.ceylonica.sms;

import org.jboss.logging.Logger;
import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormContext;
import org.keycloak.authentication.ValidationContext;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.utils.FormMessage;
import org.keycloak.policy.PasswordPolicyManagerProvider;
import org.keycloak.policy.PolicyError;
import org.keycloak.sessions.AuthenticationSessionModel;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

import jakarta.ws.rs.core.MultivaluedMap;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

public class SmsRegistrationFormAction implements FormAction {

    private static final Logger logger = Logger.getLogger(SmsRegistrationFormAction.class);

    // AuthNote keys — all stored server-side, never lost between steps
    private static final String NOTE_OTP         = "sms-reg-otp";
    private static final String NOTE_PENDING      = "sms-reg-otp-pending";
    private static final String NOTE_PASSWORD     = "sms-reg-password";
    private static final String NOTE_FIRST        = "sms-reg-firstName";
    private static final String NOTE_LAST         = "sms-reg-lastName";
    private static final String NOTE_EMAIL        = "sms-reg-email";
    private static final String NOTE_USERNAME     = "sms-reg-username";
    private static final String NOTE_NIC          = "sms-reg-nic";
    private static final String NOTE_MOBILE       = "sms-reg-mobile";

    @Override
    public void buildPage(FormContext context, LoginFormsProvider form) {
        AuthenticationSessionModel s = context.getAuthenticationSession();
        if (!"true".equals(s.getAuthNote(NOTE_PENDING))) return;

        // Inject ALL saved Step-1 data as FTL attributes for the OTP page
        form.setAttribute("otpPending",   "true");
        setAttribute(form, "savedFirstName", s.getAuthNote(NOTE_FIRST));
        setAttribute(form, "savedLastName",  s.getAuthNote(NOTE_LAST));
        setAttribute(form, "savedEmail",     s.getAuthNote(NOTE_EMAIL));
        setAttribute(form, "savedUsername",  s.getAuthNote(NOTE_USERNAME));
        setAttribute(form, "savedNic",       s.getAuthNote(NOTE_NIC));
        setAttribute(form, "savedMobile",    s.getAuthNote(NOTE_MOBILE));
        setAttribute(form, "savedPassword",  s.getAuthNote(NOTE_PASSWORD));
    }

    private void setAttribute(LoginFormsProvider form, String key, String value) {
        if (value != null) form.setAttribute(key, value);
    }

    @Override
    public void validate(ValidationContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        AuthenticationSessionModel s = context.getAuthenticationSession();
        List<FormMessage> errors = new ArrayList<>();

        String enteredOtp = formData.getFirst("otp");

        // ── STEP 2: OTP verification ──────────────────────────────────────
        if (enteredOtp != null && !enteredOtp.trim().isEmpty()) {
            String expected = s.getAuthNote(NOTE_OTP);
            logger.infof("OTP Step 2 - entered: '%s', expected: '%s'", enteredOtp.trim(), expected);

            if (expected != null && expected.equals(enteredOtp.trim())) {
                // Clear all our notes
                clearNotes(s);
                context.success();
            } else {
                errors.add(new FormMessage("otp", "Invalid OTP. Please try again."));
                context.validationError(formData, errors);
            }
            return;
        }

        // ── STEP 1: Validate fields and send OTP ─────────────────────────

        // Reset any stale OTP state so a failed Step 1 never shows the OTP screen
        clearNotes(s);

        // 0. Reject duplicate username / email BEFORE sending any SMS
        RealmModel realm = context.getRealm();
        KeycloakSession session = context.getSession();
        String email = trimToNull(formData.getFirst("email"));
        String username = realm.isRegistrationEmailAsUsername()
                ? email : trimToNull(formData.getFirst("username"));

        if (username != null && session.users().getUserByUsername(realm, username) != null) {
            errors.add(new FormMessage(realm.isRegistrationEmailAsUsername() ? "email" : "username",
                    realm.isRegistrationEmailAsUsername() ? "emailExistsMessage" : "usernameExistsMessage"));
        }
        if (email != null && !realm.isDuplicateEmailsAllowed()
                && session.users().getUserByEmail(realm, email) != null
                && !realm.isRegistrationEmailAsUsername()) {
            errors.add(new FormMessage("email", "emailExistsMessage"));
        }
        if (!errors.isEmpty()) {
            context.validationError(formData, errors);
            return;
        }

        // 1. Validate Password first!
        String password = formData.getFirst("password");
        String passwordConfirm = formData.getFirst("password-confirm");
        
        if (password == null || password.trim().isEmpty()) {
            errors.add(new FormMessage("password", "missingPasswordMessage"));
            context.validationError(formData, errors);
            return;
        }
        if (!password.equals(passwordConfirm)) {
            errors.add(new FormMessage("password-confirm", "notMatchPasswordMessage"));
            context.validationError(formData, errors);
            return;
        }
        
        // Create a dummy UserModel proxy to prevent NullPointerException in Password Policy evaluation
        UserModel dummyUser = (UserModel) Proxy.newProxyInstance(
            UserModel.class.getClassLoader(),
            new Class[] { UserModel.class },
            new InvocationHandler() {
                @Override
                public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                    if (method.getName().equals("getUsername")) {
                        return formData.getFirst("username");
                    }
                    if (method.getReturnType().equals(boolean.class)) {
                        return false;
                    }
                    return null;
                }
            }
        );

        PolicyError policyError = context.getSession().getProvider(PasswordPolicyManagerProvider.class)
                .validate(context.getRealm(), dummyUser, password);
        if (policyError != null) {
            errors.add(new FormMessage("password", policyError.getMessage(), policyError.getParameters()));
            context.validationError(formData, errors);
            return;
        }

                String mobile    = context.getHttpRequest().getDecodedFormParameters().getFirst("mobile_number");
        String nic       = context.getHttpRequest().getDecodedFormParameters().getFirst("nic");
        String firstName = context.getHttpRequest().getDecodedFormParameters().getFirst("firstName");
        String lastName  = context.getHttpRequest().getDecodedFormParameters().getFirst("lastName");
        String email     = context.getHttpRequest().getDecodedFormParameters().getFirst("email");
        String username  = context.getHttpRequest().getDecodedFormParameters().getFirst("username");
        String password  = context.getHttpRequest().getDecodedFormParameters().getFirst("password");

        // PREVENT PREMATURE SMS: If any required field is empty, another validator will fail. Do not send SMS yet.
        if (isBlank(mobile) || isBlank(nic) || isBlank(firstName) || isBlank(lastName) || isBlank(email) || isBlank(username) || isBlank(password)) {
            return;
        }

        AuthenticatorConfigModel config = context.getRealm().getAuthenticatorConfigsStream()
                .filter(c -> c.getConfig() != null
                        && c.getConfig().containsKey(SmsAuthenticatorFactory.CONF_USERNAME))
                .findFirst().orElse(null);

        if (config != null && mobile != null && !mobile.isEmpty()) {
            String fullName = ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
            TextWareSmsClient.sendSms(
                    config.getConfig().get(SmsAuthenticatorFactory.CONF_USERNAME),
                    config.getConfig().get(SmsAuthenticatorFactory.CONF_PASSWORD),
                    config.getConfig().get(SmsAuthenticatorFactory.CONF_SENDER_ID),
                    mobile.trim(),
                    "Welcome to Ceylonica, " + fullName + "! Your registration is complete."
            );
        }
    }

    private void clearNotes(AuthenticationSessionModel s) {
        for (String k : new String[]{NOTE_OTP, NOTE_PENDING, NOTE_PASSWORD,
                NOTE_FIRST, NOTE_LAST, NOTE_EMAIL, NOTE_USERNAME, NOTE_NIC, NOTE_MOBILE}) {
            s.removeAuthNote(k);
        }
    }

    private String nvl(String v) { return v != null ? v : ""; }

    private String trimToNull(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }

    @Override public boolean requiresUser() { return false; }
    @Override public boolean configuredFor(KeycloakSession s, RealmModel r, UserModel u) { return true; }
    @Override public void setRequiredActions(KeycloakSession s, RealmModel r, UserModel u) {}
    @Override public void close() {}
}

