<?php
namespace src\modules\user;

// Set the content type to JSON for all responses from this file
header("Content-Type: application/json");

// Autoloader and Database connection
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class UserService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * A simple health check method.
     */
    public function check() {
        return json_encode(['status' => 'OK', 'message' => 'User service is running.']);
    }

    /**
     * Fetches all active users with pagination.
     */
    public function getAllUsers($page = 1) {
        $limit = 10;
        $offset = max(0, ($page - 1)) * $limit;

        try {
            // Get paginated users
            $stmt = $this->conn->prepare("SELECT id, name, email, role, phone, created_at FROM users WHERE is_active = 1 LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get total count for pagination
            $totalStmt = $this->conn->query("SELECT COUNT(*) FROM users WHERE is_active = 1");
            $totalUsers = $totalStmt->fetchColumn();

            return json_encode([
                'users' => $users,
                'totalPages' => ceil($totalUsers / $limit),
                'currentPage' => (int)$page,
                'totalUsers' => (int)$totalUsers
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetches users by a specific role with pagination.
     */
    public function getUserByRole(string $role, $page = 1) {
        $limit = 10;
        $offset = max(0, ($page - 1)) * $limit;

        try {
            $stmt = $this->conn->prepare("SELECT id, name, email, role, phone, created_at FROM users WHERE role = :role AND is_active = 1 LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':role', $role, PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $totalStmt = $this->conn->prepare("SELECT COUNT(*) FROM users WHERE role = :role AND is_active = 1");
            $totalStmt->bindValue(':role', $role, PDO::PARAM_STR);
            $totalStmt->execute();
            $totalUsers = $totalStmt->fetchColumn();

            return json_encode([
                'users' => $users,
                'totalPages' => ceil($totalUsers / $limit),
                'currentPage' => (int)$page,
                'totalUsers' => (int)$totalUsers
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetches a single user by their ID.
     */
    public function getUser(string $id) {
        try {
            $stmt = $this->conn->prepare("SELECT id, name, email, role, phone, created_at FROM users WHERE id = :id AND is_active = 1");
            $stmt->bindValue(':id', $id, PDO::PARAM_STR);
            $stmt->execute();
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
     * Searches for users by name with pagination.
     */
    public function searchByName(string $name, $page = 1) {
        $limit = 10;
        $offset = max(0, ($page - 1)) * $limit;
        $searchTerm = '%' . $name . '%';

        try {
            $stmt = $this->conn->prepare("SELECT id, name, email, role, phone, created_at FROM users WHERE name LIKE :name AND is_active = 1 LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':name', $searchTerm, PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $totalStmt = $this->conn->prepare("SELECT COUNT(*) FROM users WHERE name LIKE :name AND is_active = 1");
            $totalStmt->bindValue(':name', $searchTerm, PDO::PARAM_STR);
            $totalStmt->execute();
            $totalUsers = $totalStmt->fetchColumn();

            return json_encode([
                'users' => $users,
                'totalPages' => ceil($totalUsers / $limit),
                'currentPage' => (int)$page,
                'totalUsers' => (int)$totalUsers
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Changes a user's role.
     */
    public function changeRole(string $body, string $id) {
        $data = json_decode($body);
        if (!isset($data->role)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: role is required.']);
        }

        try {
            $stmt = $this->conn->prepare("UPDATE users SET role = :role WHERE id = :id");
            $stmt->bindValue(':role', $data->role, PDO::PARAM_STR);
            $stmt->bindValue(':id', $id, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'User not found or role is already set.']);
            }

            return json_encode(['message' => 'User role updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates user details.
     */
    public function updateUser(string $id, string $body) {
        $data = json_decode($body, true);
        if (empty($data)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No data provided.']);
        }

        // Fields that are allowed to be updated
        $allowedFields = ['name', 'phone', 'password'];
        $fieldsToUpdate = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                if ($field === 'password') {
                    // Hash the password before updating
                    $fieldsToUpdate[] = "password_hash = :password";
                    $params['password'] = password_hash($data[$field], PASSWORD_BCRYPT);
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

        $params['id'] = $id;
        $sql = "UPDATE users SET " . implode(', ', $fieldsToUpdate) . " WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'User not found or no changes made.']);
            }

            return json_encode(['message' => 'User updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
