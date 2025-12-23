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
     * Assigns a professional (doctor) to a consultation
     */
    public function assignProfessional(int $consultationId, string $body): string {
        $data = json_decode($body, true);

        if (!isset($data['doctor_id'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: doctor_id is required.']);
        }

        try {
            // First, verify the consultation exists
            $checkStmt = $this->conn->prepare("SELECT id FROM customers WHERE id = :id");
            $checkStmt->execute([':id' => $consultationId]);
            $consultation = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$consultation) {
                http_response_code(404);
                return json_encode(['error' => 'customer not found.']);
            }

            // Verify the doctor exists and has the correct role
            $doctorStmt = $this->conn->prepare(
                "SELECT id FROM users WHERE id = :doctor_id AND role IN ('doctor', 'admin', 'reception') AND is_active = 1"
            );
            $doctorStmt->execute([':doctor_id' => $data['doctor_id']]);
            $doctor = $doctorStmt->fetch(PDO::FETCH_ASSOC);

            if (!$doctor) {
                http_response_code(404);
                return json_encode(['error' => 'Doctor not found or not active.']);
            }

            // Update the consultation with the assigned doctor
            $stmt = $this->conn->prepare(
                "UPDATE customers SET assigned_doctor_id = :doctor_id WHERE id = :consultation_id"
            );
            $stmt->execute([
                ':doctor_id' => $data['doctor_id'],
                ':consultation_id' => $consultationId
            ]);

            if ($stmt->rowCount() === 0) {
                http_response_code(500);
                return json_encode(['error' => 'Failed to assign professional.']);
            }

            return json_encode([
                'message' => 'Professional assigned successfully.',
                'consultation_id' => $consultationId,
                'doctor_id' => $data['doctor_id']
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
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

            $imageStmt = $this->conn->prepare(
                "SELECT id, image_url, description, created_at 
                 FROM images 
                 WHERE consultation_id = :consultation_id 
                 ORDER BY created_at ASC"
            );
            $imageStmt->execute([':consultation_id' => $id]);
            $images = $imageStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Decode JSON fields for easier use on the front-end
            $consultation['previous_treatment_feedback'] = json_decode($consultation['previous_treatment_feedback']);
            $consultation['treatment_goals_today'] = json_decode($consultation['treatment_goals_today']);
            $consultation['images'] = $images;

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
            'follow_up_date',
            'doctor_id'
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

    /**
     * Retrieves a list of all customers with a follow-up scheduled for today.
     */
    public function getTodaysFollowUps(): string {
        try {
            $stmt = $this->conn->query(
                "SELECT 
                    co.id as consultation_id,
                    co.follow_up_date,
                    cu.id as customer_id,
                    cu.full_name as customer_name,
                    cu.phone as customer_phone,
                    u.name as doctor_name,
                    GROUP_CONCAT(DISTINCT sc.name SEPARATOR ', ') as skin_concerns,
                    GROUP_CONCAT(DISTINCT hc.name SEPARATOR ', ') as health_conditions
                 FROM consultations co
                 JOIN customers cu ON co.customer_id = cu.id
                 JOIN users u ON co.doctor_id = u.id
                 LEFT JOIN customer_skin_concerns csc ON cu.id = csc.customer_id AND csc.end_date IS NULL
                 LEFT JOIN skin_concerns sc ON csc.concern_id = sc.id
                 LEFT JOIN customer_health_conditions chc ON cu.id = chc.customer_id AND chc.end_date IS NULL
                 LEFT JOIN health_conditions hc ON chc.condition_id = hc.id
                 WHERE co.follow_up_date = CURDATE()
                 GROUP BY co.id"
            );
            $followUps = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($followUps);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Assigns a professional to an existing consultation
     * 
     * Expected JSON body:
     * {
     *   "professional_id": 42,
     *   "professional_name": "Maria Silva"    // optional but recommended
     * }
     */
    public function professionalSignature(int $consultationId, string $body): string
    {
        $data = json_decode($body, true);

        if (!$data || !isset($data['professional_id'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: professional_id is required']);
        }

        $professionalId   = (int)$data['professional_id'];
        $professionalName = $data['professional_name'] ?? null;

        try {
            // 1. Verify consultation exists
            $stmt = $this->conn->prepare("
                SELECT id, customer_id 
                FROM consultations 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $consultationId]);
            $consultation = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$consultation) {
                http_response_code(404);
                return json_encode(['error' => 'Consultation not found']);
            }

            // 2. Optional: Verify that the professional exists and has proper role
            if ($professionalName === null) {
                $profStmt = $this->conn->prepare("
                    SELECT id, name 
                    FROM users 
                    WHERE id = :id 
                    AND role IN ('doctor', 'professional')
                    AND is_active = 1
                ");
                $profStmt->execute([':id' => $professionalId]);
                $prof = $profStmt->fetch(PDO::FETCH_ASSOC);

                if (!$prof) {
                    http_response_code(400);
                    return json_encode([
                        'error' => 'Invalid or inactive professional selected'
                    ]);
                }

                $professionalName = $prof['name'];
            }

            // 3. Update consultation
            $updateStmt = $this->conn->prepare("
                UPDATE consultations 
                SET 
                    professional_id   = :prof_id,
                    professional_name = :prof_name
                WHERE id = :id
            ");

            $updateStmt->execute([
                ':prof_id'   => $professionalId,
                ':prof_name' => $professionalName,
                ':id'        => $consultationId
            ]);

            if ($updateStmt->rowCount() === 0) {
                http_response_code(500);
                return json_encode(['error' => 'Failed to update consultation - no rows affected']);
            }

            // Success response
            http_response_code(200);
            return json_encode([
                'message'           => 'Professional assigned successfully',
                'consultation_id'   => $consultationId,
                'professional_id'   => $professionalId,
                'professional_name' => $professionalName
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'error'   => 'Database error while assigning professional',
                'message' => $e->getMessage()
            ]);
        }
    }
}
