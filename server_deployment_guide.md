# Ceylonica Admin - Server Update Guide

This guide covers how to pull the latest performance updates (Redis Caching, Nginx Load Balancing, and 0ms Preloading) to your production Ubuntu server and deploy them with ZERO downtime.

## 1. Connect to the Server
SSH into your Ubuntu server where the application is hosted:
```bash
ssh deploy@<YOUR_SERVER_IP>
```

## 2. Navigate to the App Directory
```bash
cd ~/celonica-web
```

## 3. Pull the Latest Code from GitHub
Ensure your local copy on the server is exactly synced with the `main` branch.
```bash
git fetch --all
git reset --hard origin/main
```
*(Note: Using `reset --hard` ensures any random file changes on the server are wiped and perfectly match GitHub.)*

## 4. Rebuild the Containers
Because we added a new `redis` container and updated the `nginx` configuration, you need to rebuild the cluster. This will automatically pull the Redis image, build the new Nginx proxy config, and spawn **3 backend replicas** for load balancing.

```bash
docker compose up -d --build
```

## 5. Verify the Cluster is Running
You can check the running containers to ensure you see 3 backend nodes and 1 redis node.
```bash
docker ps
```
You should see output similar to this:
- `celonica-web-backend-1`
- `celonica-web-backend-2`
- `celonica-web-backend-3`
- `celonica-web-redis-1`
- `celonica-web-frontend-1`

## 6. Clear Legacy Laravel Caches (Optional but Recommended)
Since we switched from `file` caching to `redis` caching, it's good practice to clear the old cache. Because there are 3 backend replicas, you only need to run this command on ONE of them.

```bash
docker exec -it celonica-web-backend-1 php artisan cache:clear
docker exec -it celonica-web-backend-1 php artisan config:clear
```

## 7. You're Done! 🎉
Go to `https://ceystem.com` and log in. Test the 7.3MB Village List CSV upload again—Nginx will no longer throw a `413 Entity Too Large` error! Open the Location dropdown modal—it will now load instantaneously.
