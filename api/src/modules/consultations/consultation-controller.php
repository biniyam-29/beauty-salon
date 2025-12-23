<?php
namespace src\modules\consultations;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/consultation-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';
require_once __DIR__ . '/../prescriptions/prescription-service.php';
require_once __DIR__ . '/../images-uploads/image-service.php';

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

        // New endpoint: GET /consultations/pending-professional
        if ($method === 'GET' && $id === 'pending-professional') {
            if (!RoleGuard::roleGuard('admin') && !RoleGuard::roleGuard('reception') && !RoleGuard::roleGuard('professional')) {
                http_response_code(403);
                return json_encode(['message' => 'Forbidden: Only admin or reception can access this list']);
            }
            return $this->consultationService->getCustomersWithPendingProfessionalAssignment();
        }

        // Handle professional assignment
        if ($method === 'PUT' && $id && $subResource === 'assign-professional') {
            return $this->consultationService->assignProfessional($id, $body);
        }

        if ($method === 'PUT' && $id && $subResource === 'professional-sign') {
            return $this->consultationService->professionalSignature($id, $body);
        }

        if ($method === 'GET' && $id === 'follow-ups' && $subResource === 'today') {
            if (RoleGuard::roleGuard('reception') || RoleGuard::roleGuard('doctor')) {
                return $this->consultationService->getTodaysFollowUps();
            } else {
                http_response_code(403);
                return json_encode(['message' => 'Forbidden: Only receptionists can access the follow-up list.']);
            }
        }

        switch ($method) {
            case 'POST':
                if ($id && $subResource === 'prescriptions') {
                    return $this->prescriptionService->createPrescription($id, $body);
                }

                if ($id && $subResource === 'images') {
                    if (!isset($_FILES['file']['name']) || !is_array($_FILES['file']['name'])) {
                        http_response_code(400);
                        return json_encode(['error' => 'No files uploaded. Use field name "file[]"']);
                    }

                    $files = $_FILES['file'];
                    $fileCount = count($files['name']);
                    $description = $_POST['description'] ?? null;
                    $uploadResults = [];

                    for ($i = 0; $i < $fileCount; $i++) {
                        if ($files['error'][$i] === UPLOAD_ERR_NO_FILE) {
                            continue;
                        }
                        if ($files['error'][$i] !== UPLOAD_ERR_OK) {
                            $uploadResults[] = [
                                'fileName' => $files['name'][$i],
                                'success' => false,
                                'error' => 'Upload error code: ' . $files['error'][$i]
                            ];
                            continue;
                        }

                        $singleFile = [
                            'name'     => $files['name'][$i],
                            'type'     => $files['type'][$i],
                            'tmp_name' => $files['tmp_name'][$i],
                            'error'    => $files['error'][$i],
                            'size'     => $files['size'][$i],
                        ];

                        $resultJson = $this->imageService->uploadImage((int)$id, $singleFile, $description);
                        $uploadResults[] = json_decode($resultJson, true);
                    }

                    if (empty($uploadResults)) {
                        http_response_code(400);
                        return json_encode(['error' => 'No valid files were processed.']);
                    }

                    return json_encode([
                        'message' => 'Batch upload process finished.',
                        'results' => $uploadResults
                    ]);
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
                return json_encode(['message' => 'Endpoint not found. Use GET /customers/{id}/consultations or /consultations/pending-professional']);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}