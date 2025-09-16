<?php
namespace src\modules\images;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ImageService {
    private PDO $conn;
    // Define the public-facing base directory for uploads.
    // This path is relative to your API's root URL.
    private const UPLOAD_DIR = 'uploads/consultations/';

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Handles the upload of an image file for a consultation.
     */
    public function uploadImage(int $consultationId, array $file, ?string $description): string {
        try {
            // Ensure the consultation exists before proceeding
            $stmt = $this->conn->prepare("SELECT id FROM consultations WHERE id = :id");
            $stmt->execute([':id' => $consultationId]);
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Consultation not found.']);
            }

            // --- File Validation ---
            if ($file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                return json_encode(['error' => 'File upload error code: ' . $file['error']]);
            }
            if ($file['size'] > 5 * 1024 * 1024) { // 5 MB limit
                http_response_code(400);
                return json_encode(['error' => 'File is too large. Maximum size is 5MB.']);
            }
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $fileType = mime_content_type($file['tmp_name']);
            if (!in_array($fileType, $allowedTypes)) {
                http_response_code(400);
                return json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
            }

            // --- File Processing ---
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uniqueFilename = bin2hex(random_bytes(16)) . '.' . $fileExtension;

            // Full path on the server's filesystem for moving the file.
            // This assumes your 'uploads' folder is in the project's root directory.
            $uploadPath = __DIR__ . '/../../../' . self::UPLOAD_DIR;

            // Create directory if it doesn't exist
            if (!is_dir($uploadPath)) {
                if (!mkdir($uploadPath, 0777, true)) {
                    http_response_code(500);
                    return json_encode(['error' => 'Failed to create upload directory. Check permissions.']);
                }
            }

            $destination = $uploadPath . $uniqueFilename;

            if (!move_uploaded_file($file['tmp_name'], $destination)) {
                http_response_code(500);
                return json_encode(['error' => 'Failed to move uploaded file.']);
            }

            // The relative URL path to be stored in the database
            $imageUrlPath = self::UPLOAD_DIR . $uniqueFilename;

            // --- Database Insertion ---
            $sql = "INSERT INTO images (consultation_id, image_url, description) VALUES (:consultation_id, :image_url, :description)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':consultation_id' => $consultationId,
                ':image_url' => $imageUrlPath,
                ':description' => $description
            ]);

            http_response_code(201);
            return json_encode([
                'message' => 'Image uploaded successfully.',
                'imageUrl' => $imageUrlPath,
                'id' => $this->conn->lastInsertId()
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Server error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves all images associated with a specific consultation.
     */
    public function getImagesForConsultation(int $consultationId): string {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM images WHERE consultation_id = :consultation_id ORDER BY created_at DESC");
            $stmt->execute([':consultation_id' => $consultationId]);
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // It's better to return an empty array than a 404 if no images are found
            // as it simplifies front-end logic.
            return json_encode(['images' => $images]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}