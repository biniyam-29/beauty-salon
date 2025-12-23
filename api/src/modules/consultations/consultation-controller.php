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

        // Handle professional assignment
        if ($method === 'PUT' && $id && $subResource === 'assign-professional') {
            // if (!RoleGuard::roleGuard('admin')) {
            //     http_response_code(403);
            //     return json_encode(['message' => 'Forbidden: Only admins can assign professionals.']);
            // }
            return $this->consultationService->assignProfessional($id, $body);
        }
        if ($method === 'PUT' && $id && $subResource === 'professiona-sign') {
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

        // if (!RoleGuard::roleGuard('doctor')) {
        //     http_response_code(403);
        //     return json_encode(['message' => 'Forbidden']);
        // }

        switch ($method) {
            case 'POST':
                if ($id && $subResource === 'prescriptions') {
                    return $this->prescriptionService->createPrescription($id, $body);
                }

              if ($id && $subResource === 'images') {
                // Check if the 'file' input exists and is an array (which it will be for multiple files)
                if (!isset($_FILES['file']['name']) || !is_array($_FILES['file']['name'])) {
                    http_response_code(400);
                    // Updated error message to guide the front-end developer
                    return json_encode(['error' => 'No files uploaded. The input field must be named "file[]" and be an array.']);
                }

                $files = $_FILES['file'];
                $fileCount = count($files['name']);
                $description = $_POST['description'] ?? null;
                $uploadResults = [];

                // Loop through each uploaded file
                for ($i = 0; $i < $fileCount; $i++) {
                    // Skip empty file inputs that can be sent by the browser
                    if ($files['error'][$i] === UPLOAD_ERR_NO_FILE) {
                        continue;
                    }

                    // Check for other upload errors
                    if ($files['error'][$i] !== UPLOAD_ERR_OK) {
                        $uploadResults[] = [
                            'fileName' => $files['name'][$i],
                            'success' => false,
                            'error' => 'Upload error code: ' . $files['error'][$i]
                        ];
                        continue;
                    }

                    $singleFile = [
                        'name' => $files['name'][$i],
                        'type' => $files['type'][$i],
                        'tmp_name' => $files['tmp_name'][$i],
                        'error' => $files['error'][$i],
                        'size' => $files['size'][$i],
                    ];
                    
                    // Call the image service for each file and collect the results
                    $resultJson = $this->imageService->uploadImage((int)$id, $singleFile, $description);
                    $uploadResults[] = json_decode($resultJson, true);
                }
                
                if (empty($uploadResults)) {
                     http_response_code(400);
                     return json_encode(['error' => 'No valid files were processed.']);
                }

                // Return a summary of all upload operations
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
                return json_encode(['message' => 'Endpoint not found. To get consultations for a customer, use GET /customers/{id}/consultations']);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}