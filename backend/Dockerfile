FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libpq-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (including pgsql for PostgreSQL)
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application code
COPY . /var/www

# Install composer dependencies
RUN composer install --optimize-autoloader --no-dev

# Ensure permissions
RUN mkdir -p /var/www/public/uploads
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/public/uploads
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/public/uploads

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["sh", "-c", "echo 'memory_limit=512M\nupload_max_filesize=60M\npost_max_size=60M' > /usr/local/etc/php/conf.d/custom-limits.ini && composer install --optimize-autoloader --no-dev && php artisan optimize && php-fpm"]
