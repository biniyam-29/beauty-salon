<?php
namespace src\modules\consultations;

// No changes to require_once statements
require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/consultation-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';
require_once __DIR__ . '/../prescriptions/prescription-service.php';
require_once __DIR__ . '/../images-uploads/image-service.php'; // Ensure this is included

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;
use src\modules\prescriptions\PrescriptionService;
use src\modules\images\ImageService;

class ConsultationController implements ControllerInterface {
    // No changes to properties
    private ConsultationService $consultationService;
    private PrescriptionService $prescriptionService;
    private ImageService $imageService;

    // No changes to the constructor
    public function __construct() {
        $this->consultationService = new ConsultationService();
        $this->prescriptionService = new PrescriptionService();
        $this->imageService = new ImageService();
    }

    // No changes needed for the handleRequest method logic
    public function handleRequest(array $paths, string $method, ?string $body) {
        $user = AuthGuard::authenticate('guard');
        if (!$user) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }

        $id = $paths[1] ?? null;
        $subResource = $paths[2] ?? null;

        if ($method === 'GET' && $id === 'follow-ups' && $subResource === 'today') {
            if (RoleGuard::roleGuard('reception') || RoleGuard::roleGuard('super-admin')) {
                return $this->consultationService->getTodaysFollowUps();
            } else {
                http_response_code(403);
                return json_encode(['message' => 'Forbidden: Only receptionists can access the follow-up list.']);
            }
        }

        if (!RoleGuard::roleGuard('doctor') && !RoleGuard::roleGuard('super-admin')) {
            http_response_code(403);
            return json_encode(['message' => 'Forbidden']);
        }

        switch ($method) {
            case 'POST':
                if ($id && $subResource === 'prescriptions') {
                    return $this->prescriptionService->createPrescription($id, $body, $user->id);
                }

                if ($id && $subResource === 'images') {
                    if (!isset($_FILES['file'])) {
                        http_response_code(400);
                        return json_encode(['error' => 'No file uploaded. Field name should be "file".']);
                    }
                    $file = $_FILES['file'];
                    $description = $_POST['description'] ?? null;
                    return $this->imageService->uploadImage((int)$id, $file, $description);
                }

                return $this->consultationService->createConsultation($body);

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Consultation ID is required for update.']);
                }
                return $this->consultationService->updateConsultation($id, $body);

            case 'GET':
                if ($id && $subResource === 'prescriptions') {
                    return $this->prescriptionService->getPrescriptionsForConsultation($id);
                }

                if ($id && $subResource === 'images') {
                    return $this->imageService->getImagesForConsultation($id);
                }

                if ($id) {
                    return $this->consultationService->getConsultationById($id);
                }

                http_response_code(404);
                return json_encode(['message' => 'Endpoint not found. To get consultations for a customer, use GET /customers/{id}/consultations']);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}