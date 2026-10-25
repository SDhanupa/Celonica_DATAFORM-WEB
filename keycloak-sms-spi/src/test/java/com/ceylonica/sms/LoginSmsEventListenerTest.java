package com.ceylonica.sms;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.keycloak.events.Event;
import org.keycloak.events.EventType;
import org.keycloak.models.*;
import org.keycloak.services.managers.AuthenticationManager;
import org.keycloak.sessions.AuthenticationSessionModel;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class LoginSmsEventListenerTest {
    KeycloakSession session;
    RealmModel realm;
    UserModel user;
    AuthenticationSessionModel auth;
    LoginSmsEventListener listener;
    List<LoginSmsEventListener.Notification> delivered;
    Map<String, String> notes;
    AtomicReference<KeycloakTransaction> transaction;

    @BeforeEach void setup() {
        session = mock(KeycloakSession.class, RETURNS_DEEP_STUBS);
        realm = mock(RealmModel.class);
        user = mock(UserModel.class);
        auth = mock(AuthenticationSessionModel.class);
        delivered = new ArrayList<>();
        notes = new HashMap<>();
        transaction = new AtomicReference<>();
        when(session.getContext().getRealm()).thenReturn(realm);
        when(session.getContext().getAuthenticationSession()).thenReturn(auth);
        when(realm.getId()).thenReturn("local-realm");
        when(realm.getAttribute(LoginSmsEventListener.PREFIX + "enabled")).thenReturn("true");
        when(realm.getAttribute(LoginSmsEventListener.PREFIX + "clients")).thenReturn("celonica-frontend");
        when(realm.getAttribute(LoginSmsEventListener.PREFIX + "config-id")).thenReturn("sms-config");
        AuthenticatorConfigModel config = new AuthenticatorConfigModel();
        config.setConfig(Map.of(SmsAuthenticatorFactory.CONF_USERNAME, "gateway-user",
                SmsAuthenticatorFactory.CONF_PASSWORD, "not-a-real-secret", SmsAuthenticatorFactory.CONF_SENDER_ID, "TEST"));
        when(realm.getAuthenticatorConfigById("sms-config")).thenReturn(config);
        when(session.users().getUserById(realm, "user-1")).thenReturn(user);
        when(user.getUsername()).thenReturn("sample-user");
        when(user.getFirstAttribute("mobile_number")).thenReturn("0700000000");
        when(auth.getAuthNote(anyString())).thenAnswer(call -> notes.get(call.getArgument(0)));
        doAnswer(call -> { notes.put(call.getArgument(0), call.getArgument(1)); return null; })
                .when(auth).setAuthNote(anyString(), anyString());
        KeycloakTransactionManager manager = session.getTransactionManager();
        doAnswer(call -> { KeycloakTransaction tx = call.getArgument(0); tx.begin(); transaction.set(tx); return null; })
                .when(manager).enlistAfterCompletion(any());
        listener = new LoginSmsEventListener(session, delivered::add);
    }

    Event event(EventType type) {
        Event event = new Event();
        event.setType(type);
        event.setTime(java.time.Instant.parse("2026-10-24T20:00:00Z").toEpochMilli());
        event.setRealmId("local-realm");
        event.setUserId("user-1");
        event.setClientId("celonica-frontend");
        return event;
    }

    @Test void registrationWaitsForCommitAndUsesSriLankanDateWithoutUsername() {
        listener.onEvent(event(EventType.REGISTER));
        assertTrue(delivered.isEmpty());
        transaction.get().commit();
        assertEquals(1, delivered.size());
        assertEquals("Welcome to ceystem.com! Your registration is complete.\nDate: 2026-10-25", delivered.get(0).message());
        verify(user, never()).setSingleAttribute(any(), any());
    }

    @Test void googleRegistrationAlsoSendsOnlyOneWelcome() {
        Event registration = event(EventType.REGISTER);
        registration.setDetails(Map.of("register_method", "broker", "identity_provider", "google"));
        listener.onEvent(registration);
        listener.onEvent(event(EventType.LOGIN));
        transaction.get().commit();
        assertEquals(1, delivered.size());
        assertTrue(delivered.get(0).message().contains("registration is complete"));
    }

    @Test void signupThenLoginInAnotherRequestDoesNotSendSecondMessage() {
        listener.onEvent(event(EventType.REGISTER));
        transaction.get().commit();
        new LoginSmsEventListener(session, delivered::add).onEvent(event(EventType.LOGIN));
        assertEquals(1, delivered.size());
        verify(session.getTransactionManager(), times(1)).enlistAfterCompletion(any());
    }

    @Test void rollbackDoesNotSendNotification() {
        listener.onEvent(event(EventType.LOGIN));
        transaction.get().rollback();
        assertTrue(delivered.isEmpty());
    }

    @Test void loginWorksForPasswordSmsAndGoogleAndDeduplicatesSameAuthentication() {
        for (String method : List.of("password", "sms", "google")) {
            notes.clear();
            LoginSmsEventListener current = new LoginSmsEventListener(session, delivered::add);
            Event login = event(EventType.LOGIN);
            login.setDetails(Map.of("auth_method", method));
            current.onEvent(login);
            current.onEvent(login);
            transaction.get().commit();
        }
        assertEquals(3, delivered.size());
        assertTrue(delivered.stream().allMatch(n -> n.message().equals(
                "Welcome back to ceystem.com! You have logged in successfully.\nDate: 2026-10-25\nTime: 01:30 AM (Sri Lanka)")));
    }

    @Test void unsuccessfulAuthenticationAndTokenRefreshDoNotSend() {
        listener.onEvent(event(EventType.LOGIN_ERROR));
        listener.onEvent(event(EventType.REGISTER_ERROR));
        listener.onEvent(event(EventType.REFRESH_TOKEN));
        Event invalid = event(EventType.LOGIN);
        invalid.setError("invalid_credentials");
        listener.onEvent(invalid);
        assertNull(transaction.get());
    }

    @Test void silentSsoAndCookieReuseDoNotSend() {
        notes.put(AuthenticationManager.SSO_AUTH, "true");
        listener.onEvent(event(EventType.LOGIN));
        notes.clear();
        when(auth.getClientNote("prompt")).thenReturn("none");
        listener.onEvent(event(EventType.LOGIN));
        assertNull(transaction.get());
    }

    @Test void existingGoogleAccountLinkDoesNotSendRegistrationWelcome() {
        listener.onEvent(event(EventType.FEDERATED_IDENTITY_LINK));
        listener.onEvent(event(EventType.LOGIN));
        transaction.get().commit();
        assertEquals(1, delivered.size());
        assertTrue(delivered.get(0).message().contains("logged in successfully"));
    }

    @Test void disabledRealmAndOtherClientsDoNotSend() {
        Event other = event(EventType.LOGIN);
        other.setClientId("security-admin-console");
        listener.onEvent(other);
        when(realm.getAttribute(LoginSmsEventListener.PREFIX + "enabled")).thenReturn("false");
        listener.onEvent(event(EventType.LOGIN));
        assertNull(transaction.get());
    }

    @Test void missingPhoneOrCredentialsDoesNotBlockLogin() {
        when(user.getFirstAttribute("mobile_number")).thenReturn(null);
        assertDoesNotThrow(() -> listener.onEvent(event(EventType.LOGIN)));
        when(user.getFirstAttribute("mobile_number")).thenReturn("0700000000");
        when(realm.getAuthenticatorConfigById("sms-config")).thenReturn(null);
        assertDoesNotThrow(() -> listener.onEvent(event(EventType.LOGIN)));
        assertNull(transaction.get());
    }

    @Test void asynchronousQueueFailureDoesNotBreakCommittedLogin() {
        listener = new LoginSmsEventListener(session, n -> { throw new IllegalStateException("queue full"); });
        listener.onEvent(event(EventType.LOGIN));
        assertDoesNotThrow(() -> transaction.get().commit());
    }

    @Test void eventAndUserChangesCannotAlterQueuedPrivateSnapshot() {
        Event mutable = event(EventType.LOGIN);
        listener.onEvent(mutable);
        mutable.setType(EventType.LOGIN_ERROR);
        mutable.setTime(0);
        when(user.getFirstAttribute("mobile_number")).thenReturn("0711111111");
        transaction.get().commit();
        assertEquals("0700000000", delivered.get(0).mobile());
        assertTrue(delivered.get(0).message().contains("Date: 2026-10-25\nTime: 01:30 AM (Sri Lanka)"));
        assertFalse(delivered.get(0).toString().contains("not-a-real-secret"));
    }

    @Test void loginTimeUsesSriLankanAfternoonAndFitsOnePlainTextSms() {
        String message = LoginSmsEventListener.message(false,
                java.time.Instant.parse("2026-10-25T10:00:00Z").toEpochMilli());
        assertTrue(message.length() <= 160);
        assertTrue(message.endsWith("Date: 2026-10-25\nTime: 03:30 PM (Sri Lanka)"));
        assertTrue(message.chars().allMatch(c -> c == '\n' || (c >= 32 && c <= 126)));
    }
}
