<?php
namespace src\modules\auth\guards;

require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once __DIR__ . '/../../../config/auth-constants.php';
require_once __DIR__ . '/../../../config/Database.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use src\common\constants\AuthConstants;
use src\config\Database;
use Exception;
use PDO;

class AuthGuard {
    private static $conn = null;

    private function __construct() {
        AuthConstants::initialize();
    }

    private static function ensureDbConnection() {
        if (self::$conn === null) {
            self::$conn = Database::connect();
        }
    }

    public static function authenticate($caller = null) {
        self::ensureDbConnection();
        AuthConstants::initialize(); 

        // 1. Check Authorization header
        if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            http_response_code(401);
            return false;
        }

        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        $token = str_replace("Bearer ", "", $authHeader);
        if (empty($token)) {
            http_response_code(401);
            return false;
        }

        try {
            $decoded = JWT::decode($token, new Key(AuthConstants::$secretKey, 'HS256'));

            if (!isset($decoded->data) || !isset($decoded->data->id)) {
                http_response_code(401);
                return false;
            }

            $userId = $decoded->data->id;

            // 3. Check user in DB
            $user = self::read("users", "id", $userId);
            if (empty($user)) {
                http_response_code(401);
                return false;
            }

            // 4. Check if user is active
            if ($user['is_active'] == 0 && $user['role'] !== 'OWNER' && $caller !== "newUser") {
                http_response_code(401);
                return false;
            }

            if (!self::validateToken($token, $userId)) {
                http_response_code(401);
                return false;
            }
            if ($caller === "guard") {
                return $decoded->data;
            }

            return true;
        } catch (Exception $e) {
            http_response_code(401);
            return false;
        }
    }
    private static function validateToken($token, $id) {
        self::ensureDbConnection();
        try {
            $sql = 'SELECT token FROM token WHERE userId = ? AND token = ?';
            $stmt = self::$conn->prepare($sql);
            $stmt->execute([$id, $token]);
            $userToken = $stmt->fetch(PDO::FETCH_ASSOC);
            return (bool) $userToken;
        } catch (Exception $e) {
            return false;
        }
    }

    private static function read($table, $column = 'id', $value = null) {
        try {
            $sql = "SELECT * FROM $table WHERE $column = :value";
            $stmt = self::$conn->prepare($sql);
            $stmt->bindParam(':value', $value);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return null;
        }
    }
}
?>
