FROM quay.io/keycloak/keycloak:26.8.1
COPY --chown=keycloak:keycloak providers /opt/keycloak/providers
COPY --chown=keycloak:keycloak themes /opt/keycloak/themes
ENV JAVA_OPTS_APPEND="-Xms64m -Xmx256m"
RUN /opt/keycloak/bin/kc.sh build --db=postgres --health-enabled=true
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
