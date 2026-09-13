# Server Deployment and Migration Summary

Here is a summary of the steps we took to successfully migrate the database, fix the build, and configure the new `ceystem.com` domains on the server.

## 1. Database Restoration
The database was split into 3 parts due to GitHub limits. We successfully merged and restored the 306MB dump into the container.
```bash
# Merging the dumps
cat ~/celonica-web/db_parts/celonica_db.part0 \
    ~/celonica-web/db_parts/celonica_db.part1 \
    ~/celonica-web/db_parts/celonica_db.part2 | gunzip > /tmp/celonica_full.sql

# Restoring inside the Docker container
docker cp /tmp/celonica_full.sql celonica-web-postgres:/tmp/celonica_full.sql
docker exec celonica-web-postgres psql -U celonica_user -d postgres -c "DROP DATABASE IF EXISTS celonica_db;"
docker exec celonica-web-postgres psql -U celonica_user -d postgres -c "CREATE DATABASE celonica_db;"
docker exec celonica-web-postgres psql -U celonica_user -d celonica_db -f /tmp/celonica_full.sql
```

## 2. Frontend Build Fix
The `docker compose build frontend` failed because of a peer dependency conflict in `@mui/x-data-grid`. 
**Fix:** We updated the `frontend/Dockerfile` to use `npm install --legacy-peer-deps`.

## 3. Nginx and Network Setup
The server had an existing project (`form_builder`) with an Nginx container (`form_builder_nginx`) already holding port 80 and 443. We used this container to route traffic for both projects.
```bash
# Connect the old Nginx proxy to the new project's network
docker network connect celonica-web-network form_builder_nginx
```

## 4. SSL Certificates (Certbot)
We created a temporary configuration for Nginx to serve the `.well-known/acme-challenge/` directory so Certbot could verify the domains.
```bash
# Generate the certificates
sudo certbot certonly --webroot -w /var/www/certbot -d ceystem.com -d www.ceystem.com -d back.ceystem.com -d auth.ceystem.com
```

## 5. Final Nginx Configuration (`ceystem.conf`)
We placed the final configuration in `/home/deploy/app/nginx/ceystem.conf` to proxy traffic securely.
```nginx
server {
    listen 80;
    server_name ceystem.com www.ceystem.com back.ceystem.com auth.ceystem.com;

    # Keep this so certificates can renew automatically
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other HTTP traffic to secure HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ceystem.com www.ceystem.com back.ceystem.com;

    ssl_certificate     /etc/letsencrypt/live/ceystem.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ceystem.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Send frontend and backend traffic to the celonica frontend container
    location / {
        proxy_pass          http://celonica-web-frontend:80;
        proxy_set_header    Host                $host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto   https;
        proxy_read_timeout  120s;
    }
}

server {
    listen 443 ssl;
    server_name auth.ceystem.com;

    ssl_certificate     /etc/letsencrypt/live/ceystem.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ceystem.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Send auth traffic to the Keycloak container
    location / {
        proxy_pass              http://celonica-web-keycloak:8080;
        proxy_set_header        Host                $host;
        proxy_set_header        X-Real-IP           $remote_addr;
        proxy_set_header        X-Forwarded-For     $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto   https;
        proxy_buffer_size       128k;
        proxy_buffers           4 256k;
        proxy_busy_buffers_size 256k;
    }
}
```

## 6. Keycloak `Invalid parameter: redirect_uri` Fix
To fix the login error, Keycloak needed the correct Web Origins and Redirect URIs set up in the Admin Console.
1. Log into `https://auth.ceystem.com` as admin.
2. Select realm **`celonica-admin`**.
3. Go to **Clients** > **`celonica-frontend`**.
4. In **Valid redirect URIs**, add `https://ceystem.com/*` and `https://ceystem.com/`.
5. In **Web origins**, add `+`.
6. Click **Save**.
