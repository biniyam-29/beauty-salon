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
        
        $id = $paths[1] ?? null;
        $subResource = $paths[2] ?? null;

        // --- CORRECTED LOGIC ---
        // 1. Check for the special receptionist permission case FIRST.
        if ($method === 'GET' && $id === 'follow-ups' && $subResource === 'today') {
            if (RoleGuard::roleGuard('reception') || RoleGuard::roleGuard('super-admin')) {
                return $this->consultationService->getTodaysFollowUps();
            } else {
                http_response_code(403);
                return json_encode(['message' => 'Forbidden: Only receptionists can access the follow-up list.']);
            }
        }

        // 2. For ALL OTHER requests, enforce the default doctor/admin permission.
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
    
                    if ($file['error'] !== UPLOAD_ERR_OK) {
                        http_response_code(400);
                        return json_encode(['error' => 'File upload error.']);
                    }
    
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