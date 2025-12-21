<?php
namespace src\modules\service;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ServiceService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Fetches all records from the service table with pagination.
     * @return string JSON encoded list of records.
     */
    public function getAll(): string {
        try {
            // Get pagination parameters
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $pageSize = isset($_GET['pageSize']) ? max(1, (int)$_GET['pageSize']) : 10;
            $offset = ($page - 1) * $pageSize;
            
            // Get total count
            $countStmt = $this->conn->query("SELECT COUNT(*) as total FROM `service`");
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            $totalPages = ceil($total / $pageSize);
            
            // Get paginated results
            $stmt = $this->conn->prepare("SELECT * FROM `service` ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return json_encode([
                'services' => $results,
                'totalPages' => $totalPages,
                'currentPage' => $page,
                'totalServices' => $total
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Creates a new service record.
     * @param string|null $body The raw JSON request body.
     * @return string JSON encoded success or error message.
     */
    public function create(?string $body): string {
        $data = json_decode($body);
        
        // Validate required fields
        if (!isset($data->name) || empty(trim($data->name))) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: name is required.']);
        }
        
        if (!isset($data->price) || !is_numeric($data->price) || $data->price < 0) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: price must be a positive number.']);
        }

        try {
            $stmt = $this->conn->prepare("INSERT INTO `service` (name, description, price) VALUES (:name, :description, :price)");
            $stmt->bindValue(':name', trim($data->name), PDO::PARAM_STR);
            $stmt->bindValue(':description', isset($data->description) ? trim($data->description) : null, PDO::PARAM_STR);
            $stmt->bindValue(':price', $data->price, PDO::PARAM_INT);
            $stmt->execute();
            
            $id = $this->conn->lastInsertId();
            
            // Fetch the created service to return complete data
            $stmt = $this->conn->prepare("SELECT * FROM `service` WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $service = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return json_encode([
                'message' => 'Service created successfully.',
                'service' => $service
            ]);
        } catch (Exception $e) {
            // Handle unique constraint violation
            if ($e->getCode() == 23000) {
                 http_response_code(409); // Conflict
                 return json_encode(['error' => 'A service with this name already exists.']);
            }
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates an existing service record.
     * @param int $id The ID of the service to update.
     * @param string|null $body The raw JSON request body.
     * @return string JSON encoded success or error message.
     */
    public function update(int $id, ?string $body): string {
        $data = json_decode($body);
        
        // Check if at least one field is being updated
        $updateFields = [];
        $params = [':id' => $id];
        
        if (isset($data->name) && !empty(trim($data->name))) {
            $updateFields[] = 'name = :name';
            $params[':name'] = trim($data->name);
        }
        
        if (isset($data->description)) {
            $updateFields[] = 'description = :description';
            $params[':description'] = !empty(trim($data->description)) ? trim($data->description) : null;
        }
        
        if (isset($data->price) && is_numeric($data->price)) {
            if ($data->price < 0) {
                http_response_code(400);
                return json_encode(['error' => 'Bad request: price must be a positive number.']);
            }
            $updateFields[] = 'price = :price';
            $params[':price'] = $data->price;
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No fields to update.']);
        }

        try {
            $sql = "UPDATE `service` SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            
            foreach ($params as $key => $value) {
                $paramType = strpos($key, ':price') !== false ? PDO::PARAM_INT : PDO::PARAM_STR;
                $stmt->bindValue($key, $value, $paramType);
            }
            
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Service not found or no changes made.']);
            }

            // Fetch the updated service to return complete data
            $stmt = $this->conn->prepare("SELECT * FROM `service` WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $service = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode([
                'message' => 'Service updated successfully.',
                'service' => $service
            ]);
        } catch (Exception $e) {
            // Handle unique constraint violation
            if ($e->getCode() == 23000) {
                 http_response_code(409); // Conflict
                 return json_encode(['error' => 'A service with this name already exists.']);
            }
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetches a single service by ID.
     * @param int $id The ID of the service.
     * @return string JSON encoded service data or error message.
     */
    public function getById(int $id): string {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM `service` WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            $service = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$service) {
                http_response_code(404);
                return json_encode(['error' => 'Service not found.']);
            }
            
            return json_encode($service);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Deletes a service record.
     * @param int $id The ID of the service to delete.
     * @return string JSON encoded success or error message.
     */
    public function delete(int $id): string {
        try {
            $stmt = $this->conn->prepare("DELETE FROM `service` WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Service not found.']);
            }

            return json_encode(['message' => 'Service deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . e->getMessage()]);
        }
    }
}
?>