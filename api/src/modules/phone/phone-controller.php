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

    public function __construct() {
        $this->phoneService = new PhoneService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        // Authentication is now handled in the PhoneService constructor
        // No need for additional auth checks here

        $id = $paths[1] ?? null;

        switch ($method) {
            case 'GET':
                return $this->phoneService->getPhoneBookings($id);

            case 'POST':
                if (!$body) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Body is required.']);
                }
                return $this->phoneService->createPhoneBooking($body);

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Booking ID is required for update.']);
                }
                if (!$body) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Body is required for update.']);
                }
                return $this->phoneService->updatePhoneBooking($id, $body);

            case 'DELETE':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Booking ID is required for delete.']);
                }
                return $this->phoneService->deletePhoneBooking($id);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}