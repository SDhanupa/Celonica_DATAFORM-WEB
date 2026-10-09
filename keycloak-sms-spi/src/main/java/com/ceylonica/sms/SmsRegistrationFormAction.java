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
import org.keycloak.policy.PasswordPolicyManagerProvider;
import org.keycloak.policy.PolicyError;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

import jakarta.ws.rs.core.MultivaluedMap;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

public class SmsRegistrationFormAction implements FormAction {
    private static final Logger logger = Logger.getLogger(SmsRegistrationFormAction.class);

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

        // STEP 2: OTP verification
        if (enteredOtp != null && !enteredOtp.trim().isEmpty()) {
            String expected = s.getAuthNote(NOTE_OTP);
            if (expected != null && expected.equals(enteredOtp.trim())) {
                clearNotes(s);
                context.success();
            } else {
                errors.add(new FormMessage("otp", "Invalid OTP. Please try again."));
                context.validationError(formData, errors);
            }
            return;
        }

        // STEP 1: Validate fields and send OTP
        clearNotes(s);

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

        UserModel dummyUser = (UserModel) Proxy.newProxyInstance(
            UserModel.class.getClassLoader(),
            new Class[] { UserModel.class },
            new InvocationHandler() {
                @Override
                public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                    if (method.getName().equals("getUsername")) return formData.getFirst("username");
                    if (method.getReturnType().equals(boolean.class)) return false;
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

        String mobile = formData.getFirst("mobile_number");
        String nic = formData.getFirst("nic");

        // BYPASS CUSTOM VALIDATION
        // if (mobile == null || mobile.trim().isEmpty()) { ... }
        // if (nic == null || !nic.matches(...)) { ... }

        AuthenticatorConfigModel config = context.getRealm().getAuthenticatorConfigsStream()
                .filter(c -> c.getConfig() != null && c.getConfig().containsKey(SmsAuthenticatorFactory.CONF_USERNAME))
                .findFirst().orElse(null);

        if (config == null) {
            errors.add(new FormMessage(null, "System error: SMS not configured."));
            context.validationError(formData, errors);
            return;
        }

        String otp = String.format("%08d", new SecureRandom().nextInt(100000000));
        
        String smsUser  = config.getConfig().get(SmsAuthenticatorFactory.CONF_USERNAME);
        String smsPw    = config.getConfig().get(SmsAuthenticatorFactory.CONF_PASSWORD);
        String smsSrc   = config.getConfig().get(SmsAuthenticatorFactory.CONF_SENDER_ID);
        String msg      = "Ceylonica verification code: " + otp + ". Valid for one use only.";

        // BYPASS ACTUAL SMS SENDING IF MOBILE IS EMPTY (so we don't crash)
        if (mobile != null && !mobile.trim().isEmpty()) {
            boolean sent = TextWareSmsClient.sendSms(smsUser, smsPw, smsSrc, mobile.trim(), msg);
            if (!sent) {
                errors.add(new FormMessage("mobile_number", "SMS send failed. Please try again."));
                context.validationError(formData, errors);
                return;
            }
        }

        s.setAuthNote(NOTE_OTP,      otp);
        s.setAuthNote(NOTE_PENDING,  "true");
        s.setAuthNote(NOTE_FIRST,    nvl(formData.getFirst("firstName")));
        s.setAuthNote(NOTE_LAST,     nvl(formData.getFirst("lastName")));
        s.setAuthNote(NOTE_EMAIL,    nvl(formData.getFirst("email")));
        s.setAuthNote(NOTE_USERNAME, nvl(formData.getFirst("username")));
        s.setAuthNote(NOTE_NIC,      nvl(nic));
        s.setAuthNote(NOTE_MOBILE,   nvl(mobile != null ? mobile.trim() : ""));
        s.setAuthNote(NOTE_PASSWORD, nvl(formData.getFirst("password")));

        errors.add(new FormMessage("otp", "An 8-digit code has been sent to your mobile."));
        context.validationError(formData, errors);
    }

    @Override
    public void success(FormContext context) {
        AuthenticationSessionModel s = context.getAuthenticationSession();
        String mobile = s.getAuthNote(NOTE_MOBILE);
        String firstName = s.getAuthNote(NOTE_FIRST);
        String lastName = s.getAuthNote(NOTE_LAST);
        clearNotes(s);
    }

    private void clearNotes(AuthenticationSessionModel s) {
        for (String k : new String[]{NOTE_OTP, NOTE_PENDING, NOTE_PASSWORD,
                NOTE_FIRST, NOTE_LAST, NOTE_EMAIL, NOTE_USERNAME, NOTE_NIC, NOTE_MOBILE}) {
            s.removeAuthNote(k);
        }
    }
    private String nvl(String v) { return v != null ? v : ""; }

    @Override public boolean requiresUser() { return false; }
    @Override public boolean configuredFor(KeycloakSession s, RealmModel r, UserModel u) { return true; }
    @Override public void setRequiredActions(KeycloakSession s, RealmModel r, UserModel u) { }
    @Override public void close() { }
}
