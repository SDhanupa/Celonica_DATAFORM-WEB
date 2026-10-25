#!/bin/sh
set -eu
# Clear only generated code/config caches. Never migrate, seed, or flush data.
php artisan config:clear
php artisan route:clear
php artisan event:clear
exec php-fpm
