<?php
namespace src\modules\user;

header("Content-Type: application/json");
require_once 'vendor/autoload.php';
require_once 'src/config/db-config.php';

use src\config\Database;
use PDO;

class UserService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    public function getAllUsers($offsetValue = 0) {
        $offset = max(0, ($offsetValue - 1)) * 10;
        try{
            $stmt = $this->conn->prepare("SELECT id, name, email, role, image, location, phone, joinedAt FROM users WHERE isDeleted = 0 LIMIT 10 OFFSET :offset");
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (empty($result)) {
                return json_encode(['error' => 'No users found']);
            }
            $sql = 'SELECT COUNT(*) AS total FROM users WHERE isDeleted = 0';
            $totalStmt = $this->conn->prepare($sql);
            $totalStmt->execute();
            $total = $totalStmt->fetch(PDO::FETCH_ASSOC);
            $totalUsers = $total['total'];
            return json_encode(['users' => $result, 'totalPage' => ceil($totalUsers / 10), 'currentPage' => ($offset + 1), "totalUsers"=> $total['total'] ]);  

        }catch (Exception $e) {
            return json_encode(['error' => $e->getMessage()]);
        }
    }


}
?>
