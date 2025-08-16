<?php
namespace src\modules\contraindications;

require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ContraindicationService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Retrieves all contraindication rules for a specific product.
     */
    public function getRulesForProduct(int $productId): string {
        try {
            $stmt = $this->conn->prepare(
                "SELECT pc.condition_id, hc.name as condition_name, pc.reason 
                 FROM product_contraindications pc
                 JOIN health_conditions hc ON pc.condition_id = hc.id
                 WHERE pc.product_id = :product_id"
            );
            $stmt->execute([':product_id' => $productId]);
            $rules = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rules);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Adds a new contraindication rule for a product.
     */
    public function addRule(int $productId, string $body): string {
        $data = json_decode($body, true);
        if (!isset($data['condition_id'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: condition_id is required.']);
        }

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO product_contraindications (product_id, condition_id, reason) VALUES (:product_id, :condition_id, :reason)"
            );
            $stmt->execute([
                ':product_id' => $productId,
                ':condition_id' => $data['condition_id'],
                ':reason' => $data['reason'] ?? null
            ]);
            return json_encode(['message' => 'Contraindication rule added successfully.']);
        } catch (Exception $e) {
            if ($e->getCode() == 23000) {
                return json_encode(['message' => 'This rule already exists.']);
            }
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Deletes a contraindication rule.
     */
    public function deleteRule(int $productId, int $conditionId): string {
        try {
            $stmt = $this->conn->prepare(
                "DELETE FROM product_contraindications WHERE product_id = :product_id AND condition_id = :condition_id"
            );
            $stmt->execute([':product_id' => $productId, ':condition_id' => $conditionId]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Rule not found.']);
            }
            return json_encode(['message' => 'Contraindication rule deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
