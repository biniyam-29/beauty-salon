<?php
namespace src\modules\consultations;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ConsultationService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Creates a new consultation record for a customer.
     */
    public function createConsultation(string $body): string {
        $data = json_decode($body, true);

        // Essential data for a consultation
        if (!isset($data['customer_id']) || !isset($data['doctor_id'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: customer_id and doctor_id are required.']);
        }

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO consultations (customer_id, doctor_id, consultation_date, previous_treatment_feedback, treatment_goals_today, doctor_notes, follow_up_date)
                 VALUES (:customer_id, :doctor_id, NOW(), :previous_treatment_feedback, :treatment_goals_today, :doctor_notes, :follow_up_date)"
            );
            $stmt->execute([
                ':customer_id' => $data['customer_id'],
                ':doctor_id' => $data['doctor_id'],
                ':previous_treatment_feedback' => isset($data['previous_treatment_feedback']) ? json_encode($data['previous_treatment_feedback']) : null,
                ':treatment_goals_today' => isset($data['treatment_goals_today']) ? json_encode($data['treatment_goals_today']) : null,
                ':doctor_notes' => $data['doctor_notes'] ?? null,
                ':follow_up_date' => $data['follow_up_date'] ?? null
            ]);
            $consultationId = $this->conn->lastInsertId();

            return json_encode(['message' => 'Consultation created successfully.', 'consultationId' => $consultationId]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves all consultations for a specific customer.
     */
    public function getConsultationsForCustomer(int $customerId): string {
        try {
            $stmt = $this->conn->prepare(
                "SELECT c.id, c.consultation_date, c.doctor_notes, u.name as doctor_name 
                 FROM consultations c
                 JOIN users u ON c.doctor_id = u.id
                 WHERE c.customer_id = :customer_id 
                 ORDER BY c.consultation_date DESC"
            );
            $stmt->execute([':customer_id' => $customerId]);
            $consultations = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($consultations);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves a single, detailed consultation by its ID.
     */
    public function getConsultationById(int $id): string {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM consultations WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $consultation = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$consultation) {
                http_response_code(404);
                return json_encode(['error' => 'Consultation not found.']);
            }
            
            // Decode JSON fields for easier use on the front-end
            $consultation['previous_treatment_feedback'] = json_decode($consultation['previous_treatment_feedback']);
            $consultation['treatment_goals_today'] = json_decode($consultation['treatment_goals_today']);

            return json_encode($consultation);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates an existing consultation record.
     */
    public function updateConsultation(int $id, string $body): string {
        $data = json_decode($body, true);
        if (empty($data)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No data provided.']);
        }

        // Define which fields a doctor is allowed to update
        $allowedFields = [
            'previous_treatment_feedback',
            'treatment_goals_today',
            'doctor_notes',
            'follow_up_date'
        ];
        
        $fieldsToUpdate = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                // Handle JSON encoding for specific fields
                if ($field === 'previous_treatment_feedback' || $field === 'treatment_goals_today') {
                    $fieldsToUpdate[] = "`$field` = :$field";
                    $params[$field] = json_encode($data[$field]);
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
        $sql = "UPDATE consultations SET " . implode(', ', $fieldsToUpdate) . " WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Consultation not found or no changes made.']);
            }

            return json_encode(['message' => 'Consultation updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
