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
use src\modules\consultations\Consultation;
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
        if (!AuthGuard::authenticate()) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        // Allow reception and higher roles to manage customers
        if (!RoleGuard::roleGuard('reception') && !RoleGuard::roleGuard('doctor') && !RoleGuard::roleGuard('super-admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden']);
        }

        $id = $paths[1] ?? null;
        $subResource = $paths[2] ?? null; 
        $subResourceId = $paths[3] ?? null;

        switch ($method) {
            case 'POST':
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
                return $this->customerService->createCustomer($body);

            case 'GET':
                // GET /customers/{id}/consultations
                if ($id && $subResource === 'consultations') {
                    return $this->consultationService->getConsultationsForCustomer($id);
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
