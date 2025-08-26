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
            // UPDATED: Select the mimetype as well
            $stmt = $this->conn->prepare(
                "SELECT id, name, email, phone, role, TO_BASE64(profile_picture) as profile_picture, profile_picture_mimetype 
                 FROM users WHERE id = :id"
            );
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(404);
                return json_encode(['error' => 'User not found.']);
            }

            // UPDATED: Dynamically build the data URI
            if ($user['profile_picture'] && $user['profile_picture_mimetype']) {
                $user['profile_picture'] = 'data:' . $user['profile_picture_mimetype'] . ';base64,' . $user['profile_picture'];
            }
            unset($user['profile_picture_mimetype']); // Clean up the response

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

        /**
     * Updates the profile picture for the currently logged-in user.
     */
    public function updateProfilePicture(int $userId, array $file): string {
        // Basic validation for the uploaded file
        if (empty($file) || $file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            return json_encode(['error' => 'File upload error or no file provided.']);
        }
        if ($file['size'] > 2000000) { // 2MB limit
            http_response_code(400);
            return json_encode(['error' => 'File is too large. Max size is 2MB.']);
        }

        // Read the binary data from the uploaded file
        $imageData = file_get_contents($file['tmp_name']);
        $imageMimeType = $file['type']; // Get the MIME type from the upload

        try {
            // UPDATED: Save the mimetype along with the image data
            $stmt = $this->conn->prepare("UPDATE users SET profile_picture = :image_data, profile_picture_mimetype = :mimetype WHERE id = :id");
            $stmt->bindParam(':image_data', $imageData, PDO::PARAM_LOB);
            $stmt->bindParam(':mimetype', $imageMimeType, PDO::PARAM_STR);
            $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'User not found.']);
            }

            return json_encode(['message' => 'Profile picture updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
