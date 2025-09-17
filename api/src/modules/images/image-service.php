<?php
namespace src\modules\images;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ImageServices {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Handles the file upload and saves image data to the database.
     */
    public function uploadImage(int $consultationId, array $file, ?string $description): string
    {
    // Basic validation for the uploaded file
    if (empty($file) || $file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        return json_encode(['error' => 'File upload error or no file provided.']);
    }

    if ($file['size'] > 5000000) { // 5MB limit
        http_response_code(400);
        return json_encode(['error' => 'File is too large. Max size is 5MB.']);
    }

    // Read the binary data from the uploaded file
    $imageData = file_get_contents($file['tmp_name']);
    $imageMimeType = $file['type']; // Same way as updateProfilePicture

    try {
        // Save the image and its MIME type
        $stmt = $this->conn->prepare(
            "INSERT INTO consultation_images 
                (consultation_id, image_data, image_data_mimetype, description)
             VALUES 
                (:consultation_id, :image_data, :mimetype, :description)"
        );

        $stmt->bindParam(':consultation_id', $consultationId, PDO::PARAM_INT);
        $stmt->bindParam(':image_data', $imageData, PDO::PARAM_LOB);
        $stmt->bindParam(':mimetype', $imageMimeType, PDO::PARAM_STR);
        $stmt->bindParam(':description', $description, PDO::PARAM_STR);

        $stmt->execute();

        $imageId = $this->conn->lastInsertId();

        return json_encode([
            'message' => 'Image uploaded successfully.',
            'imageId' => $imageId,
            'mimeType' => $imageMimeType
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    }

    

    /**
     * Retrieves all images for a specific consultation.
     */
    public function getImagesForConsultation(int $consultationId): string
    {
        try {
            $stmt = $this->conn->prepare(
                "SELECT id, description, uploaded_at, 
                        TO_BASE64(image_data) AS image_data,
                        image_data_mimetype
                 FROM consultation_images 
                 WHERE consultation_id = :consultation_id"
            );
            $stmt->execute([':consultation_id' => $consultationId]);
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            // Prepend the correct data URI scheme for easy rendering on the front-end
            foreach ($images as &$image) {
                $mime = $image['image_data_mimetype'] ?? 'image/jpeg'; // fallback
                $image['image_data'] = 'data:' . $mime . ';base64,' . $image['image_data'];
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
