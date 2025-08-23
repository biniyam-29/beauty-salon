<?php
namespace src\modules\customers;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class CustomerService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Creates a new customer and their associated profile data in a single transaction.
     */
    public function createCustomer(string $body): string {
        $data = json_decode($body, true);

        // Basic validation
        if (!isset($data['full_name']) || !isset($data['phone'])) {
            http_response_code(400);
            return json_encode(['error' => 'Full name and phone number are required.']);
        }

        try {
            $stmt = $this->conn->prepare("SELECT id FROM customers WHERE email = :email OR phone = :phone");
            $stmt->execute([':email' => $data['email'] ?? null, ':phone' => $data['phone']]);
            if ($stmt->fetch()) {
                http_response_code(409); // 409 Conflict
                return json_encode(['error' => 'A customer with this email or phone number already exists.']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error during validation: ' . $e->getMessage()]);
        }

        try {
            $this->conn->beginTransaction();

            // 1. Insert into `customers` table
            $stmt = $this->conn->prepare(
                "INSERT INTO customers (full_name, phone, email, address, city, birth_date,assigned_doctor_id, emergency_contact_name, emergency_contact_phone, how_heard)
                 VALUES (:full_name, :phone, :email, :address, :city, :birth_date, :assigned_doctor_id,:emergency_contact_name, :emergency_contact_phone, :how_heard)"
            );
            $stmt->execute([
                ':full_name' => $data['full_name'],
                ':phone' => $data['phone'],
                ':email' => $data['email'] ?? null,
                ':address' => $data['address'] ?? null,
                ':city' => $data['city'] ?? null,
                ':birth_date' => $data['birth_date'] ?? null,
                ':assigned_doctor_id' => $data['assigned_doctor_id'] ?? null,
                ':emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                ':emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
                ':how_heard' => $data['how_heard'] ?? null
            ]);
            $customerId = $this->conn->lastInsertId();

            // 2. Insert into `customer_profile` table
            $profile = $data['profile'] ?? [];
            $stmt = $this->conn->prepare(
                "INSERT INTO customer_profile (customer_id, skin_type, skin_feel, sun_exposure, foundation_type, healing_profile, bruises_easily, used_products, uses_retinoids_acids, recent_dermal_fillers, previous_acne_medication, known_allergies_details, dietary_supplements, current_prescription, other_conditions, other_medication, smokes, drinks)
                 VALUES (:customer_id, :skin_type, :skin_feel, :sun_exposure, :foundation_type, :healing_profile, :bruises_easily, :used_products, :uses_retinoids_acids, :recent_dermal_fillers, :previous_acne_medication, :known_allergies_details, :dietary_supplements, :current_prescription, :other_conditions, :other_medication, :smokes, :drinks)"
            );
            $stmt->execute([
                ':customer_id' => $customerId,
                ':skin_type' => $profile['skin_type'] ?? null,
                ':skin_feel' => $profile['skin_feel'] ?? null,
                ':sun_exposure' => $profile['sun_exposure'] ?? null,
                ':foundation_type' => $profile['foundation_type'] ?? null,
                ':healing_profile' => $profile['healing_profile'] ?? null,
                ':bruises_easily' => $profile['bruises_easily'] ?? 0,
                ':used_products' => isset($profile['used_products']) ? json_encode($profile['used_products']) : null,
                ':uses_retinoids_acids' => $profile['uses_retinoids_acids'] ?? 0,
                ':recent_dermal_fillers' => $profile['recent_dermal_fillers'] ?? 0,
                ':previous_acne_medication' => $profile['previous_acne_medication'] ?? null,
                ':known_allergies_details' => $profile['known_allergies_details'] ?? null,
                ':dietary_supplements' => $profile['dietary_supplements'] ?? null,
                ':current_prescription' => $profile['current_prescription'] ?? null,
                ':other_conditions' => $profile['other_conditions'] ?? null,
                ':other_medication' => $profile['other_medication'] ?? null,
                ':smokes' => $profile['smokes'] ?? 0,
                ':drinks' => $profile['drinks'] ?? 0
            ]);

            // 3. Insert into `customer_skin_concerns`
            if (!empty($data['skin_concerns'])) {
                $stmt = $this->conn->prepare("INSERT INTO customer_skin_concerns (customer_id, concern_id) VALUES (:customer_id, :concern_id)");
                foreach ($data['skin_concerns'] as $concernId) {
                    $stmt->execute([':customer_id' => $customerId, ':concern_id' => $concernId]);
                }
            }

            // 4. Insert into `customer_health_conditions`
            if (!empty($data['health_conditions'])) {
                $stmt = $this->conn->prepare("INSERT INTO customer_health_conditions (customer_id, condition_id) VALUES (:customer_id, :condition_id)");
                foreach ($data['health_conditions'] as $conditionId) {
                    $stmt->execute([':customer_id' => $customerId, ':condition_id' => $conditionId]);
                }
            }

            $this->conn->commit();
            return json_encode(['message' => 'Customer created successfully.', 'customerId' => $customerId]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetches a paginated list of all customers.
     */
    public function getAllCustomers($page = 1): string {
        $limit = 10;
        $offset = max(0, ($page - 1)) * $limit;

        try {
            $stmt = $this->conn->prepare("SELECT id, full_name, phone, email FROM customers ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $totalStmt = $this->conn->query("SELECT COUNT(*) FROM customers");
            $totalCustomers = $totalStmt->fetchColumn();

            return json_encode([
                'customers' => $customers,
                'totalPages' => ceil($totalCustomers / $limit),
                'currentPage' => (int)$page
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

/**
     * Gets all customers assigned to the currently logged-in doctor.
     *
     * @param int $doctorId The ID of the logged-in doctor.
     * @param int $page The current page for pagination.
     * @return string JSON encoded list of customers.
     */
    public function getAllAssignedCustomers(int $doctorId, $page = 1): string {
        $limit = 10;
        $offset = max(0, ($page - 1)) * $limit;

        try {
            // Get the paginated list of customers assigned to this doctor
            $stmt = $this->conn->prepare(
                "SELECT id, full_name, phone, email 
                 FROM customers 
                 WHERE assigned_doctor_id = :doctorId 
                 ORDER BY created_at DESC 
                 LIMIT :limit OFFSET :offset"
            );
            $stmt->bindValue(':doctorId', $doctorId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get the total count of customers assigned to this doctor for pagination
            $totalStmt = $this->conn->prepare("SELECT COUNT(*) FROM customers WHERE assigned_doctor_id = :doctorId");
            $totalStmt->bindValue(':doctorId', $doctorId, PDO::PARAM_INT);
            $totalStmt->execute();
            $totalCustomers = $totalStmt->fetchColumn();

            return json_encode([
                'customers' => $customers,
                'totalPages' => ceil($totalCustomers / $limit),
                'currentPage' => (int)$page
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Fetches a single customer's complete profile by their ID.
     */
    public function getCustomerById($id): string {
        try {
            $this->conn->beginTransaction();

            // Get main customer data
            $stmt = $this->conn->prepare("SELECT * FROM customers WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $customer = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$customer) {
                http_response_code(404);
                return json_encode(['error' => 'Customer not found.']);
            }

            // Get profile data
            $stmt = $this->conn->prepare("SELECT * FROM customer_profile WHERE customer_id = :id");
            $stmt->execute([':id' => $id]);
            $customer['profile'] = $stmt->fetch(PDO::FETCH_ASSOC);

            // Get skin concerns
            $stmt = $this->conn->prepare("SELECT sc.id, sc.name FROM skin_concerns sc JOIN customer_skin_concerns csc ON sc.id = csc.concern_id WHERE csc.customer_id = :id");
            $stmt->execute([':id' => $id]);
            $customer['skin_concerns'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get health conditions
            $stmt = $this->conn->prepare("SELECT hc.id, hc.name FROM health_conditions hc JOIN customer_health_conditions chc ON hc.id = chc.condition_id WHERE chc.customer_id = :id");
            $stmt->execute([':id' => $id]);
            $customer['health_conditions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            //Get customer consents
            $stmt = $this->conn->prepare("SELECT id, signature_data, consent_date, created_at FROM customer_consents WHERE customer_id = :id ORDER BY consent_date DESC");
            $stmt->execute([':id' => $id]);
            $customer['consents'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->conn->commit();
            return json_encode($customer);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates a customer's basic information.
     */
    public function updateCustomer($id, string $body): string {
        $data = json_decode($body, true);
        if (empty($data)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No data provided.']);
        }

        try {
            $this->conn->beginTransaction();

            // Update the main `customers` table
            $this->updateTable('customers', $id, $data, ['full_name', 'phone', 'email', 'address', 'city', 'birth_date', 'assigned_doctor_id', 'emergency_contact_name', 'emergency_contact_phone', 'how_heard'], 'id');
            
            // Update the `customer_profile` table
            if (isset($data['profile'])) {
                $allowedProfileFields = [
                    'skin_type', 'skin_feel', 'sun_exposure', 'foundation_type', 'healing_profile', 
                    'bruises_easily', 'used_products', 'uses_retinoids_acids', 'recent_dermal_fillers', 
                    'previous_acne_medication', 'known_allergies_details', 'dietary_supplements', 
                    'current_prescription', 'other_conditions', 'other_medication', 'smokes', 'drinks'
                ];
                $this->updateTable('customer_profile', $id, $data['profile'], $allowedProfileFields, 'customer_id');
            }

            $this->conn->commit();
            return json_encode(['message' => 'Customer details updated successfully.']);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function addSkinConcern(int $customerId, ?string $body): string {
        $data = json_decode($body, true);
        if (!isset($data['concern_id'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: concern_id is required.']);
        }
        return $this->addLink('customer_skin_concerns', $customerId, $data['concern_id'], 'concern_id');
    }

    public function endSkinConcern(int $customerId, int $concernId): string {
        return $this->endLink('customer_skin_concerns', $customerId, $concernId, 'concern_id');
    }

    public function deleteSkinConcern(int $customerId, int $concernId): string {
        return $this->deleteLink('customer_skin_concerns', $customerId, $concernId, 'concern_id');
    }

    public function addHealthCondition(int $customerId, ?string $body): string {
        $data = json_decode($body, true);
        if (!isset($data['condition_id'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: condition_id is required.']);
        }
        return $this->addLink('customer_health_conditions', $customerId, $data['condition_id'], 'condition_id');
    }

    public function endHealthCondition(int $customerId, int $conditionId): string {
        return $this->endLink('customer_health_conditions', $customerId, $conditionId, 'condition_id');
    }

    public function deleteHealthCondition(int $customerId, int $conditionId): string {
        return $this->deleteLink('customer_health_conditions', $customerId, $conditionId, 'condition_id');
    }

    /**
     * Deletes a customer and all their related data.
     */
    public function deleteCustomer($id): string {
        try {
            $stmt = $this->conn->prepare("DELETE FROM customers WHERE id = :id");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Customer not found.']);
            }

            return json_encode(['message' => 'Customer deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }


    private function addLink(string $tableName, int $customerId, int $foreignId, string $foreignKeyColumn): string {
        try {
            $stmt = $this->conn->prepare("INSERT INTO `$tableName` (customer_id, `$foreignKeyColumn`) VALUES (:customer_id, :foreign_id)");
            $stmt->execute([':customer_id' => $customerId, ':foreign_id' => $foreignId]);
            return json_encode(['message' => 'Item added successfully.']);
        } catch (Exception $e) {
            if ($e->getCode() == 23000) {
                return json_encode(['message' => 'Item already exists for this customer.']);
            }
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    private function endLink(string $tableName, int $customerId, int $foreignId, string $foreignKeyColumn): string {
        try {
            $stmt = $this->conn->prepare("UPDATE `$tableName` SET end_date = CURDATE() WHERE customer_id = :customer_id AND `$foreignKeyColumn` = :foreign_id AND end_date IS NULL");
            $stmt->execute([':customer_id' => $customerId, ':foreign_id' => $foreignId]);
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Active item not found for this customer.']);
            }
            return json_encode(['message' => 'Item marked as ended successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    private function deleteLink(string $tableName, int $customerId, int $foreignId, string $foreignKeyColumn): string {
        try {
            $stmt = $this->conn->prepare("DELETE FROM `$tableName` WHERE customer_id = :customer_id AND `$foreignKeyColumn` = :foreign_id");
            $stmt->execute([':customer_id' => $customerId, ':foreign_id' => $foreignId]);
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Item not found for this customer.']);
            }
            return json_encode(['message' => 'Item permanently deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

        /**
     * Helper function to dynamically build and execute an UPDATE statement.
     */
    private function updateTable(string $tableName, int $id, array $data, array $allowedFields, string $idColumn): void {
        $fieldsToUpdate = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fieldsToUpdate[] = "`$field` = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (!empty($fieldsToUpdate)) {
            $params['id'] = $id;
            $sql = "UPDATE `$tableName` SET " . implode(', ', $fieldsToUpdate) . " WHERE `$idColumn` = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
        }
    }

    /**
     * Adds a consent record for a customer.
     */
    public function addConsent(int $customerId, ?string $body): string {
        $data = json_decode($body, true);
        if (!isset($data['signature_data']) || !isset($data['consent_date'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: signature_data and consent_date are required.']);
        }

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO customer_consents (customer_id, signature_data, consent_date) VALUES (:customer_id, :signature_data, :consent_date)"
            );
            $stmt->execute([
                ':customer_id' => $customerId,
                ':signature_data' => $data['signature_data'],
                ':consent_date' => $data['consent_date']
            ]);

            return json_encode(['message' => 'Consent recorded successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }


    /**
     * Deletes a specific consent record.
     */
    public function deleteConsent(int $customerId, int $consentId): string {
        try {
            $stmt = $this->conn->prepare(
                "DELETE FROM customer_consents WHERE id = :consent_id AND customer_id = :customer_id"
            );
            $stmt->execute([
                ':consent_id' => $consentId,
                ':customer_id' => $customerId
            ]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Consent record not found for this customer.']);
            }

            return json_encode(['message' => 'Consent record deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
