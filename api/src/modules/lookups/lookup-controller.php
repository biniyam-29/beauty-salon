<?php
namespace src\modules\lookups;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/lookup-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class LookupController implements ControllerInterface {
    private LookupService $lookupService;

    public function __construct() {
        $this->lookupService = new LookupService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        $lookupType = $paths[1] ?? null;
        $id = isset($paths[2]) ? (int)$paths[2] : null;

        $tableName = str_replace('-', '_', $lookupType);

        if ($method === 'GET') {
            return $this->lookupService->getAll($tableName);
        }

        // Protected access for POST, PUT, DELETE
        if (!AuthGuard::authenticate() || !RoleGuard::roleGuard('super-admin')) {
            http_response_code(403);
            return json_encode(['message' => 'Forbidden: You do not have permission to perform this action.']);
        }

        switch ($method) {
            case 'POST':
                return $this->lookupService->create($tableName, $body);
            case 'PUT':
                if ($id === null) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad request: ID is required for update.']);
                }
                return $this->lookupService->update($tableName, $id, $body);
            case 'DELETE':
                 if ($id === null) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad request: ID is required for delete.']);
                }
                return $this->lookupService->delete($tableName, $id);
            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
?>
