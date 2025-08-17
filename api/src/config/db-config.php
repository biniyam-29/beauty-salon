<?php
// src/config/db-config.php

// --- DATABASE SWITCH ---
// Change this to 'mysql' for production or 'sqlite' for development.
define('DB_DRIVER', 'mysql'); 

// --- DATABASE CREDENTIALS ---

// SQLite Configuration
define('DB_PATH', __DIR__ . '/../../db/schema.sql');

// MySQL Configuration (for future use)
define('DB_HOST', '');
define('DB_NAME', '');
define('DB_USER', '');
define('DB_PASS', ''); 

// --- ESTABLISH CONNECTION ---

$dsn = ''; // Data Source Name
$pdo = null;

try {
    switch (DB_DRIVER) {
        case 'sqlite':
            $dsn = 'sqlite:' . DB_PATH;
            $pdo = new PDO($dsn);
            break;

        case 'mysql':
            // The connection logic for MySQL will try to create the database if it doesn't exist.
            // This requires the user to have CREATE privileges.
            $pdo_init = new PDO('mysql:host=' . DB_HOST, DB_USER, DB_PASS);
            $pdo_init->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo_init->exec('CREATE DATABASE IF NOT EXISTS ' . DB_NAME);

            // Now connect to the specific database.
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS);
            break;
        
        default:
            die("Error: Invalid database driver specified.");
    }

    // Set common PDO attributes for consistent behavior across drivers.
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // If the connection fails, stop the script and display an error message.
    // In a production environment, you would log this error instead of displaying it.
    die("Database connection failed: " . $e->getMessage());
}

// The $pdo variable is now available for use in any file that includes this one.
?>
