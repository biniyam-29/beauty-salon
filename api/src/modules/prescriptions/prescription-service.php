<?php
namespace src\modules\prescriptions;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class PrescriptionService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Creates a new prescription for a given consultation.
     * Can be for an existing product (product_id) or a custom one (product_name_custom).
     */
    public function createPrescription(int $consultationId, string $body): string {
        $data = json_decode($body, true);

        if (!isset($data['quantity']) || (!isset($data['product_id']) && !isset($data['product_name_custom']))) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: quantity and either product_id or product_name_custom are required.']);
        }

        if (isset($data['product_id']) && isset($data['product_name_custom'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: Cannot provide both product_id and product_name_custom.']);
        }
        
        // Determine the status based on whether the product is custom
        $isCustomProduct = isset($data['product_name_custom']);
        $status = $isCustomProduct ? 'sold' : 'prescribed';
        
        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO prescriptions (consultation_id, product_id, product_name_custom, quantity, instructions, status)
                 VALUES (:consultation_id, :product_id, :product_name_custom, :quantity, :instructions, :status)"
            );
            $stmt->execute([
                ':consultation_id' => $consultationId,
                ':product_id' => $data['product_id'] ?? null,
                ':product_name_custom' => $data['product_name_custom'] ?? null,
                ':quantity' => $data['quantity'],
                ':instructions' => $data['instructions'] ?? null,
                ':status' => $status
            ]);
            $prescriptionId = $this->conn->lastInsertId();

            return json_encode(['message' => 'Prescription added successfully.', 'prescriptionId' => $prescriptionId]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves all prescriptions for a specific consultation.
     */
    public function getPrescriptionsForConsultation(int $consultationId): string {
        try {
            $stmt = $this->conn->prepare(
                "SELECT pr.id, pr.quantity, pr.instructions, p.name as product_name, p.price 
                 FROM prescriptions pr
                 JOIN products p ON pr.product_id = p.id
                 WHERE pr.consultation_id = :consultation_id"
            );
            $stmt->execute([':consultation_id' => $consultationId]);
            $prescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($prescriptions);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates an existing prescription.
     */
    public function updatePrescription(int $id, string $body): string {
        $data = json_decode($body, true);
        if (empty($data)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No data provided.']);
        }

        $allowedFields = ['quantity', 'instructions'];
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
        $sql = "UPDATE prescriptions SET " . implode(', ', $fieldsToUpdate) . " WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Prescription not found or no changes made.']);
            }

            return json_encode(['message' => 'Prescription updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Deletes a prescription.
     */
    public function deletePrescription(int $id): string {
        try {
            $stmt = $this->conn->prepare("DELETE FROM prescriptions WHERE id = :id");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Prescription not found.']);
            }

            return json_encode(['message' => 'Prescription deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves a filtered list of prescriptions.
     * Filters are optional and can be combined.
     */
    public function getPrescriptions(?int $customerId, ?string $status): string {
        try {
            $baseQuery = "SELECT 
                            pr.id as prescription_id,
                            pr.quantity,
                            pr.instructions,
                            pr.status,
                            p.id as product_id,
                            COALESCE(p.name, pr.product_name_custom) as product_name,
                            -- TO_BASE64(p.image_data) as product_image,
                            -- p.image_data_mimetype,
                            c.full_name as customer_name,
                            c.phone as customer_phone
                        FROM prescriptions pr
                        JOIN consultations co ON pr.consultation_id = co.id
                        JOIN customers c ON co.customer_id = c.id
                        LEFT JOIN products p ON pr.product_id = p.id";
            
            $conditions = [];
            $params = [];

            if ($customerId) {
                $conditions[] = "c.id = :customer_id";
                $params[':customer_id'] = $customerId;
            }

            if ($status) {
                $conditions[] = "pr.status = :status";
                $params[':status'] = $status;
            }

            if (!empty($conditions)) {
                $baseQuery .= " WHERE " . implode(" AND ", $conditions);
            }

            $stmt = $this->conn->prepare($baseQuery);
            $stmt->execute($params);
            $prescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format the image data into a usable data URI
            // foreach ($prescriptions as &$prescription) {
            //     if ($prescription['product_image'] && $prescription['image_data_mimetype']) {
            //         $prescription['product_image'] = 'data:' . $prescription['image_data_mimetype'] . ';base64,' . $prescription['product_image'];
            //     }
            //     unset($prescription['image_data_mimetype']);
            // }

            return json_encode($prescriptions);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
