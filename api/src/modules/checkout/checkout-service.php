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
     * Processes the sale of prescribed products.
     */
    public function processCheckout(string $body, int $receptionistId): string {
        $data = json_decode($body, true);
        if (!isset($data['prescription_ids']) || !is_array($data['prescription_ids'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: prescription_ids must be an array.']);
        }

        try {
            $this->conn->beginTransaction();

            foreach ($data['prescription_ids'] as $prescriptionId) {
                $stmt = $this->conn->prepare("SELECT product_id, quantity FROM prescriptions WHERE id = :id AND status = 'prescribed'");
                $stmt->execute([':id' => $prescriptionId]);
                $prescription = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$prescription) {
                    throw new Exception("Prescription with ID {$prescriptionId} not found or already processed.");
                }

                $updateStmt = $this->conn->prepare(
                    "UPDATE prescriptions SET status = 'sold', checkout_by_user_id = :user_id, checkout_at = NOW() WHERE id = :id"
                );
                $updateStmt->execute([':user_id' => $receptionistId, ':id' => $prescriptionId]);

                $stockStmt = $this->conn->prepare(
                    "UPDATE products SET stock_quantity = stock_quantity - :quantity WHERE id = :id"
                );
                $stockStmt->execute([':quantity' => $prescription['quantity'], ':id' => $prescription['product_id']]);
            }

            $this->conn->commit();
            return json_encode(['message' => 'Checkout successful.']);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(500);
            return json_encode(['error' => 'An error occurred during checkout: ' . $e->getMessage()]);
        }
    }
}
