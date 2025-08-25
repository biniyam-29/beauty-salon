<?php
namespace src\modules\images;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ImageService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Handles the file upload and saves image data to the database.
     */
    public function uploadImage(int $consultationId, array $file, ?string $description): string {

        if (empty($file) || !isset($file['tmp_name'])) {
            http_response_code(400);
            return json_encode(['error' => 'Invalid file data.']);
        }
        
        // Basic validation for the uploaded file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            return json_encode(['error' => 'File upload error.']);
        }
        if ($file['size'] > 5000000) { // 5MB limit
            http_response_code(400);
            return json_encode(['error' => 'File is too large. Max size is 5MB.']);
        }

        // Read the binary data from the uploaded file
        $imageData = file_get_contents($file['tmp_name']);

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO consultation_images (consultation_id, image_data, description)
                 VALUES (:consultation_id, :image_data, :description)"
            );
            $stmt->bindParam(':consultation_id', $consultationId, PDO::PARAM_INT);
            $stmt->bindParam(':image_data', $imageData, PDO::PARAM_LOB);
            $stmt->bindParam(':description', $description, PDO::PARAM_STR);
            $stmt->execute();
            
            $imageId = $this->conn->lastInsertId();

            return json_encode(['message' => 'Image uploaded successfully.', 'imageId' => $imageId]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves all images for a specific consultation.
     */
    public function getImagesForConsultation(int $consultationId): string {
        try {
            $stmt = $this->conn->prepare(
                "SELECT id, description, uploaded_at, TO_BASE64(image_data) as image_data 
                 FROM consultation_images 
                 WHERE consultation_id = :consultation_id"
            );
            $stmt->execute([':consultation_id' => $consultationId]);
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Prepend the data URI scheme for easy rendering on the front-end
            foreach ($images as &$image) {
                $image['image_data'] = 'data:image/jpeg;base64,' . $image['image_data'];
            }

            return json_encode($images);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Deletes a specific image.
     */
    public function deleteImage(int $id): string {
        try {
            $stmt = $this->conn->prepare("DELETE FROM consultation_images WHERE id = :id");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Image not found.']);
            }

            return json_encode(['message' => 'Image deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
