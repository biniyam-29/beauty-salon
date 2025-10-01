<?php
namespace src\modules\phone;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class PhoneService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    public function createPhoneBooking(string $body): string {
        $data = json_decode($body, true);

        if (!isset($data['customer_name'], $data['phone'], $data['appointment_time'], $data['reception_id'])) {
            http_response_code(400);
            return json_encode(['error' => 'customer_name, phone, appointment_time, and reception_id are required.']);
        }

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO phone_bookings (reception_id, customer_name, phone, appointment_time)
                 VALUES (:reception_id, :customer_name, :phone, :appointment_time)"
            );
            $stmt->execute([
                ':reception_id' => $data['reception_id'],
                ':customer_name' => $data['customer_name'],
                ':phone' => $data['phone'],
                ':appointment_time' => $data['appointment_time']
            ]);

            $bookingId = $this->conn->lastInsertId();
            return json_encode(['message' => 'Phone booking created successfully.', 'bookingId' => $bookingId]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function getPhoneBookings(?int $id = null): string {
        try {
            if ($id) {
                $stmt = $this->conn->prepare("SELECT * FROM phone_bookings WHERE id = :id");
                $stmt->execute([':id' => $id]);
                $booking = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$booking) {
                    http_response_code(404);
                    return json_encode(['error' => 'Booking not found.']);
                }
                return json_encode($booking);
            } else {
                $stmt = $this->conn->query("SELECT * FROM phone_bookings ORDER BY call_received_at DESC");
                $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
                return json_encode($bookings);
            }
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function deletePhoneBooking(int $id): string {
        try {
            $stmt = $this->conn->prepare("DELETE FROM phone_bookings WHERE id = :id");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Booking not found.']);
            }

            return json_encode(['message' => 'Phone booking deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Update a phone booking
     */
    public function updatePhoneBooking(int $id, string $body): string {
        $data = json_decode($body, true);

        if (empty($data)) {
            http_response_code(400);
            return json_encode(['error' => 'No data provided for update.']);
        }

        $allowedFields = ['customer_name', 'phone', 'appointment_time'];
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
        $sql = "UPDATE phone_bookings SET " . implode(', ', $fieldsToUpdate) . " WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Booking not found or no changes made.']);
            }

            return json_encode(['message' => 'Phone booking updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
