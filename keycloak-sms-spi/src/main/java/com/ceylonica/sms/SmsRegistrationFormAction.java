package com.ceylonica.sms;

import org.jboss.logging.Logger;
import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormContext;
import org.keycloak.authentication.ValidationContext;
import org.keycloak.events.Errors;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.utils.FormMessage;

import jakarta.ws.rs.core.MultivaluedMap;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

public class SmsRegistrationFormAction implements FormAction {

    private static final Logger logger = Logger.getLogger(SmsRegistrationFormAction.class);
    private static final String AUTH_NOTE_REG_OTP = "sms-reg-otp";

    @Override
    public void buildPage(FormContext context, LoginFormsProvider form) {
        // Nothing special to add to the first registration page built by Keycloak
    }

    @Override
    public void validate(ValidationContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        List<FormMessage> errors = new ArrayList<>();

        String mobileNumber = formData.getFirst("user.attributes.mobile_number");
        
        if (mobileNumber == null || mobileNumber.trim().isEmpty()) {
            errors.add(new FormMessage("user.attributes.mobile_number", "Mobile number is required."));
            context.validationError(formData, errors);
            return;
        }

        // Check if OTP was submitted (meaning we are on step 2 of registration)
        String enteredOtp = formData.getFirst("otp");
        if (enteredOtp != null && !enteredOtp.isEmpty()) {
            String expectedOtp = context.getAuthenticationSession().getAuthNote(AUTH_NOTE_REG_OTP);
            if (expectedOtp != null && expectedOtp.equals(enteredOtp)) {
                // OTP is correct! Clear note and succeed.
                context.getAuthenticationSession().removeAuthNote(AUTH_NOTE_REG_OTP);
                context.success();
                return;
            } else {
                errors.add(new FormMessage("otp", "Invalid OTP entered."));
                context.validationError(formData, errors);
                return;
            }
        }

        // If no OTP was submitted, we need to send one and challenge the user
        String otp = String.format("%08d", new SecureRandom().nextInt(100000000));
        
        // We will pull the TextWare credentials from the Realm's Authenticator Config 
        // Note: For a FormAction, getting config is slightly trickier if not explicitly bound.
        // We assume the user has bound the config to the SMS Authenticator somewhere in the realm, 
        // or we can just pull it directly via a known alias if needed. For simplicity, if config is null here,
        // we might fail. To make it robust, you can fetch the AuthenticatorConfigModel from the realm.
        AuthenticatorConfigModel config = null;
        if (context.getRealm().getAuthenticatorConfigsStream() != null) {
            config = context.getRealm().getAuthenticatorConfigsStream()
                .filter(c -> c.getConfig() != null && c.getConfig().containsKey(SmsAuthenticatorFactory.CONF_USERNAME))
                .findFirst()
                .orElse(null);
        }

        if (config == null) {
            logger.error("TextWare configuration not found in realm.");
            errors.add(new FormMessage(null, "System configuration error. SMS disabled."));
            context.validationError(formData, errors);
            return;
        }

        String username = config.getConfig().get(SmsAuthenticatorFactory.CONF_USERNAME);
        String password = config.getConfig().get(SmsAuthenticatorFactory.CONF_PASSWORD);
        String senderId = config.getConfig().get(SmsAuthenticatorFactory.CONF_SENDER_ID);
        String message = "Ceylonica registration - please verify your number. Your 8-digit verification code is: " + otp + ". This code is secure and valid for one use only.";

        boolean sent = TextWareSmsClient.sendSms(username, password, senderId, mobileNumber, message);

        if (sent) {
            context.getAuthenticationSession().setAuthNote(AUTH_NOTE_REG_OTP, otp);
            // Challenge the user to enter the OTP by reloading the form but flagging it requires OTP
            context.getAuthenticationSession().setAuthNote("REQUIRE_REG_OTP", "true");
            
            // In a standard FormAction, validationError forces the form to reload with our data.
            // We use this trick to show the OTP field on the same register.ftl page.
            errors.add(new FormMessage("otp", "An 8-digit code has been sent to your mobile."));
            context.validationError(formData, errors);
        } else {
            errors.add(new FormMessage("user.attributes.mobile_number", "Failed to send SMS to this number."));
            context.validationError(formData, errors);
        }
    }

    @Override
    public void success(FormContext context) {
        // Validation already verified the OTP. We just need to save the mobile number if it wasn't saved by the profile.
        // Keycloak's new declarative user profile actually handles saving user.attributes.mobile_number automatically.
    }

    @Override
    public boolean requiresUser() {
        return false; // User doesn't exist yet!
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return true;
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
    }

    @Override
    public void close() {
    }
}
