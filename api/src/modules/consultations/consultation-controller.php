<?php
namespace src\modules\consultations;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/consultation-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';
require_once __DIR__ . '/../prescriptions/prescription-service.php';
require_once __DIR__ . '/../images/image-service.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;
use src\modules\prescriptions\PrescriptionService;
use src\modules\images\ImageService;

class ConsultationController implements ControllerInterface {
    private ConsultationService $consultationService;
    private PrescriptionService $prescriptionService;
    private ImageService $imageService;

    public function __construct() {
        $this->consultationService = new ConsultationService();
        $this->prescriptionService = new PrescriptionService();
        $this->imageService = new ImageService(); 
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        $user = AuthGuard::authenticate('guard');
        if (!$user) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        if (!RoleGuard::roleGuard('doctor') && !RoleGuard::roleGuard('super-admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden']);
        }

        $id = $paths[1] ?? null;
        $subResource = $paths[2] ?? null;

        switch ($method) {
            case 'POST':
                if ($id && $subResource === 'prescriptions') {
                    return $this->prescriptionService->createPrescription($id, $body, $user->id);
                }

                // POST /consultations/{id}/images
                if ($id && $subResource === 'images') {
                    // File uploads are handled via $_FILES, not $body
                    $file = $_FILES['image'] ?? null;
                    $description = $_POST['description'] ?? null;
                    return $this->imageService->uploadImage($id, $file, $description);
                }

                // POST /consultations
                return $this->consultationService->createConsultation($body);

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Consultation ID is required for update.']);
                }
                return $this->consultationService->updateConsultation($id, $body);

            case 'GET':
                // GET /consultations/{id}/prescriptions
                if ($id && $subResource === 'prescriptions') {
                return $this->prescriptionService->getPrescriptionsForConsultation($id);
                }

                // GET /consultations/{id}/images
                if ($id && $subResource === 'images') {
                    return $this->imageService->getImagesForConsultation($id);
                }
                
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
