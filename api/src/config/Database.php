<?php
namespace src\config;

use PDO;
use PDOException;

/**
 * Manages the database connection using the Singleton pattern.
 * This ensures that there is only one instance of the PDO connection.
 */
class Database {
    // --- Database Credentials ---
    private static string $host = 'localhost';
    private static string $db_name = 'skin_clinic_db';
    private static string $username = 'root';
    private static string $password = ''; // Your MySQL password

    // Holds the single instance of the database connection
    private static ?PDO $conn = null;

    /**
     * The constructor is private to prevent creating a new instance of the
     * class with the 'new' operator from outside of this class.
     */
    private function __construct() {}

    /**
     * Gets the single instance of the database connection.
     * If a connection does not exist, it creates one.
     *
     * @return PDO The database connection instance.
     */
    public static function connect(): PDO {
        // Check if an instance of the connection already exists
        if (self::$conn === null) {
            try {
                // First, connect to the MySQL server to create the database if it doesn't exist.
                // This requires the MySQL user to have CREATE DATABASE privileges.
                $pdo_init = new PDO('mysql:host=' . self::$host, self::$username, self::$password);
                $pdo_init->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $pdo_init->exec('CREATE DATABASE IF NOT EXISTS ' . self::$db_name);

                // Now, establish the persistent connection to the specific database.
                $dsn = 'mysql:host=' . self::$host . ';dbname=' . self::$db_name . ';charset=utf8mb4';
                self::$conn = new PDO($dsn, self::$username, self::$password);

                // Set common PDO attributes for consistent behavior and error handling.
                self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            } catch (PDOException $e) {
                // In a real application, you would log this error instead of killing the script.
                die('Database Connection Error: ' . $e->getMessage());
            }
        }
        
        // Return the existing connection instance
        return self::$conn;
    }
}
?>
