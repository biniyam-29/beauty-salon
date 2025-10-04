<?php
namespace src\modules\phone;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../utils/Validation.php';

use src\config\Database;
use src\utils\Validation;
use PDO;
use Exception;
use DateTime;

class PhoneService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Get all phone bookings or a specific booking by ID
     */
    public function getPhoneBookings(?string $id = null): string {
        try {
            // First, update expired bookings
            $this->updateExpiredBookings();

            if ($id) {
                // Get single booking
                return $this->getBookingById($id);
            } else {
                // Get all bookings with filtering and sorting
                return $this->getAllBookings();
            }
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Get a single booking by ID
     */
    private function getBookingById(string $id): string {
        $stmt = $this->conn->prepare(
            "SELECT pb.*, u.name as reception_name 
             FROM phone_bookings pb 
             LEFT JOIN users u ON pb.reception_id = u.id 
             WHERE pb.id = :id"
        );
        $stmt->execute([':id' => $id]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$booking) {
            http_response_code(404);
            return json_encode(['error' => 'Phone booking not found.']);
        }

        return json_encode(['data' => $booking]);
    }

    /**
     * Get all bookings with filtering and sorting
     */
    private function getAllBookings(): string {
        // Get query parameters
        $date = $_GET['date'] ?? null;
        $status = $_GET['status'] ?? null;
        $reception_id = $_GET['reception_id'] ?? null;
        $is_expired = $_GET['is_expired'] ?? null;
        $sort_by = $_GET['sort_by'] ?? 'booking_date';
        $sort_order = $_GET['sort_order'] ?? 'DESC';

        // Validate sort parameters
        $allowed_sorts = ['booking_date', 'booking_time', 'created_at', 'customer_name'];
        $sort_by = in_array($sort_by, $allowed_sorts) ? $sort_by : 'booking_date';
        $sort_order = strtoupper($sort_order) === 'ASC' ? 'ASC' : 'DESC';

        $sql = "SELECT pb.*, u.name as reception_name 
                FROM phone_bookings pb 
                LEFT JOIN users u ON pb.reception_id = u.id 
                WHERE 1=1";
        
        $params = [];

        // Apply filters
        if ($date) {
            $sql .= " AND pb.booking_date = :date";
            $params[':date'] = $date;
        }

        if ($status) {
            $sql .= " AND pb.status = :status";
            $params[':status'] = $status;
        }

        if ($reception_id) {
            $sql .= " AND pb.reception_id = :reception_id";
            $params[':reception_id'] = $reception_id;
        }

        if ($is_expired !== null) {
            $sql .= " AND pb.is_expired = :is_expired";
            $params[':is_expired'] = $is_expired ? 1 : 0;
        }

        $sql .= " ORDER BY pb.{$sort_by} {$sort_order}, pb.booking_time {$sort_order}";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return json_encode(['data' => $bookings]);
    }

    /**
     * Create a new phone booking
     */
    public function createPhoneBooking(string $body): string {
        $data = json_decode($body, true);

        // Validate required fields
        $validationErrors = $this->validateBookingData($data);
        if (!empty($validationErrors)) {
            http_response_code(400);
            return json_encode(['error' => 'Validation failed', 'details' => $validationErrors]);
        }

        // Check for past dates
        $bookingDateTime = $data['booking_date'] . ' ' . $data['booking_time'];
        if (strtotime($bookingDateTime) < time()) {
            http_response_code(400);
            return json_encode(['error' => 'Cannot create booking with past date and time.']);
        }

        try {
            $this->conn->beginTransaction();

            // Get current user ID from session
            $reception_id = $_SESSION['user_id'] ?? null;
            if (!$reception_id) {
                throw new Exception('Unable to determine receptionist ID.');
            }

            // Check if customer exists by phone
            $customer_id = $this->findCustomerByPhone($data['customer_phone']);

            $stmt = $this->conn->prepare(
                "INSERT INTO phone_bookings 
                (customer_id, reception_id, customer_name, customer_phone, service_name, booking_date, booking_time, notes, status, is_expired) 
                VALUES (:customer_id, :reception_id, :customer_name, :customer_phone, :service_name, :booking_date, :booking_time, :notes, 'scheduled', FALSE)"
            );

            $stmt->execute([
                ':customer_id' => $customer_id,
                ':reception_id' => $reception_id,
                ':customer_name' => $data['customer_name'],
                ':customer_phone' => $data['customer_phone'],
                ':service_name' => $data['service_name'],
                ':booking_date' => $data['booking_date'],
                ':booking_time' => $data['booking_time'],
                ':notes' => $data['notes'] ?? null
            ]);

            $bookingId = $this->conn->lastInsertId();

            // Log the action
            $this->logAction('CREATE', "Created phone booking #{$bookingId} for {$data['customer_name']}");

            $this->conn->commit();

            return json_encode([
                'message' => 'Phone booking created successfully.',
                'booking_id' => $bookingId
            ]);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(500);
            return json_encode(['error' => 'Failed to create phone booking: ' . $e->getMessage()]);
        }
    }

    /**
     * Update an existing phone booking
     */
    public function updatePhoneBooking(string $id, string $body): string {
        $data = json_decode($body, true);

        // Validate the booking exists
        $existingBooking = $this->getBookingRecord($id);
        if (!$existingBooking) {
            http_response_code(404);
            return json_encode(['error' => 'Phone booking not found.']);
        }

        // Validate update data
        $validationErrors = $this->validateBookingData($data, true);
        if (!empty($validationErrors)) {
            http_response_code(400);
            return json_encode(['error' => 'Validation failed', 'details' => $validationErrors]);
        }

        try {
            $this->conn->beginTransaction();

            // Build dynamic update query
            $allowedFields = [
                'customer_name', 'customer_phone', 'service_name', 
                'booking_date', 'booking_time', 'notes', 'status'
            ];

            $updates = [];
            $params = [':id' => $id];

            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $updates[] = "{$field} = :{$field}";
                    $params[":{$field}"] = $data[$field];
                }
            }

            // Check for date/time changes to update is_expired
            if (isset($data['booking_date']) || isset($data['booking_time'])) {
                $bookingDate = $data['booking_date'] ?? $existingBooking['booking_date'];
                $bookingTime = $data['booking_time'] ?? $existingBooking['booking_time'];
                $bookingDateTime = $bookingDate . ' ' . $bookingTime;
                
                $is_expired = (strtotime($bookingDateTime) < time()) ? 1 : 0;
                $updates[] = "is_expired = :is_expired";
                $params[':is_expired'] = $is_expired;
            }

            if (empty($updates)) {
                http_response_code(400);
                return json_encode(['error' => 'No valid fields to update.']);
            }

            $updates[] = "updated_at = CURRENT_TIMESTAMP";
            $sql = "UPDATE phone_bookings SET " . implode(', ', $updates) . " WHERE id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Phone booking not found or no changes made.']);
            }

            // Log the action
            $this->logAction('UPDATE', "Updated phone booking #{$id}");

            $this->conn->commit();

            return json_encode(['message' => 'Phone booking updated successfully.']);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(500);
            return json_encode(['error' => 'Failed to update phone booking: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete a phone booking
     */
    public function deletePhoneBooking(string $id): string {
        // Validate the booking exists
        $existingBooking = $this->getBookingRecord($id);
        if (!$existingBooking) {
            http_response_code(404);
            return json_encode(['error' => 'Phone booking not found.']);
        }

        try {
            $this->conn->beginTransaction();

            $stmt = $this->conn->prepare("DELETE FROM phone_bookings WHERE id = :id");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Phone booking not found.']);
            }

            // Log the action with warning if expired
            $logMessage = "Deleted phone booking #{$id} for {$existingBooking['customer_name']}";
            if ($existingBooking['is_expired']) {
                $logMessage .= " (EXPIRED BOOKING)";
            }
            $this->logAction('DELETE', $logMessage);

            $this->conn->commit();

            return json_encode(['message' => 'Phone booking deleted successfully.']);

        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(500);
            return json_encode(['error' => 'Failed to delete phone booking: ' . $e->getMessage()]);
        }
    }

    /**
     * Validate booking data
     */
    private function validateBookingData(array $data, bool $isUpdate = false): array {
        $errors = [];

        if (!$isUpdate || array_key_exists('customer_name', $data)) {
            if (empty(trim($data['customer_name'] ?? ''))) {
                $errors['customer_name'] = 'Customer name is required.';
            } elseif (strlen($data['customer_name']) > 255) {
                $errors['customer_name'] = 'Customer name must not exceed 255 characters.';
            }
        }

        if (!$isUpdate || array_key_exists('customer_phone', $data)) {
            if (empty(trim($data['customer_phone'] ?? ''))) {
                $errors['customer_phone'] = 'Customer phone is required.';
            } elseif (!Validation::validatePhone($data['customer_phone'])) {
                $errors['customer_phone'] = 'Invalid phone number format.';
            }
        }

        if (!$isUpdate || array_key_exists('service_name', $data)) {
            if (empty(trim($data['service_name'] ?? ''))) {
                $errors['service_name'] = 'Service name is required.';
            } elseif (strlen($data['service_name']) > 100) {
                $errors['service_name'] = 'Service name must not exceed 100 characters.';
            }
        }

        if (!$isUpdate || array_key_exists('booking_date', $data)) {
            if (!empty($data['booking_date']) && !Validation::validateDate($data['booking_date'])) {
                $errors['booking_date'] = 'Invalid date format. Use YYYY-MM-DD.';
            }
        }

        if (!$isUpdate || array_key_exists('booking_time', $data)) {
            if (!empty($data['booking_time']) && !Validation::validateTime($data['booking_time'])) {
                $errors['booking_time'] = 'Invalid time format. Use HH:MM:SS.';
            }
        }

        if (array_key_exists('status', $data)) {
            $allowedStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
            if (!in_array($data['status'], $allowedStatuses)) {
                $errors['status'] = 'Invalid status. Must be one of: ' . implode(', ', $allowedStatuses);
            }
        }

        return $errors;
    }

    /**
     * Find customer by phone number
     */
    private function findCustomerByPhone(string $phone): ?int {
        $stmt = $this->conn->prepare("SELECT id FROM customers WHERE phone = :phone");
        $stmt->execute([':phone' => $phone]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $customer ? $customer['id'] : null;
    }

    /**
     * Get booking record by ID
     */
    private function getBookingRecord(string $id): ?array {
        $stmt = $this->conn->prepare("SELECT * FROM phone_bookings WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Update expired bookings automatically
     */
    private function updateExpiredBookings(): void {
        try {
            $stmt = $this->conn->prepare(
                "UPDATE phone_bookings 
                 SET is_expired = TRUE 
                 WHERE booking_date < CURDATE() 
                 AND status = 'scheduled' 
                 AND is_expired = FALSE"
            );
            $stmt->execute();
        } catch (Exception $e) {
            // Log error but don't break the request
            error_log("Failed to update expired bookings: " . $e->getMessage());
        }
    }

    /**
     * Log actions to audit log
     */
    private function logAction(string $action, string $details): void {
        try {
            $user_id = $_SESSION['user_id'] ?? null;
            if ($user_id) {
                $stmt = $this->conn->prepare(
                    "INSERT INTO audit_log (user_id, action, details) 
                     VALUES (:user_id, :action, :details)"
                );
                $stmt->execute([
                    ':user_id' => $user_id,
                    ':action' => $action,
                    ':details' => $details
                ]);
            }
        } catch (Exception $e) {
            // Log error but don't break the main operation
            error_log("Failed to log action: " . $e->getMessage());
        }
    }
}