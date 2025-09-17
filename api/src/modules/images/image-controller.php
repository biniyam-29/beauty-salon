<?php
namespace src\modules\images;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/image-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class ImageController implements ControllerInterface {
    private ImageService $imageService;

    public function __construct() {
        $this->imageService = new ImageServices();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        if (!AuthGuard::authenticate() || !RoleGuard::roleGuard('doctor') && !RoleGuard::roleGuard('super-admin') && !RoleGuard::roleGuard('admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden: You do not have permission to manage images.']);
        }

        $id = $paths[1] ?? null;

        switch ($method) {
            case 'DELETE':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Image ID is required for delete.']);
                }
                return $this->imageService->deleteImage($id);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
