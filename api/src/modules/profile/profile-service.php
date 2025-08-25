<?php
namespace src\modules\profile;

require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ProfileService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Fetches the profile of the currently logged-in user.
     */
    public function getMyProfile(int $userId): string {
        try {
            $stmt = $this->conn->prepare("SELECT id, name, email, phone, role FROM users WHERE id = :id");
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(404);
                return json_encode(['error' => 'User not found.']);
            }

            return json_encode($user);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates the profile of the currently logged-in user.
     */
    public function updateMyProfile(int $userId, string $body): string {
        $data = json_decode($body, true);
        if (empty($data)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No data provided.']);
        }

        // --- PASSWORD VERIFICATION (if password is being changed) ---
        if (isset($data['password']) && !empty($data['password'])) {
            if (!isset($data['current_password']) || empty($data['current_password'])) {
                http_response_code(400);
                return json_encode(['error' => 'Current password is required to set a new one.']);
            }

            // Get the current user's hashed password from the DB
            $stmt = $this->conn->prepare("SELECT password_hash FROM users WHERE id = :id");
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($data['current_password'], $user['password_hash'])) {
                http_response_code(401);
                return json_encode(['error' => 'Incorrect current password.']);
            }
        }
        // --- END OF PASSWORD VERIFICATION ---

        $allowedFields = ['name', 'email', 'phone', 'password'];
        $fieldsToUpdate = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data) && !empty($data[$field])) {
                if ($field === 'password') {
                    $fieldsToUpdate[] = "password_hash = :password_hash";
                    $params['password_hash'] = password_hash($data[$field], PASSWORD_BCRYPT);
                } else {
                    $fieldsToUpdate[] = "`$field` = :$field";
                    $params[$field] = $data[$field];
                }
            }
        }

        if (empty($fieldsToUpdate)) {
            http_response_code(400);
            return json_encode(['error' => 'No valid fields to update.']);
        }

        // Check for duplicate email if it's being updated
        if (isset($params['email'])) {
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email AND id != :id");
            $stmt->execute([':email' => $params['email'], ':id' => $userId]);
            if ($stmt->fetch()) {
                http_response_code(409);
                return json_encode(['error' => 'This email address is already in use.']);
            }
        }

        // Check for duplicate phone number if it's being updated
        if (isset($params['phone'])) {
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE phone = :phone AND id != :id");
            $stmt->execute([':phone' => $params['phone'], ':id' => $userId]);
            if ($stmt->fetch()) {
                http_response_code(409);
                return json_encode(['error' => 'This phone number is already in use.']);
            }
        }

        $params['id'] = $userId;
        $sql = "UPDATE users SET " . implode(', ', $fieldsToUpdate) . " WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'User not found or no changes made.']);
            }

            return json_encode(['message' => 'Profile updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
