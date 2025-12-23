<?php
namespace src\modules\service;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ServicePrescriptionService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Fetches all service prescriptions with optional customer filter and pagination.
     * @return string JSON encoded list of records.
     */
    public function getAll(): string {
        try {
            // Get query parameters
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $pageSize = isset($_GET['pageSize']) ? max(1, (int)$_GET['pageSize']) : 10;
            $customerId = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : null;
            $status = isset($_GET['status']) ? $_GET['status'] : null;
            $offset = ($page - 1) * $pageSize;
            
            // Build WHERE clause
            $whereClauses = [];
            $params = [];
            
            if ($customerId !== null) {
                $whereClauses[] = 'sp.customer_id = :customer_id';
                $params[':customer_id'] = $customerId;
            }
            
            if ($status !== null && in_array($status, ['pending', 'completed'])) {
                $whereClauses[] = 'sp.status = :status';
                $params[':status'] = $status;
            }
            
            $whereSQL = !empty($whereClauses) ? 'WHERE ' . implode(' AND ', $whereClauses) : '';
            
            // Get total count
            $countSQL = "SELECT COUNT(*) as total FROM `service_prescription` sp $whereSQL";
            $countStmt = $this->conn->prepare($countSQL);
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $countStmt->execute();
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            $totalPages = ceil($total / $pageSize);
            
            // Build main query with JOIN to get customer information
            $sql = "
                SELECT 
                    sp.*,
                    c.full_name as customer_name,
                    c.phone as customer_phone,
                    c.email as customer_email
                FROM `service_prescription` sp
                LEFT JOIN `customers` c ON sp.customer_id = c.id
                $whereSQL
                ORDER BY sp.created_at DESC 
                LIMIT :limit OFFSET :offset
            ";
            
            $stmt = $this->conn->prepare($sql);
            
            // Bind all parameters
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return json_encode([
                'service_prescriptions' => $results,
                'totalPages' => $totalPages,
                'currentPage' => $page,
                'totalServicePrescriptions' => $total
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetches a single service prescription by ID.
     * @param int $id The ID of the service prescription.
     * @return string JSON encoded service prescription data or error message.
     */
    public function getById(int $id): string {
        try {
            $sql = "
                SELECT 
                    sp.*,
                    c.full_name as customer_name,
                    c.phone as customer_phone,
                    c.email as customer_email,
                    u.name as assigned_doctor_name
                FROM `service_prescription` sp
                LEFT JOIN `customers` c ON sp.customer_id = c.id
                LEFT JOIN `users` u ON c.assigned_doctor_id = u.id
                WHERE sp.id = :id
            ";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            $servicePrescription = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$servicePrescription) {
                http_response_code(404);
                return json_encode(['error' => 'Service prescription not found.']);
            }
            
            return json_encode($servicePrescription);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Creates a new service prescription record.
     * @param string|null $body The raw JSON request body.
     * @return string JSON encoded success or error message.
     */
    public function create(?string $body): string {
        if ($body === null) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: Request body is required.']);
        }
        
        $data = json_decode($body);
        
        if ($data === null) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: Invalid JSON format.']);
        }
        
        // Validate required fields
        $requiredFields = ['name', 'price', 'customer_id'];
        foreach ($requiredFields as $field) {
            if (!isset($data->$field)) {
                http_response_code(400);
                return json_encode(['error' => "Bad request: $field is required."]);
            }
        }
        
        // Validate specific fields
        if (empty(trim($data->name))) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: name cannot be empty.']);
        }
        
        if (!is_numeric($data->price) || $data->price < 0) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: price must be a positive number.']);
        }
        
        if (!is_numeric($data->customer_id) || $data->customer_id <= 0) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: customer_id must be a positive integer.']);
        }
        
        // Check if customer exists
        try {
            $customerStmt = $this->conn->prepare("SELECT id FROM `customers` WHERE id = :customer_id");
            $customerStmt->bindValue(':customer_id', $data->customer_id, PDO::PARAM_INT);
            $customerStmt->execute();
            if (!$customerStmt->fetch()) {
                http_response_code(404);
                return json_encode(['error' => 'Customer not found.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Error validating customer: ' . $e->getMessage()]);
        }

        try {
            $stmt = $this->conn->prepare("
                INSERT INTO `service_prescription` 
                (name, prescription_notes, price, customer_id, status) 
                VALUES (:name, :prescription_notes, :price, :customer_id, :status)
            ");
            
            $stmt->bindValue(':name', trim($data->name), PDO::PARAM_STR);
            $stmt->bindValue(':prescription_notes', isset($data->prescription_notes) ? trim($data->prescription_notes) : null, PDO::PARAM_STR);
            $stmt->bindValue(':price', (int)$data->price, PDO::PARAM_INT);
            $stmt->bindValue(':customer_id', (int)$data->customer_id, PDO::PARAM_INT);
            $stmt->bindValue(':status', isset($data->status) && in_array($data->status, ['pending', 'completed']) ? $data->status : 'pending', PDO::PARAM_STR);
            
            $stmt->execute();
            
            $id = $this->conn->lastInsertId();
            
            // Fetch the created service prescription to return complete data
            return $this->getById($id);
            
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates an existing service prescription record.
     * @param int $id The ID of the service prescription to update.
     * @param string|null $body The raw JSON request body.
     * @return string JSON encoded success or error message.
     */
    public function update(int $id, ?string $body): string {
        if ($body === null) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: Request body is required.']);
        }
        
        $data = json_decode($body);
        
        if ($data === null) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: Invalid JSON format.']);
        }
        
        // Check if service prescription exists
        try {
            $checkStmt = $this->conn->prepare("SELECT id FROM `service_prescription` WHERE id = :id");
            $checkStmt->bindValue(':id', $id, PDO::PARAM_INT);
            $checkStmt->execute();
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                return json_encode(['error' => 'Service prescription not found.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Error checking service prescription: ' . $e->getMessage()]);
        }
        
        // Build update fields
        $updateFields = [];
        $params = [':id' => $id];
        
        if (isset($data->name)) {
            if (empty(trim($data->name))) {
                http_response_code(400);
                return json_encode(['error' => 'Bad request: name cannot be empty.']);
            }
            $updateFields[] = 'name = :name';
            $params[':name'] = trim($data->name);
        }
        
        if (isset($data->prescription_notes)) {
            $updateFields[] = 'prescription_notes = :prescription_notes';
            $params[':prescription_notes'] = trim($data->prescription_notes);
        }
        
        if (isset($data->price)) {
            if (!is_numeric($data->price) || $data->price < 0) {
                http_response_code(400);
                return json_encode(['error' => 'Bad request: price must be a positive number.']);
            }
            $updateFields[] = 'price = :price';
            $params[':price'] = (int)$data->price;
        }
        
        if (isset($data->customer_id)) {
            if (!is_numeric($data->customer_id) || $data->customer_id <= 0) {
                http_response_code(400);
                return json_encode(['error' => 'Bad request: customer_id must be a positive integer.']);
            }
            // Check if customer exists
            try {
                $customerStmt = $this->conn->prepare("SELECT id FROM `customers` WHERE id = :customer_id");
                $customerStmt->bindValue(':customer_id', $data->customer_id, PDO::PARAM_INT);
                $customerStmt->execute();
                if (!$customerStmt->fetch()) {
                    http_response_code(404);
                    return json_encode(['error' => 'Customer not found.']);
                }
            } catch (Exception $e) {
                http_response_code(500);
                return json_encode(['error' => 'Error validating customer: ' . $e->getMessage()]);
            }
            $updateFields[] = 'customer_id = :customer_id';
            $params[':customer_id'] = (int)$data->customer_id;
        }
        
        if (isset($data->status)) {
            if (!in_array($data->status, ['pending', 'completed'])) {
                http_response_code(400);
                return json_encode(['error' => 'Bad request: status must be either "pending" or "completed".']);
            }
            $updateFields[] = 'status = :status';
            $params[':status'] = $data->status;
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No fields to update.']);
        }

        try {
            $sql = "UPDATE `service_prescription` SET " . implode(', ', $updateFields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            
            foreach ($params as $key => $value) {
                if (in_array($key, [':id', ':price', ':customer_id'])) {
                    $stmt->bindValue($key, $value, PDO::PARAM_INT);
                } else {
                    $stmt->bindValue($key, $value, PDO::PARAM_STR);
                }
            }
            
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                return json_encode([
                    'message' => 'No changes made to the service prescription.',
                    'service_prescription' => $this->getServicePrescriptionById($id)
                ]);
            }

            return $this->getById($id);
            
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Deletes a service prescription record.
     * @param int $id The ID of the service prescription to delete.
     * @return string JSON encoded success or error message.
     */
    public function delete(int $id): string {
        try {
            // First get the service prescription to return in response
            $servicePrescription = json_decode($this->getById($id), true);
            if (isset($servicePrescription['error'])) {
                return json_encode($servicePrescription);
            }
            
            $stmt = $this->conn->prepare("DELETE FROM `service_prescription` WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            return json_encode([
                'message' => 'Service prescription deleted successfully.',
                'deleted_service_prescription' => $servicePrescription
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Helper method to get service prescription by ID without HTTP status checks
     */
    private function getServicePrescriptionById(int $id): array {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM `service_prescription` WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (Exception $e) {
            return [];
        }
    }
    /**
     * Fetches service prescriptions by customer ID.
     * @param int $customerId The customer ID.
     * @return string JSON encoded list of service prescriptions.
     */
    public function getByCustomerId(int $customerId): string {
        try {
            // Validate customer exists
            $customerStmt = $this->conn->prepare("SELECT id FROM `customers` WHERE id = :customer_id");
            $customerStmt->bindValue(':customer_id', $customerId, PDO::PARAM_INT);
            $customerStmt->execute();
            if (!$customerStmt->fetch()) {
                http_response_code(404);
                return json_encode(['error' => 'Customer not found.']);
            }

            // Get query parameters for pagination
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $pageSize = isset($_GET['pageSize']) ? max(1, (int)$_GET['pageSize']) : 10;
            $status = isset($_GET['status']) ? $_GET['status'] : null;
            $offset = ($page - 1) * $pageSize;
            
            // Build WHERE clause
            $whereClauses = ['sp.customer_id = :customer_id'];
            $params = [':customer_id' => $customerId];
            
            if ($status !== null && in_array($status, ['pending', 'completed'])) {
                $whereClauses[] = 'sp.status = :status';
                $params[':status'] = $status;
            }
            
            $whereSQL = 'WHERE ' . implode(' AND ', $whereClauses);
            
            // Get total count
            $countSQL = "SELECT COUNT(*) as total FROM `service_prescription` sp $whereSQL";
            $countStmt = $this->conn->prepare($countSQL);
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $countStmt->execute();
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            $totalPages = ceil($total / $pageSize);
            
            // Build main query
            $sql = "
                SELECT 
                    sp.*,
                    c.full_name as customer_name,
                    c.phone as customer_phone,
                    c.email as customer_email
                FROM `service_prescription` sp
                LEFT JOIN `customers` c ON sp.customer_id = c.id
                $whereSQL
                ORDER BY sp.created_at DESC 
                LIMIT :limit OFFSET :offset
            ";
            
            $stmt = $this->conn->prepare($sql);
            
            // Bind all parameters
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return json_encode([
                'service_prescriptions' => $results,
                'totalPages' => $totalPages,
                'currentPage' => $page,
                'totalServicePrescriptions' => $total,
                'customer_id' => $customerId
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>