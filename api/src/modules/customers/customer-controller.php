<?php
namespace src\modules\customers;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/customer-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';
require_once __DIR__ . '/../../modules/consultations/consultation-service.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;
use src\modules\consultations\ConsultationService;

class CustomerController implements ControllerInterface {

    private ConsultationService $consultationService;
    private CustomerService $customerService;

    public function __construct() {
        $this->customerService = new CustomerService();
        $this->consultationService = new ConsultationService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        // All customer routes should be protected
        $user = AuthGuard::authenticate('guard');
        if (!$user) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        // Allow reception and higher roles to manage customers
        if (!RoleGuard::roleGuard('reception') && !RoleGuard::roleGuard('doctor') && !RoleGuard::roleGuard('admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden']);
        }

        $id = $paths[1] ?? null;
        $subResource = $paths[2] ?? null; 
        $subResourceId = $paths[3] ?? null;
        $receptionistId = $user->id;

        switch ($method) {
            case 'POST':
                if ($id && $subResource === 'picture') {
                    $file = $_FILES['profile_picture'] ?? null;
                    return $this->customerService->updateProfilePicture($id, $file);
                }
                // POST /customers/{id}/skin-concerns
                if ($subResource === 'skin-concerns') {
                    return $this->customerService->addSkinConcern($id, $body);
                }
                // POST /customers/{id}/health-conditions
                if ($subResource === 'health-conditions') {
                    return $this->customerService->addHealthCondition($id, $body);
                }

                // POST /customers/{id}/consent
                if ($id && $subResource === 'consent') {
                    return $this->customerService->addConsent($id, $body);
                }

                // POST /customers
                return $this->customerService->createCustomer($body, $receptionistId);

            case 'GET':
                // GET /customers/search/{searchTerm}
                if ($id === 'search' && $subResource) {
                    $page = $_GET['page'] ?? 1;
                    return $this->customerService->searchCustomers($subResource, $page);
                }
                
                // GET /customers/{id}/consultations
                if ($id && $subResource === 'consultations') {
                    return $this->consultationService->getConsultationsForCustomer($id);
                }

                if ($id && $subResource === 'images') {
                    return $this->customerService->getImagesForCustomer($id);
                }

                if ($id === 'assigned') {
                    if (RoleGuard::roleGuard('doctor')) {
                        $page = $_GET['page'] ?? 1;
                        return $this->customerService->getAllAssignedCustomers($user->id, $page);
                    } else {
                        http_response_code(403);
                        return json_encode(['message' => 'Forbidden: This endpoint is for doctors only.']);
                    }
                }

                if ($id) {
                    // If the user is a doctor, verify assignment
                    if (RoleGuard::roleGuard('doctor')) {
                        if (!$this->customerService->isCustomerAssignedToDoctor($id, $user->id)) {
                            http_response_code(403);
                            return json_encode(['message' => 'Forbidden: You are not assigned to this customer.']);
                        }
                    }
                    return $this->customerService->getCustomerById($id);
                }
                
                // GET /customers/{id}
                if ($id) {
                    return $this->customerService->getCustomerById($id);
                }

                // GET /customers
                $page = $_GET['page'] ?? 1;
                return $this->customerService->getAllCustomers($page);

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Customer ID is required for update.']);
                }
                // PUT /customers/{id}/skin-concerns/{concernId}
                if ($subResource === 'skin-concerns' && $subResourceId) {
                    return $this->customerService->endSkinConcern($id, $subResourceId);
                }
                // PUT /customers/{id}/health-conditions/{conditionId}
                if ($subResource === 'health-conditions' && $subResourceId) {
                    return $this->customerService->endHealthCondition($id, $subResourceId);
                }
                // PUT /customers/{id}
                return $this->customerService->updateCustomer($id, $body);

            case 'DELETE':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Customer ID is required for delete.']);
                }
                 // DELETE /customers/{id}/skin-concerns/{concernId}
                if ($subResource === 'skin-concerns' && $subResourceId) {
                    return $this->customerService->deleteSkinConcern($id, $subResourceId);
                }
                // DELETE /customers/{id}/health-conditions/{conditionId}
                if ($subResource === 'health-conditions' && $subResourceId) {
                    return $this->customerService->deleteHealthCondition($id, $subResourceId);
                }

                // DELETE /customers/{id}/consent/{consentId}
                if ($id && $subResource === 'consent' && $subResourceId) {
                    return $this->customerService->deleteConsent($id, $subResourceId);
                }
                
                // DELETE /customers/{id}
                return $this->customerService->deleteCustomer($id);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
?>
