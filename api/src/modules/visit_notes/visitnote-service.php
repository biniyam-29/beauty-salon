<?php
namespace src\modules\notes;

require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class VisitNoteService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Creates a new note for a customer.
     */
    public function createNote(int $customerId, string $body, int $authorId): string {
        $data = json_decode($body, true);
        if (!isset($data['note_text']) || empty($data['note_text'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: note_text is required.']);
        }

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO visit_notes (customer_id, reception_id, note_text) VALUES (:customer_id, :reception_id, :note_text)"
            );
            $stmt->execute([
                ':customer_id' => $customerId,
                ':reception_id' => $authorId,
                ':note_text' => $data['note_text']
            ]);
            $noteId = $this->conn->lastInsertId();
            return json_encode(['message' => 'Note added successfully.', 'noteId' => $noteId]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves all notes for a specific customer.
     */
    public function getNotesForCustomer(int $customerId): string {
        try {
            $stmt = $this->conn->prepare(
                "SELECT vn.id, vn.note_text, vn.status, vn.created_at, u.name as author_name 
                 FROM visit_notes vn
                 JOIN users u ON vn.reception_id = u.id
                 WHERE vn.customer_id = :customer_id 
                 ORDER BY vn.created_at DESC"
            );
            $stmt->execute([':customer_id' => $customerId]);
            $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return json_encode($notes);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves a single note by its ID.
     */
    public function getNoteById(int $noteId): string {
        try {
            $stmt = $this->conn->prepare(
                "SELECT vn.id, vn.note_text, vn.status, vn.created_at, u.name as author_name 
                 FROM visit_notes vn
                 JOIN users u ON vn.reception_id = u.id
                 WHERE vn.id = :id"
            );
            $stmt->execute([':id' => $noteId]);
            $note = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$note) {
                http_response_code(404);
                return json_encode(['error' => 'Note not found.']);
            }
            return json_encode($note);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Updates the text or status of a specific note.
     */
    public function updateNote(int $noteId, string $body): string {
        $data = json_decode($body, true);
        if (empty($data)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No data provided.']);
        }

        try {
            $stmt = $this->conn->prepare("SELECT * FROM visit_notes WHERE id = :id");
            $stmt->execute([':id' => $noteId]);
            $existingNote = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$existingNote) {
                http_response_code(404);
                return json_encode(['error' => 'Note not found.']);
            }

            $noteTextChanged = isset($data['note_text']) && $data['note_text'] !== $existingNote['note_text'];
            $statusChanged = isset($data['status']) && $data['status'] !== $existingNote['status'];

            if (!$noteTextChanged && !$statusChanged) {
                http_response_code(200);
                return json_encode(['message' => 'No changes detected.']);
            }

            $this->updateTable('visit_notes', $noteId, $data, ['note_text', 'status'], 'id');
            return json_encode(['message' => 'Note updated successfully.']);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Deletes a specific note.
     */
    public function deleteNote(int $noteId): string {
        try {
            $stmt = $this->conn->prepare("DELETE FROM visit_notes WHERE id = :id");
            $stmt->execute([':id' => $noteId]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Note not found.']);
            }
            return json_encode(['message' => 'Note deleted successfully.']);
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

            if ($stmt->rowCount() === 0) {
                // Throw an exception to be caught by the public method
                throw new Exception('Item not found or no changes made.', 404);
            }
        } else {
             throw new Exception('No valid fields to update.', 400);
        }
    }
}
