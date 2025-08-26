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
     */
    public function createPrescription(int $consultationId, string $body): string {
        $data = json_decode($body, true);
        if (!isset($data['product_id']) || !isset($data['quantity'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: product_id and quantity are required.']);
        }

        try {
            // Directly create the prescription without safety checks
            $stmt = $this->conn->prepare(
                "INSERT INTO prescriptions (consultation_id, product_id, quantity, instructions)
                 VALUES (:consultation_id, :product_id, :quantity, :instructions)"
            );
            $stmt->execute([
                ':consultation_id' => $consultationId,
                ':product_id' => $data['product_id'],
                ':quantity' => $data['quantity'],
                ':instructions' => $data['instructions'] ?? null
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
     * Retrieves prescriptions for a customer, filtered by status.
     */
    public function getPrescriptionsByStatusForCustomer(int $customerId, string $status): string {
        try {
            $stmt = $this->conn->prepare(
                "SELECT 
                    pr.id as prescription_id,
                    pr.quantity,
                    pr.instructions,
                    p.id as product_id,
                    p.name as product_name,
                    TO_BASE64(p.image_data) as product_image,
                    p.image_data_mimetype,
                    c.full_name as customer_name,
                    c.phone as customer_phone
                 FROM prescriptions pr
                 JOIN consultations co ON pr.consultation_id = co.id
                 JOIN customers c ON co.customer_id = c.id
                 JOIN products p ON pr.product_id = p.id
                 WHERE c.id = :customer_id AND pr.status = :status"
            );
            $stmt->execute([':customer_id' => $customerId, ':status' => $status]);
            $prescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format the image data into a usable data URI
            foreach ($prescriptions as &$prescription) {
                if ($prescription['product_image'] && $prescription['image_data_mimetype']) {
                    $prescription['product_image'] = 'data:' . $prescription['image_data_mimetype'] . ';base64,' . $prescription['product_image'];
                }
                unset($prescription['image_data_mimetype']);
            }

            return json_encode($prescriptions);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
