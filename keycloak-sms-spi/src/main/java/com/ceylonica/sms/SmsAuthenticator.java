package com.ceylonica.sms;

import org.jboss.logging.Logger;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.Authenticator;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;

import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import java.security.SecureRandom;
import java.util.List;

public class SmsAuthenticator implements Authenticator {

    private static final Logger logger = Logger.getLogger(SmsAuthenticator.class);
    private static final String TPL_CODE = "login-sms-otp.ftl";
    private static final String AUTH_NOTE_OTP = "sms-otp-code";
    private static final String AUTH_NOTE_TIMESTAMP = "sms-otp-timestamp";
    private static final String AUTH_NOTE_ATTEMPTS = "sms-otp-attempts";

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        UserModel user = context.getUser();
        if (user == null) {
            context.failureChallenge(org.keycloak.authentication.AuthenticationFlowError.UNKNOWN_USER,
                    context.form().setError("User not found").createErrorPage(Response.Status.UNAUTHORIZED));
            return;
        }

        String mobileNumber = user.getFirstAttribute("mobile_number");
        if (mobileNumber == null || mobileNumber.trim().isEmpty()) {
            context.failureChallenge(org.keycloak.authentication.AuthenticationFlowError.INVALID_USER,
                    context.form().setError("No mobile number found for this user").createErrorPage(Response.Status.UNAUTHORIZED));
            return;
        }
        
        // Rate Limiting Check
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        String lastTimestampStr = authSession.getAuthNote(AUTH_NOTE_TIMESTAMP);
        if (lastTimestampStr != null) {
            long lastTimestamp = Long.parseLong(lastTimestampStr);
            long now = System.currentTimeMillis();
            if ((now - lastTimestamp) < 60000) { // 60 seconds cooldown
                context.challenge(context.form()
                        .setAttribute("mobile_number", mask(mobileNumber))
                        .setError("Please wait 60 seconds before requesting another code.")
                        .createForm(TPL_CODE));
                return;
            }
        }

        // Max Attempts Check
        String attemptsStr = authSession.getAuthNote(AUTH_NOTE_ATTEMPTS);
        int attempts = attemptsStr == null ? 0 : Integer.parseInt(attemptsStr);
        if (attempts >= 3) {
            context.failureChallenge(org.keycloak.authentication.AuthenticationFlowError.ACCESS_DENIED,
                    context.form().setError("Too many SMS requests. Please restart login.").createErrorPage(Response.Status.TOO_MANY_REQUESTS));
            return;
        }
        
        // Generate OTP
        String otp = String.format("%08d", new SecureRandom().nextInt(100000000));
        
        // Send SMS
        AuthenticatorConfigModel config = context.getAuthenticatorConfig();
        if (config == null || config.getConfig() == null) {
            logger.error("SMS Authenticator is missing configuration (credentials).");
            context.failureChallenge(org.keycloak.authentication.AuthenticationFlowError.INTERNAL_ERROR,
                    context.form().setError("System configuration error").createErrorPage(Response.Status.INTERNAL_SERVER_ERROR));
            return;
        }
        
        String username = config.getConfig().get(SmsAuthenticatorFactory.CONF_USERNAME);
        String password = config.getConfig().get(SmsAuthenticatorFactory.CONF_PASSWORD);
        String senderId = config.getConfig().get(SmsAuthenticatorFactory.CONF_SENDER_ID);
        String message = "Your Ceylonica login code is: " + otp;
        
        boolean sent = TextWareSmsClient.sendSms(username, password, senderId, mobileNumber, message);
        
        if (sent) {
            authSession.setAuthNote(AUTH_NOTE_OTP, otp);
            authSession.setAuthNote(AUTH_NOTE_TIMESTAMP, String.valueOf(System.currentTimeMillis()));
            authSession.setAuthNote(AUTH_NOTE_ATTEMPTS, String.valueOf(attempts + 1));
            
            context.challenge(context.form()
                    .setAttribute("mobile_number", mask(mobileNumber))
                    .createForm(TPL_CODE));
        } else {
            context.challenge(context.form()
                    .setAttribute("mobile_number", mask(mobileNumber))
                    .setError("SMS delivery delayed or failed. Please try again later.")
                    .createForm(TPL_CODE));
        }
    }

    @Override
    public void action(AuthenticationFlowContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        String enteredCode = formData.getFirst("otp");
        
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        String expectedCode = authSession.getAuthNote(AUTH_NOTE_OTP);
        
        if (expectedCode == null) {
            context.failureChallenge(org.keycloak.authentication.AuthenticationFlowError.INTERNAL_ERROR,
                    context.form().setError("Login session expired. Please restart.").createForm(TPL_CODE));
            return;
        }
        
        if (expectedCode.equals(enteredCode)) {
            // Success!
            authSession.removeAuthNote(AUTH_NOTE_OTP);
            context.success();
        } else {
            // Failure
            context.getEvent().error(org.keycloak.events.Errors.INVALID_USER_CREDENTIALS);
            Response challenge = context.form()
                    .setAttribute("mobile_number", mask(context.getUser().getFirstAttribute("mobile_number")))
                    .setError("Invalid code entered.")
                    .createForm(TPL_CODE);
            context.failureChallenge(org.keycloak.authentication.AuthenticationFlowError.INVALID_CREDENTIALS, challenge);
        }
    }

    private String mask(String mobile) {
        if (mobile == null || mobile.length() < 4) return "****";
        return "*******" + mobile.substring(mobile.length() - 4);
    }

    @Override
    public boolean requiresUser() {
        return true;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        // Technically, configured if they have a mobile number
        String mobile = user.getFirstAttribute("mobile_number");
        return mobile != null && !mobile.trim().isEmpty();
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
    }

    @Override
    public void close() {
    }
}
