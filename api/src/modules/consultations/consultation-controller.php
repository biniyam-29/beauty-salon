<?php
namespace src\modules\consultations;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/consultation-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class ConsultationController implements ControllerInterface {
    private ConsultationService $consultationService;

    public function __construct() {
        $this->consultationService = new ConsultationService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        if (!AuthGuard::authenticate()) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        // Only doctors and super-admins can manage consultations
        if (!RoleGuard::roleGuard('doctor') && !RoleGuard::roleGuard('super-admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden: You do not have permission to manage consultations.']);
        }

        $id = $paths[1] ?? null;

        switch ($method) {
            case 'POST':
                // POST /consultations
                return $this->consultationService->createConsultation($body);

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Consultation ID is required for update.']);
                }
                return $this->consultationService->updateConsultation($id, $body);

            case 'GET':
                // GET /consultations/{id}
                if ($id) {
                    return $this->consultationService->getConsultationById($id);
                }
                // This controller doesn't support GET /consultations (all consultations)
                // To get consultations for a specific customer, use the CustomerController endpoint
                http_response_code(404);
                return json_encode(['message' => 'Endpoint not found. To get consultations for a customer, use GET /customers/{id}/consultations']);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
