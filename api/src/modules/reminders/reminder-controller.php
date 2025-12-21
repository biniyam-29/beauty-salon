<?php
namespace src\modules\reminders;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/reminder-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class ReminderController implements ControllerInterface {
    private ReminderService $reminderService;

    public function __construct() {
        $this->reminderService = new ReminderService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        if (!AuthGuard::authenticate()) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        if (!RoleGuard::roleGuard('reception') && !RoleGuard::roleGuard('admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden: You do not have permission to access reminders.']);
        }

        switch ($method) {
            case 'GET':
                return $this->reminderService->getCustomersToRemind();
            
            case 'POST':
                return $this->reminderService->logReminder($body);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
