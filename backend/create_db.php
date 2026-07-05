<?php
try {
    $pdo = new PDO('pgsql:host=127.0.0.1;port=5432', 'postgres', 'dhanu231');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if database exists
    $stmt = $pdo->query("SELECT 1 FROM pg_database WHERE datname = 'celonica_db'");
    if ($stmt->fetch()) {
        echo "Database 'celonica_db' already exists.\n";
    } else {
        $pdo->exec('CREATE DATABASE celonica_db');
        echo "Database 'celonica_db' created successfully!\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
