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
     * Searches for users by name, email, or phone with pagination.
     */
    public function searchUsers(string $searchTerm, $page = 1): string {
        $limit = 10;
        $offset = max(0, ($page - 1)) * $limit;
        $searchPattern = '%' . $searchTerm . '%';

        try {
            // Query to find matching users
            $stmt = $this->conn->prepare(
                "SELECT id, name, email, role, phone FROM users 
                 WHERE (name LIKE :searchTerm OR email LIKE :searchTerm OR phone LIKE :searchTerm) AND is_active = 1 
                 LIMIT :limit OFFSET :offset"
            );
            $stmt->bindValue(':searchTerm', $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Query to get the total count of matching users for pagination
            $totalStmt = $this->conn->prepare(
                "SELECT COUNT(*) FROM users 
                 WHERE (name LIKE :searchTerm OR email LIKE :searchTerm OR phone LIKE :searchTerm) AND is_active = 1"
            );
            $totalStmt->bindValue(':searchTerm', $searchPattern, PDO::PARAM_STR);
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

            $this->conn->beginTransaction();

            $stmt = $this->conn->prepare("INSERT INTO users (name, email, password_hash, phone, role) VALUES (:name, :email, :password_hash, :phone, :role)");
            $stmt->execute([
                ':name' => $data->name,
                ':email' => $data->email,
                ':password_hash' => $hashedPassword,
                ':phone' => $data->phone,
                ':role' => $data->role
            ]);
            
            $userId = $this->conn->lastInsertId();
            
            $this->conn->commit();

            // Send welcome email with temporary password
            $emailBody = 'Hello ' . $data->name . ', your account has been created. Your temporary password is: ' . $password;
            $subject = "Welcome to the Clinic";
            $this->mailer->send($data->email, $subject, $emailBody);
            
            // Fetch the newly created user object to return
            $newUserStmt = $this->conn->prepare("SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE id = :id");
            $newUserStmt->execute([':id' => $userId]);
            $newUser = $newUserStmt->fetch(PDO::FETCH_ASSOC);

            // Add the plain-text password to the response object
            $newUser['temporary_password'] = $password;
            
            return json_encode([
                "message" => "User created successfully. Temporary password sent to their email.",
                "user" => $newUser
            ]);
            

        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
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

            // If requesting doctors, enrich each doctor with counts (not lists)
            if ($role === 'doctor' && !empty($users)) {
                // Prepare count statements
                $assignedCountStmt = $this->conn->prepare(
                    "SELECT COUNT(*) AS cnt
                     FROM customers 
                     WHERE assigned_doctor_id = :doctorId"
                );

                $untreatedCountStmt = $this->conn->prepare(
                    "SELECT COUNT(*) AS cnt
                     FROM customers c
                     LEFT JOIN consultations co
                       ON co.customer_id = c.id
                      AND co.doctor_id = :doctorId
                     WHERE c.assigned_doctor_id = :doctorId
                       AND co.id IS NULL"
                );

                $todaysFollowupsCountStmt = $this->conn->prepare(
                    "SELECT COUNT(*) AS cnt
                     FROM (
                         SELECT co.customer_id, MAX(co.follow_up_date) AS last_followup
                         FROM consultations co
                         JOIN customers cu ON cu.id = co.customer_id
                         WHERE cu.assigned_doctor_id = :doctorId
                           AND co.doctor_id = :doctorId
                           AND co.follow_up_date IS NOT NULL
                         GROUP BY co.customer_id
                     ) t
                     WHERE t.last_followup = CURDATE()"
                );
                

                foreach ($users as &$user) {
                    $doctorId = (int)$user['id'];

                    $assignedCountStmt->bindValue(':doctorId', $doctorId, PDO::PARAM_INT);
                    $assignedCountStmt->execute();
                    $assignedCount = (int)$assignedCountStmt->fetchColumn();

                    $untreatedCountStmt->bindValue(':doctorId', $doctorId, PDO::PARAM_INT);
                    $untreatedCountStmt->execute();
                    $untreatedCount = (int)$untreatedCountStmt->fetchColumn();

                    $todaysFollowupsCountStmt->bindValue(':doctorId', $doctorId, PDO::PARAM_INT);
                    $todaysFollowupsCountStmt->execute();
                    $todaysFollowupsCount = (int)$todaysFollowupsCountStmt->fetchColumn();

                    $user['assigned_patients_count'] = $assignedCount;
                    $user['untreated_assigned_patients_count'] = $untreatedCount;
                    $user['todays_followups_count'] = $todaysFollowupsCount;
                }
                unset($user);
            }

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
            $stmt = $this->conn->prepare(
                "SELECT id, name, email, phone, role, TO_BASE64(profile_picture) as profile_picture, profile_picture_mimetype 
                 FROM users WHERE is_active = 1 
                 ORDER BY created_at DESC 
                 LIMIT :limit OFFSET :offset"
            );
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($users as &$user) {
                if ($user['profile_picture'] && $user['profile_picture_mimetype']) {
                    $user['profile_picture'] = 'data:' . $user['profile_picture_mimetype'] . ';base64,' . $user['profile_picture'];
                }
                unset($user['profile_picture_mimetype']);
            }

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
            $stmt = $this->conn->prepare(
                "SELECT id, name, email, phone, role, TO_BASE64(profile_picture) as profile_picture, profile_picture_mimetype 
                 FROM users WHERE id = :id AND is_active = 1"
            );
            $stmt->execute([':id' => $id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(404);
                return json_encode(['error' => 'User not found.']);
            }

            if ($user['profile_picture'] && $user['profile_picture_mimetype']) {
                $user['profile_picture'] = 'data:' . $user['profile_picture_mimetype'] . ';base64,' . $user['profile_picture'];
            }
            unset($user['profile_picture_mimetype']);

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
