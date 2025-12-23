<?php
namespace src\modules\checkout;

require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class CheckoutService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Get all pending prescriptions for a specific customer
     */
    public function getPendingPrescriptionsByCustomer(int $customerId): string {
        try {
            // Get pending product prescriptions for the customer
            $stmt = $this->conn->prepare("
                SELECT 
                    'product' as type,
                    pr.id,
                    pr.consultation_id,
                    pr.product_id,
                    pr.product_name_custom as name,
                    pr.quantity,
                    pr.instructions,
                    pr.status,
                    pr.created_at,
                    p.name as product_name,
                    p.price as unit_price,
                    p.stock_quantity,
                    c.full_name as customer_name,
                    c.id as customer_id,
                    u.name as doctor_name,
                    con.consultation_date
                FROM prescriptions pr
                JOIN consultations con ON pr.consultation_id = con.id
                JOIN customers c ON con.customer_id = c.id
                LEFT JOIN products p ON pr.product_id = p.id
                JOIN users u ON con.doctor_id = u.id
                WHERE c.id = :customer_id 
                AND pr.status = 'prescribed'
                ORDER BY pr.created_at DESC
            ");
            $stmt->execute([':customer_id' => $customerId]);
            $productPrescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get pending service prescriptions for the customer
            $stmt = $this->conn->prepare("
                SELECT 
                    'service' as type,
                    sp.id,
                    NULL as consultation_id,
                    NULL as product_id,
                    sp.name,
                    1 as quantity,
                    sp.prescription_notes as instructions,
                    sp.status,
                    sp.created_at,
                    sp.price as unit_price,
                    c.full_name as customer_name,
                    c.id as customer_id,
                    'Doctor' as doctor_name,
                    sp.created_at as consultation_date
                FROM service_prescription sp
                JOIN customers c ON sp.customer_id = c.id
                WHERE c.id = :customer_id 
                AND sp.status = 'pending'
                ORDER BY sp.created_at DESC
            ");
            $stmt->execute([':customer_id' => $customerId]);
            $servicePrescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Combine results
            $allPrescriptions = array_merge($productPrescriptions, $servicePrescriptions);

            return json_encode([
                'success' => true,
                'data' => $allPrescriptions
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to fetch pending prescriptions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get all pending prescriptions
     */
    public function getAllPendingPrescriptions(): string {
        try {
            // Get pending product prescriptions
            $stmt = $this->conn->prepare("
                SELECT 
                    'product' as type,
                    pr.id,
                    pr.consultation_id,
                    pr.product_id,
                    COALESCE(pr.product_name_custom, p.name) as name,
                    pr.quantity,
                    pr.instructions,
                    pr.status,
                    pr.created_at,
                    p.name as product_name,
                    p.price as unit_price,
                    p.stock_quantity,
                    c.full_name as customer_name,
                    c.id as customer_id,
                    u.name as doctor_name,
                    con.consultation_date
                FROM prescriptions pr
                JOIN consultations con ON pr.consultation_id = con.id
                JOIN customers c ON con.customer_id = c.id
                LEFT JOIN products p ON pr.product_id = p.id
                JOIN users u ON con.doctor_id = u.id
                WHERE pr.status = 'prescribed'
                ORDER BY pr.created_at DESC
            ");
            $stmt->execute();
            $productPrescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get pending service prescriptions
            $stmt = $this->conn->prepare("
                SELECT 
                    'service' as type,
                    sp.id,
                    NULL as consultation_id,
                    NULL as product_id,
                    sp.name,
                    1 as quantity,
                    sp.prescription_notes as instructions,
                    sp.status,
                    sp.created_at,
                    sp.price as unit_price,
                    c.full_name as customer_name,
                    c.id as customer_id,
                    'Doctor' as doctor_name,
                    sp.created_at as consultation_date
                FROM service_prescription sp
                JOIN customers c ON sp.customer_id = c.id
                WHERE sp.status = 'pending'
                ORDER BY sp.created_at DESC
            ");
            $stmt->execute();
            $servicePrescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Combine results
            $allPrescriptions = array_merge($productPrescriptions, $servicePrescriptions);

            return json_encode([
                'success' => true,
                'data' => $allPrescriptions
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'success' => false,
                'error' => 'Failed to fetch pending prescriptions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Processes the sale of prescribed products and services
     */
    public function processCheckout(string $body, int $receptionistId): string {
        $data = json_decode($body, true);
        
        // Check if we're processing by customer ID or specific prescription IDs
        if (isset($data['customer_id'])) {
            // Process all pending prescriptions for a customer
            return $this->processCustomerCheckout($data['customer_id'], $receptionistId);
        } elseif (isset($data['prescription_ids']) && is_array($data['prescription_ids'])) {
            // Process specific prescription IDs (existing behavior)
            return $this->processSpecificPrescriptions($data['prescription_ids'], $receptionistId);
        } else {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: either customer_id or prescription_ids must be provided.']);
        }
    }

    /**
     * Process all pending prescriptions for a specific customer
     */
    private function processCustomerCheckout(int $customerId, int $receptionistId): string {
        try {
            $this->conn->beginTransaction();

            // Process product prescriptions
            $stmt = $this->conn->prepare("
                SELECT 
                    pr.id,
                    pr.product_id, 
                    pr.quantity, 
                    p.stock_quantity, 
                    p.name as product_name
                FROM prescriptions pr
                JOIN consultations con ON pr.consultation_id = con.id
                JOIN products p ON pr.product_id = p.id
                WHERE con.customer_id = :customer_id 
                AND pr.status = 'prescribed'
            ");
            $stmt->execute([':customer_id' => $customerId]);
            $productPrescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($productPrescriptions as $prescription) {
                if ($prescription['stock_quantity'] < $prescription['quantity']) {
                    throw new Exception("Product '{$prescription['product_name']}' is out of stock. {$prescription['stock_quantity']} remaining.");
                }

                $updateStmt = $this->conn->prepare(
                    "UPDATE prescriptions SET status = 'sold', checkout_by_user_id = :user_id, checkout_at = NOW() WHERE id = :id"
                );
                $updateStmt->execute([':user_id' => $receptionistId, ':id' => $prescription['id']]);

                $stockStmt = $this->conn->prepare(
                    "UPDATE products SET stock_quantity = stock_quantity - :quantity WHERE id = :id"
                );
                $stockStmt->execute([':quantity' => $prescription['quantity'], ':id' => $prescription['product_id']]);
            }

            // Process service prescriptions
            $stmt = $this->conn->prepare("
                UPDATE service_prescription 
                SET status = 'completed', updated_at = NOW() 
                WHERE customer_id = :customer_id 
                AND status = 'pending'
            ");
            $stmt->execute([':customer_id' => $customerId]);
            $serviceRowsUpdated = $stmt->rowCount();

            $this->conn->commit();
            
            return json_encode([
                'message' => 'Checkout successful.',
                'products_processed' => count($productPrescriptions),
                'services_processed' => $serviceRowsUpdated
            ]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(409); 
            return json_encode(['error' => 'An error occurred during checkout: ' . $e->getMessage()]);
        }
    }

    /**
     * Process specific prescription IDs
     */
    private function processSpecificPrescriptions(array $prescriptionIds, int $receptionistId): string {
        try {
            $this->conn->beginTransaction();

            foreach ($prescriptionIds as $prescriptionId) {
                // Determine if it's a product or service prescription
                $stmt = $this->conn->prepare("
                    SELECT 'product' as type, product_id, quantity 
                    FROM prescriptions 
                    WHERE id = :id AND status = 'prescribed'
                    UNION ALL
                    SELECT 'service' as type, NULL as product_id, 1 as quantity 
                    FROM service_prescription 
                    WHERE id = :id AND status = 'pending'
                ");
                $stmt->execute([':id' => $prescriptionId]);
                $prescription = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$prescription) {
                    throw new Exception("Prescription with ID {$prescriptionId} not found or already processed.");
                }

                if ($prescription['type'] === 'product') {
                    // Process product prescription
                    $stmt = $this->conn->prepare("
                        SELECT p.stock_quantity, p.name as product_name
                        FROM prescriptions pr
                        JOIN products p ON pr.product_id = p.id
                        WHERE pr.id = :id
                    ");
                    $stmt->execute([':id' => $prescriptionId]);
                    $product = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($product['stock_quantity'] < $prescription['quantity']) {
                        throw new Exception("Product '{$product['product_name']}' is out of stock. {$product['stock_quantity']} remaining.");
                    }

                    $updateStmt = $this->conn->prepare(
                        "UPDATE prescriptions SET status = 'sold', checkout_by_user_id = :user_id, checkout_at = NOW() WHERE id = :id"
                    );
                    $updateStmt->execute([':user_id' => $receptionistId, ':id' => $prescriptionId]);

                    $stockStmt = $this->conn->prepare(
                        "UPDATE products SET stock_quantity = stock_quantity - :quantity WHERE id = :product_id"
                    );
                    $stockStmt->execute([':quantity' => $prescription['quantity'], ':product_id' => $prescription['product_id']]);
                } else {
                    // Process service prescription
                    $updateStmt = $this->conn->prepare(
                        "UPDATE service_prescription SET status = 'completed', updated_at = NOW() WHERE id = :id"
                    );
                    $updateStmt->execute([':id' => $prescriptionId]);
                }
            }

            $this->conn->commit();
            return json_encode(['message' => 'Checkout successful.']);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(409); 
            return json_encode(['error' => 'An error occurred during checkout: ' . $e->getMessage()]);
        }
    }

    /**
     * Update prescription status by ID or customer ID
     */
    public function updatePrescriptionStatus(string $body, int $userId): string {
        $data = json_decode($body, true);
        
        if (!isset($data['status']) || !in_array($data['status'], ['sold', 'completed', 'cancelled', 'pending'])) {
            http_response_code(400);
            return json_encode(['error' => 'Invalid status value']);
        }

        try {
            $this->conn->beginTransaction();

            if (isset($data['prescription_id'])) {
                // Update specific prescription by ID
                if (isset($data['type']) && $data['type'] === 'service') {
                    $stmt = $this->conn->prepare("
                        UPDATE service_prescription 
                        SET status = :status, updated_at = NOW() 
                        WHERE id = :id
                    ");
                    $stmt->execute([
                        ':status' => $data['status'],
                        ':id' => $data['prescription_id']
                    ]);
                } else {
                    $stmt = $this->conn->prepare("
                        UPDATE prescriptions 
                        SET status = :status, 
                            checkout_by_user_id = :user_id, 
                            checkout_at = CASE WHEN :status = 'sold' THEN NOW() ELSE NULL END
                        WHERE id = :id
                    ");
                    $stmt->execute([
                        ':status' => $data['status'],
                        ':user_id' => $userId,
                        ':id' => $data['prescription_id']
                    ]);
                }
            } elseif (isset($data['customer_id'])) {
                // Update all prescriptions for a customer
                if (isset($data['type']) && $data['type'] === 'service') {
                    $stmt = $this->conn->prepare("
                        UPDATE service_prescription 
                        SET status = :status, updated_at = NOW() 
                        WHERE customer_id = :customer_id
                    ");
                    $stmt->execute([
                        ':status' => $data['status'],
                        ':customer_id' => $data['customer_id']
                    ]);
                } else {
                    $stmt = $this->conn->prepare("
                        UPDATE prescriptions pr
                        JOIN consultations con ON pr.consultation_id = con.id
                        SET pr.status = :status, 
                            pr.checkout_by_user_id = :user_id, 
                            pr.checkout_at = CASE WHEN :status = 'sold' THEN NOW() ELSE NULL END
                        WHERE con.customer_id = :customer_id
                    ");
                    $stmt->execute([
                        ':status' => $data['status'],
                        ':user_id' => $userId,
                        ':customer_id' => $data['customer_id']
                    ]);
                }
            } else {
                throw new Exception("Either prescription_id or customer_id must be provided");
            }

            $this->conn->commit();
            return json_encode(['message' => 'Status updated successfully']);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(500);
            return json_encode(['error' => 'Failed to update status: ' . $e->getMessage()]);
        }
    }
}