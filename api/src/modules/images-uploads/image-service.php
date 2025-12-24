<?php
namespace src\modules\images;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ImageService {
    private PDO $conn;

    private const API_BASE_URL = 'http://localhost:8080';
    private const UPLOAD_DIR = 'uploads/consultations/';

    public function __construct() {
        $this->conn = Database::connect();
    }

    private function getFullUrl(string $relativePath): string {
        return rtrim(self::API_BASE_URL, '/') . '/' . ltrim($relativePath, '/');
    }

    public function uploadImage(int $consultationId, array $file, ?string $description): string {
        try {
            $stmt = $this->conn->prepare("SELECT id FROM consultations WHERE id = :id");
            $stmt->execute([':id' => $consultationId]);
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Consultation not found.']);
            }

            if ($file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                return json_encode(['error' => 'File upload error code: ' . $file['error']]);
            }
            if ($file['size'] > 5 * 1024 * 1024) {
                http_response_code(400);
                return json_encode(['error' => 'File is too large. Maximum size is 5MB.']);
            }

            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $fileType = mime_content_type($file['tmp_name']);
            if (!in_array($fileType, $allowedTypes)) {
                http_response_code(400);
                return json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
            }

            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uniqueFilename = bin2hex(random_bytes(16)) . '.' . $fileExtension;

            $uploadPath = __DIR__ . '/../../../' . self::UPLOAD_DIR;

            if (!is_dir($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }

            $destination = $uploadPath . $uniqueFilename;

            if (!move_uploaded_file($file['tmp_name'], $destination)) {
                http_response_code(500);
                return json_encode(['error' => 'Failed to move uploaded file.']);
            }

            $relativePath = self::UPLOAD_DIR . $uniqueFilename;

            $sql = "INSERT INTO images (consultation_id, image_url, description) VALUES (:consultation_id, :image_url, :description)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':consultation_id' => $consultationId,
                ':image_url' => $relativePath,
                ':description' => $description
            ]);

            $imageId = $this->conn->lastInsertId();

            return json_encode([
                'message' => 'Image uploaded successfully.',
                'imageUrl' => $this->getFullUrl($relativePath),
                'id' => (int)$imageId
            ], JSON_UNESCAPED_SLASHES);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Server error: ' . $e->getMessage()]);
        }
    }

    public function getImagesForConsultation(int $consultationId): string {
        try {
            $stmt = $this->conn->prepare("SELECT id, consultation_id, image_url, description, created_at FROM images WHERE consultation_id = :consultation_id ORDER BY created_at DESC");
            $stmt->execute([':consultation_id' => $consultationId]);
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($images as &$image) {
                $image['image_url'] = $this->getFullUrl($image['image_url']);
                $image['id'] = (int)$image['id'];
                $image['consultation_id'] = (int)$image['consultation_id'];
            }
            unset($image);

            return json_encode(['images' => $images], JSON_UNESCAPED_SLASHES);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function deleteImage(int $id): string {
        try {
            $stmt = $this->conn->prepare("DELETE FROM images WHERE id = :id");
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