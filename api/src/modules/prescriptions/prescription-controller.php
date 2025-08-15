<?php
namespace src\modules\prescriptions;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/prescription-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class PrescriptionController implements ControllerInterface {
    private PrescriptionService $prescriptionService;

    public function __construct() {
        $this->prescriptionService = new PrescriptionService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        if (!AuthGuard::authenticate() || !RoleGuard::roleGuard('doctor') && !RoleGuard::roleGuard('super-admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden: You do not have permission to manage prescriptions.']);
        }

        $id = $paths[1] ?? null;

        switch ($method) {
            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Prescription ID is required for update.']);
                }
                return $this->prescriptionService->updatePrescription($id, $body);

            case 'DELETE':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Prescription ID is required for delete.']);
                }
                return $this->prescriptionService->deletePrescription($id);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
