package com.ceylonica.sms;

import org.junit.jupiter.api.Test;
import org.keycloak.authentication.FormContext;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;
import org.keycloak.userprofile.UserProfileProvider;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class SmsRegistrationFormActionTest {
    @Test void verifiedRegistrationPreservesOriginalNamesBeforeClearingNotes() {
        FormContext context = mock(FormContext.class);
        AuthenticationSessionModel auth = mock(AuthenticationSessionModel.class);
        KeycloakSession session = mock(KeycloakSession.class);
        UserModel user = mock(UserModel.class);
        UserProfileProvider profiles = mock(UserProfileProvider.class);
        when(context.getAuthenticationSession()).thenReturn(auth);
        when(context.getSession()).thenReturn(session);
        when(context.getUser()).thenReturn(user);
        when(session.getProvider(UserProfileProvider.class)).thenReturn(profiles);
        when(auth.getAuthNote("sms-reg-firstName")).thenReturn(" Local ");
        when(auth.getAuthNote("sms-reg-lastName")).thenReturn(" Regression ");
        when(auth.getAuthNote("sms-reg-mobile")).thenReturn("0700000000");
        when(auth.getAuthNote("sms-reg-nic")).thenReturn("198812345679");
        new SmsRegistrationFormAction().success(context);
        verify(user).setFirstName("Local");
        verify(user).setLastName("Regression");
        verify(user).setSingleAttribute("mobile_number", "0700000000");
        verify(user).setSingleAttribute("nic", "198812345679");
        verify(auth).removeAuthNote("sms-reg-firstName");
        verify(auth).removeAuthNote("sms-reg-password");
    }

    @Test void missingRegistrationUserCannotBeWritten() {
        FormContext context = mock(FormContext.class);
        when(context.getAuthenticationSession()).thenReturn(mock(AuthenticationSessionModel.class));
        assertThrows(IllegalStateException.class, () -> new SmsRegistrationFormAction().success(context));
    }
}
