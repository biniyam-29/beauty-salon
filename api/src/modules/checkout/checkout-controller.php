<?php
namespace src\modules\checkout;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/checkout-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class CheckoutController implements ControllerInterface {
    private CheckoutService $checkoutService;

    public function __construct() {
        $this->checkoutService = new CheckoutService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        $user = AuthGuard::authenticate('guard');
        if (!$user) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        if (!RoleGuard::roleGuard('cashier') && !RoleGuard::roleGuard('admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden: You do not have permission to process checkouts.']);
        }

        switch ($method) {
            case 'GET':
                if (isset($paths[1]) && $paths[1] === 'pending') {
                    $customerId = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : null;
                    if ($customerId) {
                        return $this->checkoutService->getPendingPrescriptionsByCustomer($customerId);
                    }
                    return $this->checkoutService->getAllPendingPrescriptions();
                }
                http_response_code(400);
                return json_encode(['error' => 'Bad request']);
                
            case 'POST':
                if (isset($paths[0]) && $paths[0] === 'update-status') {
                    return $this->checkoutService->updatePrescriptionStatus($body, $user->id);
                }
                return $this->checkoutService->processCheckout($body, $user->id);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}