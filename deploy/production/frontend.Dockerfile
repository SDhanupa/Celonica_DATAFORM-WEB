FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID VITE_GRAPHQL_URL=/graphql
RUN test -n "$VITE_KEYCLOAK_URL" && test -n "$VITE_KEYCLOAK_REALM" && test -n "$VITE_KEYCLOAK_CLIENT_ID" && npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN find /usr/share/nginx/html -type d -exec chmod 755 {} + && find /usr/share/nginx/html -type f -exec chmod 644 {} +
EXPOSE 80
