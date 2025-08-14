<?php
namespace src\modules\lookups;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class LookupService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Fetches all records from a given lookup table.
     * @param string $tableName The name of the table ('skin_concerns' or 'health_conditions').
     * @return string JSON encoded list of records.
     */
    public function getAll(string $tableName): string {
        if (!$this->isValidTable($tableName)) {
            http_response_code(400);
            return json_encode(['error' => 'Invalid lookup type specified.']);
        }

        try {
            $stmt = $this->conn->query("SELECT * FROM `$tableName` ORDER BY name ASC");
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return json_encode($results);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Creates a new record in a lookup table.
     * @param string $tableName The name of the table.
     * @param string|null $body The raw JSON request body containing the name.
     * @return string JSON encoded success or error message.
     */
    public function create(string $tableName, ?string $body): string {
        if (!$this->isValidTable($tableName)) {
            http_response_code(400);
            return json_encode(['error' => 'Invalid lookup type specified.']);
        }

        $data = json_decode($body);
        if (!isset($data->name) || empty(trim($data->name))) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: name is required.']);
        }

        try {
            $stmt = $this->conn->prepare("INSERT INTO `$tableName` (name) VALUES (:name)");
            $stmt->bindValue(':name', trim($data->name), PDO::PARAM_STR);
            $stmt->execute();
            $id = $this->conn->lastInsertId();
            return json_encode(['message' => 'Lookup item created successfully.', 'id' => $id, 'name' => trim($data->name)]);
        } catch (Exception $e) {
            // Handle unique constraint violation
            if ($e->getCode() == 23000) {
                 http_response_code(409); // Conflict
                 return json_encode(['error' => 'This item already exists.']);
            }
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates an existing record in a lookup table.
     * @param string $tableName The name of the table.
     * @param int $id The ID of the record to update.
     * @param string|null $body The raw JSON request body containing the new name.
     * @return string JSON encoded success or error message.
     */
    public function update(string $tableName, int $id, ?string $body): string {
        if (!$this->isValidTable($tableName)) {
            http_response_code(400);
            return json_encode(['error' => 'Invalid lookup type specified.']);
        }

        $data = json_decode($body);
        if (!isset($data->name) || empty(trim($data->name))) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: name is required.']);
        }

        try {
            $stmt = $this->conn->prepare("UPDATE `$tableName` SET name = :name WHERE id = :id");
            $stmt->bindValue(':name', trim($data->name), PDO::PARAM_STR);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Lookup item not found or no changes made.']);
            }

            return json_encode(['message' => 'Lookup item updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Deletes a record from a lookup table.
     * @param string $tableName The name of the table.
     * @param int $id The ID of the record to delete.
     * @return string JSON encoded success or error message.
     */
    public function delete(string $tableName, int $id): string {
        if (!$this->isValidTable($tableName)) {
            http_response_code(400);
            return json_encode(['error' => 'Invalid lookup type specified.']);
        }

        try {
            $stmt = $this->conn->prepare("DELETE FROM `$tableName` WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Lookup item not found.']);
            }

            return json_encode(['message' => 'Lookup item deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Validates that the table name is one of the allowed lookup tables.
     * @param string $tableName The table name to check.
     * @return bool True if the table is valid, false otherwise.
     */
    private function isValidTable(string $tableName): bool {
        $allowedTables = ['skin_concerns', 'health_conditions'];
        return in_array($tableName, $allowedTables);
    }
}
?>
