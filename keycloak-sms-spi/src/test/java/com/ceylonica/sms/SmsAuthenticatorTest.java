package com.ceylonica.sms;

import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.events.EventBuilder;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;
import org.keycloak.http.HttpRequest;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class SmsAuthenticatorTest {
    private static class Fixture {
        final AuthenticationFlowContext context = mock(AuthenticationFlowContext.class);
        final AuthenticationSessionModel session = mock(AuthenticationSessionModel.class);
        final Map<String,String> notes = new HashMap<>();
        final MultivaluedHashMap<String,String> input = new MultivaluedHashMap<>();
        Fixture() {
            when(context.getAuthenticationSession()).thenReturn(session);
            when(session.getAuthNote(anyString())).thenAnswer(i -> notes.get(i.getArgument(0)));
            doAnswer(i -> {notes.put(i.getArgument(0),i.getArgument(1));return null;}).when(session).setAuthNote(anyString(),anyString());
            doAnswer(i -> {notes.remove(i.getArgument(0));return null;}).when(session).removeAuthNote(anyString());
            HttpRequest request = mock(HttpRequest.class);
            when(context.getHttpRequest()).thenReturn(request);
            when(request.getDecodedFormParameters()).thenReturn(input);
            UserModel user = mock(UserModel.class);
            when(context.getUser()).thenReturn(user);
            when(user.getFirstAttribute("mobile_number")).thenReturn("0700000000");
            LoginFormsProvider form = mock(LoginFormsProvider.class, RETURNS_SELF);
            when(context.form()).thenReturn(form);
            when(form.createForm(anyString())).thenReturn(mock(Response.class));
            when(form.createErrorPage(any())).thenReturn(mock(Response.class));
            when(context.getEvent()).thenReturn(mock(EventBuilder.class));
        }
        void code(String code, long age) {
            notes.put("sms-otp-code",code);
            notes.put("sms-otp-timestamp",Long.toString(System.currentTimeMillis()-age));
        }
    }
    @Test void correctCodeIsSingleUse() {
        Fixture f=new Fixture(); f.code("12345678",1000); f.input.putSingle("otp","12345678");
        new SmsAuthenticator().action(f.context);
        verify(f.context).success(); assertFalse(f.notes.containsKey("sms-otp-code"));
        new SmsAuthenticator().action(f.context);
        verify(f.context,times(1)).success(); verify(f.context).failureChallenge(any(),any());
    }
    @Test void expiredCodeIsRejected() {
        Fixture f=new Fixture(); f.code("12345678",301000); f.input.putSingle("otp","12345678");
        new SmsAuthenticator().action(f.context);
        verify(f.context,never()).success(); verify(f.context).failureChallenge(any(),any());
        assertFalse(f.notes.containsKey("sms-otp-code"));
    }
    @Test void fifthWrongCodeConsumesChallenge() {
        Fixture f=new Fixture(); f.code("12345678",1000); f.input.putSingle("otp","00000000");
        for(int i=0;i<5;i++) new SmsAuthenticator().action(f.context);
        assertFalse(f.notes.containsKey("sms-otp-code"));
        f.input.putSingle("otp","12345678");new SmsAuthenticator().action(f.context);
        verify(f.context,never()).success();
    }
    @Test void sendingAndResendingRespectCooldownWithoutRealSms() {
        Fixture f=new Fixture(); AuthenticatorConfigModel config=new AuthenticatorConfigModel();
        config.setConfig(Map.of(SmsAuthenticatorFactory.CONF_USERNAME,"fixture",SmsAuthenticatorFactory.CONF_PASSWORD,"fixture",SmsAuthenticatorFactory.CONF_SENDER_ID,"fixture"));
        when(f.context.getAuthenticatorConfig()).thenReturn(config);
        try(var sms=mockStatic(TextWareSmsClient.class)) {
            sms.when(() -> TextWareSmsClient.sendSms(anyString(),anyString(),anyString(),anyString(),anyString())).thenReturn(true);
            new SmsAuthenticator().authenticate(f.context);
            assertTrue(f.notes.get("sms-otp-code").matches("[0-9]{8}"));
            new SmsAuthenticator().authenticate(f.context);
            sms.verify(() -> TextWareSmsClient.sendSms(anyString(),anyString(),anyString(),anyString(),anyString()),times(1));
        }
    }
}
