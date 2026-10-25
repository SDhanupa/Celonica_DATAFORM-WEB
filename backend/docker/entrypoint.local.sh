#!/bin/sh
set -eu
# A fresh/shared storage volume can omit Laravel's runtime directories.
# Create them without clearing sessions, caches, uploads, or application data.
for runtime_dir in /var/www/storage/framework/views /var/www/storage/framework/sessions /var/www/storage/framework/cache/data; do
    mkdir -p "$runtime_dir"
    chown www-data:www-data "$runtime_dir"
    chmod u+rwx "$runtime_dir"
done
# Local CLI diagnostics may create log files as root in the shared volume.
# PHP-FPM runs as www-data: repair only this project's log directory/files.
mkdir -p /var/www/storage/logs
chown www-data:www-data /var/www/storage/logs
chmod u+rwx /var/www/storage/logs
find /var/www/storage/logs -maxdepth 1 -type f -name '*.log' -exec chown www-data:www-data {} +
find /var/www/storage/logs -maxdepth 1 -type f -name '*.log' -exec chmod u+rw {} +
# Docker logs remain writable regardless of which user runs a local CLI command.
export LOG_CHANNEL="${LOG_CHANNEL:-stderr}"
# Clear only generated code/config caches. Never migrate, seed, or flush data.
php artisan config:clear
php artisan route:clear
php artisan event:clear
exec php-fpm
