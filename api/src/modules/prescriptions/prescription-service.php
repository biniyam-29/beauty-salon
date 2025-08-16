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
    public function createPrescription(int $consultationId, string $body, int $doctorId): string {
        $data = json_decode($body, true);
        if (!isset($data['product_id']) || !isset($data['quantity'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: product_id and quantity are required.']);
        }

        // Check for the override flag in the request
        $overrideAlert = $data['override_alert'] ?? false;
        $justification = $data['justification'] ?? 'Doctor clinical judgment'; // Front-end should provide a reason

        try {
            // --- SAFETY CHECK ---
            $stmt = $this->conn->prepare("SELECT customer_id FROM consultations WHERE id = :id");
            $stmt->execute([':id' => $consultationId]);
            $customerId = $stmt->fetchColumn();

            $stmt = $this->conn->prepare("SELECT condition_id FROM customer_health_conditions WHERE customer_id = :customer_id AND end_date IS NULL");
            $stmt->execute([':customer_id' => $customerId]);
            $customerConditions = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $stmt = $this->conn->prepare("SELECT condition_id FROM product_contraindications WHERE product_id = :product_id");
            $stmt->execute([':product_id' => $data['product_id']]);
            $productContraindications = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $conflict = array_intersect($customerConditions, $productContraindications);

            if (!empty($conflict) && !$overrideAlert) {
                $conflictId = $conflict[0];
                $stmt = $this->conn->prepare("SELECT name FROM health_conditions WHERE id = :id");
                $stmt->execute([':id' => $conflictId]); 
                $conditionName = $stmt->fetchColumn();

                http_response_code(409); // 409 Conflict
                return json_encode([
                    'error' => 'Safety Alert: This product is contraindicated for the customer.',
                    'reason' => "The customer has the condition: '{$conditionName}'.",
                    'requires_override' => true // Flag for the front-end
                ]);
            }
            // --- END OF SAFETY CHECK ---

            $this->conn->beginTransaction();

            // If there was a conflict but the doctor chose to override, log it.
            if (!empty($conflict) && $overrideAlert) {
                $conflictId = $conflict[0];
                $details = "Prescribed Product ID {$data['product_id']} to Customer ID {$customerId} despite contraindication with Condition ID {$conflictId}.";
                
                $logStmt = $this->conn->prepare(
                    "INSERT INTO audit_log (user_id, action, details, justification) VALUES (:user_id, 'ALERT_OVERRIDE', :details, :justification)"
                );
                $logStmt->execute([
                    ':user_id' => $doctorId,
                    ':details' => $details,
                    ':justification' => $justification
                ]);
            }

            // Proceed with creating the prescription
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

            $this->conn->commit();
            return json_encode(['message' => 'Prescription added successfully.', 'prescriptionId' => $prescriptionId]);
        } catch (Exception $e) {
            $this->conn->rollBack();
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
}
