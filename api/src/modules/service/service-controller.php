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
        $serviceType = $paths[1] ?? null;
        $id = isset($paths[2]) ? (int)$paths[2] : null;

        $tableName = str_replace('-', '_', $serviceType);

        if ($method === 'GET') {
            return $this->serviceService->getAll($tableName);
        }

        // Protected access for POST, PUT, DELETE
        if (!AuthGuard::authenticate() || !RoleGuard::roleGuard('super-admin') && !RoleGuard::roleGuard('admin')) {
            http_response_code(403);
            return json_encode(['message' => 'Forbidden: You do not have permission to perform this action.']);
        }

        switch ($method) {
            case 'POST':
                return $this->serviceService->create($tableName, $body);
            case 'PUT':
                if ($id === null) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad request: ID is required for update.']);
                }
                return $this->serviceService->update($tableName, $id, $body);
            case 'DELETE':
                 if ($id === null) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad request: ID is required for delete.']);
                }
                return $this->serviceService->delete($tableName, $id);
            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
?>
