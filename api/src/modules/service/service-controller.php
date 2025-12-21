<?php
namespace src\modules\service;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/service-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class ServiceController implements ControllerInterface {
    private ServiceService $serviceService;

    public function __construct() {
        $this->serviceService = new ServiceService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        $id = isset($paths[2]) ? (int)$paths[2] : null;

        if ($method === 'GET') {
            if ($id !== null) {
                return $this->serviceService->getById($id);
            }
            return $this->serviceService->getAll();
        }

        // Protected access for POST, PUT, DELETE
        if (!AuthGuard::authenticate() || (!RoleGuard::roleGuard('super-admin') && !RoleGuard::roleGuard('admin'))) {
            http_response_code(403);
            return json_encode(['message' => 'Forbidden: You do not have permission to perform this action.']);
        }

        switch ($method) {
            case 'POST':
                return $this->serviceService->create($body);
            case 'PUT':
                if ($id === null) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad request: ID is required for update.']);
                }
                return $this->serviceService->update($id, $body);
            case 'DELETE':
                 if ($id === null) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad request: ID is required for delete.']);
                }
                return $this->serviceService->delete($id);
            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
?>
