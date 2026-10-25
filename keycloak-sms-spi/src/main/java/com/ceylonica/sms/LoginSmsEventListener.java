package com.ceylonica.sms;

import org.jboss.logging.Logger;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventType;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.models.AbstractKeycloakTransaction;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.services.managers.AuthenticationManager;
import org.keycloak.sessions.AuthenticationSessionModel;

import java.time.Instant;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Consumer;

/** Transaction-aware notifications for successful Ceylonica browser authentication. */
public final class LoginSmsEventListener implements EventListenerProvider {
    static final String PREFIX = "ceylonica.sms-notifications.";
    static final String REGISTERED = PREFIX + "registered";
    static final String LOGIN_QUEUED = PREFIX + "login-queued";
    private static final Logger LOG = Logger.getLogger(LoginSmsEventListener.class);
    private final KeycloakSession session;
    private final Consumer<Notification> dispatcher;
    private final Map<String, Notification> pending = new LinkedHashMap<>();
    private boolean enlisted;

    // Only immutable values cross the transaction/thread boundary. Never retain user/session models.
    record Notification(String gatewayUser, String gatewayPassword, String sender,
                        String mobile, String message) {
        @Override public String toString() { return "SMS notification [private]"; }
    }

    LoginSmsEventListener(KeycloakSession session, Consumer<Notification> dispatcher) {
        this.session = session;
        this.dispatcher = dispatcher;
    }

    @Override public void onEvent(Event event) {
        if (event.getError() != null || (event.getType() != EventType.REGISTER && event.getType() != EventType.LOGIN)) return;
        try {
            enqueue(event);
        } catch (RuntimeException failure) {
            // Notifications must never break account creation or authentication. Do not log PII or secrets.
            LOG.warnf("SMS notification could not be prepared (%s)", failure.getClass().getSimpleName());
        }
    }

    private void enqueue(Event event) {
        RealmModel realm = session.getContext().getRealm();
        if (realm == null || !realm.getId().equals(event.getRealmId())
                || !Boolean.parseBoolean(realm.getAttribute(PREFIX + "enabled"))) return;
        String clients = realm.getAttribute(PREFIX + "clients");
        if (clients == null || Arrays.stream(clients.split(",")).map(String::trim).noneMatch(c -> !c.isEmpty() && c.equals(event.getClientId()))) return;
        if (event.getUserId() == null) return;

        AuthenticationSessionModel auth = session.getContext().getAuthenticationSession();
        boolean registration = event.getType() == EventType.REGISTER;
        if (!registration && auth != null) {
            // A fresh successful authentication is different from silent check-sso / cookie reuse.
            if ("true".equals(auth.getAuthNote(AuthenticationManager.SSO_AUTH))
                    || "none".equals(auth.getClientNote("prompt"))
                    || event.getUserId().equals(auth.getAuthNote(REGISTERED))
                    || "true".equals(auth.getAuthNote(LOGIN_QUEUED))) return;
        }
        String key = event.getUserId() + ":" + event.getClientId();
        if (!registration && pending.containsKey("register:" + key)) return;

        UserModel user = session.users().getUserById(realm, event.getUserId());
        if (user == null || user.getServiceAccountClientLink() != null) return;
        String mobile = user.getFirstAttribute("mobile_number");
        if (mobile == null || !mobile.trim().matches("^(?:0[0-9]{9}|\\+?94[0-9]{9})$")) {
            LOG.warn("SMS notification skipped: account has no valid mobile number");
            return;
        }
        String configId = realm.getAttribute(PREFIX + "config-id");
        AuthenticatorConfigModel config = configId == null ? null : realm.getAuthenticatorConfigById(configId);
        if (config == null || config.getConfig() == null) {
            LOG.warn("SMS notification skipped: gateway configuration is missing");
            return;
        }
        Map<String, String> settings = config.getConfig();
        String gatewayUser = settings.get(SmsAuthenticatorFactory.CONF_USERNAME);
        String password = settings.get(SmsAuthenticatorFactory.CONF_PASSWORD);
        String sender = settings.get(SmsAuthenticatorFactory.CONF_SENDER_ID);
        if (blank(gatewayUser) || blank(password) || blank(sender)) {
            LOG.warn("SMS notification skipped: gateway configuration is incomplete");
            return;
        }

        pending.put((registration ? "register:" : "login:") + key,
                new Notification(gatewayUser, password, sender, mobile.trim(), message(user.getUsername(), registration, event.getTime())));
        if (registration) {
            pending.remove("login:" + key);
            if (auth != null) auth.setAuthNote(REGISTERED, event.getUserId());
        } else if (auth != null) {
            auth.setAuthNote(LOGIN_QUEUED, "true");
        }
        if (!enlisted) {
            session.getTransactionManager().enlistAfterCompletion(new AbstractKeycloakTransaction() {
                @Override protected void commitImpl() {
                    for (Notification notification : pending.values()) {
                        try { dispatcher.accept(notification); }
                        catch (RuntimeException failure) {
                            LOG.warnf("SMS notification could not be queued (%s)", failure.getClass().getSimpleName());
                        }
                    }
                    pending.clear();
                }
                @Override protected void rollbackImpl() { pending.clear(); }
            });
            enlisted = true;
        }
    }

    static String message(String username, boolean registration, long eventTime) {
        if (registration) {
            String date = Instant.ofEpochMilli(eventTime).atZone(ZoneId.of("Asia/Colombo")).toLocalDate().toString();
            return "Welcome to ceystem.com! Your registration is complete.\nDate: " + date;
        }
        String name = blank(username) ? "user" : username.replaceAll("[\\p{Cntrl}\\s]+", " ").trim();
        if (name.length() > 40) name = name.substring(0, 40);
        return "Welcome to ceystem.com, " + name + ". You have logged in successfully.";
    }

    private static boolean blank(String value) { return value == null || value.isBlank(); }
    @Override public void onEvent(AdminEvent event, boolean includeRepresentation) { }
    @Override public void close() { }
}
