<?php
namespace src\modules\reminders;

require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ReminderService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Finds customers who need a follow-up reminder for the receptionist.
     */
    public function getCustomersToRemind(): string {
        try {
            // Find customers whose most recent consultation was between 28 and 35 days ago
            // and who haven't already been marked in the reminder list in the last month.
            $stmt = $this->conn->query(
                "SELECT c.id, c.full_name, c.phone, c.email, MAX(co.consultation_date) as last_visit
                 FROM customers c
                 JOIN consultations co ON c.id = co.customer_id
                 GROUP BY c.id
                 HAVING last_visit BETWEEN DATE_SUB(CURDATE(), INTERVAL 35 DAY) AND DATE_SUB(CURDATE(), INTERVAL 28 DAY)
                 AND c.id NOT IN (SELECT customer_id FROM reminders WHERE reminder_date > DATE_SUB(CURDATE(), INTERVAL 28 DAY))"
            );

            $customersToRemind = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($customersToRemind);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Logs that a reminder action has been taken for a customer.
     */
    public function logReminder(string $body): string {
        $data = json_decode($body, true);

        if (!isset($data['customer_id']) || !isset($data['status'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: customer_id and status are required.']);
        }

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO reminders (customer_id, reminder_date, status) VALUES (:customer_id, CURDATE(), :status)"
            );
            $stmt->execute([
                ':customer_id' => $data['customer_id'],
                ':status' => $data['status']
            ]);

            return json_encode(['message' => 'Reminder status logged successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
