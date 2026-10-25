package com.ceylonica.sms;

import org.jboss.logging.Logger;
import org.keycloak.Config;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventListenerProviderFactory;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public final class LoginSmsEventListenerFactory implements EventListenerProviderFactory {
    public static final String ID = "ceylonica-login-sms";
    private static final Logger LOG = Logger.getLogger(LoginSmsEventListenerFactory.class);
    private ThreadPoolExecutor executor;

    @Override public void init(Config.Scope config) {
        executor = new ThreadPoolExecutor(2, 2, 0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(256), runnable -> {
            Thread thread = new Thread(runnable, "ceylonica-sms-notification");
            thread.setDaemon(true);
            return thread;
        }, new ThreadPoolExecutor.AbortPolicy());
    }

    @Override public EventListenerProvider create(KeycloakSession session) {
        return new LoginSmsEventListener(session, notification -> executor.execute(() -> {
            boolean sent = TextWareSmsClient.sendSms(notification.gatewayUser(), notification.gatewayPassword(),
                    notification.sender(), notification.mobile(), notification.message());
            if (!sent) LOG.warn("SMS notification delivery failed; authentication remains successful");
        }));
    }

    @Override public String getId() { return ID; }
    @Override public void postInit(KeycloakSessionFactory factory) { }
    @Override public void close() {
        if (executor == null) return;
        executor.shutdown();
        try {
            if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                int pending = executor.shutdownNow().size();
                LOG.warnf("SMS notification shutdown left %d queued messages unsent", pending);
            }
        } catch (InterruptedException interrupted) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
