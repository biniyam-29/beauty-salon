<?php
namespace src\modules\service;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/service-prescription-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class ServicePrescriptionController implements ControllerInterface {
    private ServicePrescriptionService $servicePrescriptionService;

    public function __construct() {
        $this->servicePrescriptionService = new ServicePrescriptionService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        // Handle customer-specific requests
        if ($method === 'GET' && isset($paths[1]) && $paths[1] === 'customer') {
            $customerId = isset($paths[2]) ? (int)$paths[2] : null;
            if ($customerId !== null) {
                return $this->servicePrescriptionService->getByCustomerId($customerId);
            }
        }

        $id = isset($paths[1]) ? (int)$paths[1] : null;

        if ($method === 'GET') {
            if ($id !== null) {
                return $this->servicePrescriptionService->getById($id);
            }
            return $this->servicePrescriptionService->getAll();
        }

        // Protected access for POST, PUT, DELETE - Only doctors can modify
        if (!AuthGuard::authenticate() || !RoleGuard::roleGuard('doctor')) {
            http_response_code(403);
            return json_encode(['message' => 'Forbidden: You do not have permission to perform this action.']);
        }

        switch ($method) {
            case 'POST':
                return $this->servicePrescriptionService->create($body);
            case 'PUT':
                if ($id === null) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad request: ID is required for update.']);
                }
                return $this->servicePrescriptionService->update($id, $body);
            case 'DELETE':
                if ($id === null) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad request: ID is required for delete.']);
                }
                return $this->servicePrescriptionService->delete($id);
            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
?>