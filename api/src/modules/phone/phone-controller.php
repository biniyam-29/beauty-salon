<?php
namespace src\modules\phone;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/phone-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class PhoneController implements ControllerInterface {
    private PhoneService $phoneService;
    private ?array $currentUser;

    public function __construct() {
        $this->phoneService = new PhoneService();
        $userObject = AuthGuard::authenticate('guard');
        // Convert stdClass to array
        $this->currentUser = $userObject ? (array)$userObject : null;
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        // Check authentication for all methods
        if (!$this->currentUser) {
            http_response_code(401);
            return json_encode(['error' => 'Unauthorized']);
        }

        // Check role permissions for write operations
        if ($method !== 'GET') {
            $allowedRoles = ['reception', 'super-admin', 'admin'];
            if (!in_array($this->currentUser['role'] ?? '', $allowedRoles)) {
                http_response_code(403);
                return json_encode(['error' => 'Forbidden: You do not have permission to access phone bookings.']);
            }
        }

        $id = $paths[1] ?? null;

        switch ($method) {
            case 'GET':
                return $this->phoneService->getPhoneBookings($id);

            case 'POST':
                if (!$body) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Body is required.']);
                }
                return $this->phoneService->createPhoneBooking($body, $this->currentUser);

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Booking ID is required for update.']);
                }
                if (!$body) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Body is required for update.']);
                }
                return $this->phoneService->updatePhoneBooking($id, $body, $this->currentUser);

            case 'DELETE':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Booking ID is required for delete.']);
                }
                return $this->phoneService->deletePhoneBooking($id, $this->currentUser);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}