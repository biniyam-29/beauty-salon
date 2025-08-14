<?php
namespace src\modules\user;

header("Content-Type: application/json");
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../common/mailer.php';

use src\config\Database;
use src\common\Mailer;
use PDO;
use Exception;
use Faker\Factory as FakerFactory;

class UserService {
    private PDO $conn;
    private Mailer $mailer;

    public function __construct() {
        $this->conn = Database::connect();
        $this->mailer = Mailer::getInstance();
    }

    /**
     * Creates a new user (staff member).
     */
    public function createUser(string $body): string {
        $data = json_decode($body);
        if (!isset($data->name) || !isset($data->email) || !isset($data->phone) || !isset($data->role)) {
            http_response_code(400);
            return json_encode(["message" => "Bad request: name, email, phone, and role are required."]);
        }

        try {
            // Check if user already exists
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");
            $stmt->execute([':email' => $data->email]);
            if ($stmt->fetch()) {
                http_response_code(409);
                return json_encode(["message" => "User with this email already exists!"]);
            }

            // Generate a random temporary password
            $password = FakerFactory::create()->password;
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $this->conn->prepare("INSERT INTO users (name, email, password_hash, phone, role) VALUES (:name, :email, :password_hash, :phone, :role)");
            $stmt->execute([
                ':name' => $data->name,
                ':email' => $data->email,
                ':password_hash' => $hashedPassword,
                ':phone' => $data->phone,
                ':role' => $data->role
            ]);
            
            // Send welcome email with temporary password
            $emailBody = 'Hello ' . $data->name . ', your account has been created. Your temporary password is: ' . $password;
            $subject = "Welcome to the Clinic";
            $this->mailer->send($data->email, $subject, $emailBody);
            
            return json_encode(["message" => "User created successfully. Temporary password sent to their email."]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetches users by a specific role with pagination.
     */
    public function getUserByRole(string $role, $page = 1): string {
        $limit = 10;
        $offset = max(0, ($page - 1)) * $limit;

        try {
            $stmt = $this->conn->prepare("SELECT id, name, email, role, phone FROM users WHERE role = :role AND is_active = 1 LIMIT :limit OFFSET :offset");
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
                'currentPage' => (int)$page
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetches a paginated list of all active users.
     */
    public function getAllUsers($page = 1): string {
        $limit = 10;
        $offset = max(0, ($page - 1)) * $limit;

        try {
            $stmt = $this->conn->prepare("SELECT id, name, email, phone, role FROM users WHERE is_active = 1 ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $totalStmt = $this->conn->query("SELECT COUNT(*) FROM users WHERE is_active = 1");
            $totalUsers = $totalStmt->fetchColumn();

            return json_encode([
                'users' => $users,
                'totalPages' => ceil($totalUsers / $limit),
                'currentPage' => (int)$page
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetches a single user by their ID.
     */
    public function getUserById($id): string {
        try {
            $stmt = $this->conn->prepare("SELECT id, name, email, phone, role FROM users WHERE id = :id AND is_active = 1");
            $stmt->execute([':id' => $id]);
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
     * Updates a user's information.
     */
    public function updateUser($id, string $body): string {
        $data = json_decode($body, true);
        if (empty($data)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No data provided.']);
        }

        $allowedFields = ['name', 'phone', 'role', 'is_active','email'];
        $fieldsToUpdate = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fieldsToUpdate[] = "`$field` = :$field";
                $params[$field] = $data[$field];
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
    
    /**
     * Deactivates a user's account (soft delete).
     */
    public function deleteUser($id): string {
        try {
            $stmt = $this->conn->prepare("UPDATE users SET is_active = 0 WHERE id = :id");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'User not found.']);
            }

            return json_encode(['message' => 'User deactivated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
