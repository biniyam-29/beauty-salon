<?php
namespace src\modules\user;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/user-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\user\UserService;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class UserController implements ControllerInterface {
    private UserService $userService;

    public function __construct() {
        $this->userService = new UserService();
    }

    /**
     * Handles an incoming web request for the user module.
     *
     * @param array $paths The parts of the URL path.
     * @param string $method The HTTP request method (e.g., 'GET', 'POST').
     * @param string|null $body The raw request body.
     * @return string A JSON encoded string response.
     */
    public function handleRequest(array $paths, string $method, ?string $body) {
        switch ($method) {
            case 'GET':
                return $this->handleGetRequest($paths);
            case 'POST':
                return $this->handlePostRequest($paths, $body);
            // Add DELETE case if needed
            default:
                http_response_code(405);
                return json_encode(['message' => 'Invalid request method for user module']);
        }
    }

    private function handleGetRequest(array $paths) {
        $action = $paths[1] ?? null;

        if ($action === "check") {
            return $this->userService->check();
        }

        if (!AuthGuard::authenticate()) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        $param1 = $paths[2] ?? null;
        $param2 = $paths[3] ?? null;
        $param3 = $paths[4] ?? null;

        switch ($param1) {
            case 'all-users':
                if (RoleGuard::roleGuard("super-admin")) {
                    return $this->userService->getAllUsers($param2 ?? 1);
                }
                break;
            case 'employee':
                if (RoleGuard::roleGuard("super-admin")) {
                    return $this->userService->getUserByRole("employee", $param2 ?? 1);
                }
                break;
            case 'doctor':
                 if (RoleGuard::roleGuard("super-admin")) {
                    return $this->userService->getUserByRole("doctor", $param2 ?? 1);
                }
                break;
            case 'find-one':
                if (RoleGuard::roleGuard("super-admin")) {
                    return $this->userService->getUser($param2);
                }
                break;
            case 'search-by-name':
                if (RoleGuard::roleGuard("super-admin") && $param2) {
                    return $this->userService->searchByName($param2, $param3 ?? 1);
                }
                break;
            default:
                http_response_code(404);
                return json_encode(['message' => 'Invalid GET endpoint for user.']);
        }
        
        http_response_code(403);
        return json_encode(['message' => 'You don\'t have permission to access this route']);
    }

    private function handlePostRequest(array $paths, ?string $body) {
        if (!AuthGuard::authenticate()) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }

        $userId = $paths[1] ?? null;
        $action = $paths[2] ?? null;

        switch ($action) {
            case 'change-role':
                if (RoleGuard::roleGuard("super-admin")) {
                    return $this->userService->changeRole($body, $userId);
                }
                break;
            case 'update-user':
                return $this->userService->updateUser($userId, $body);
            default:
                http_response_code(404);
                return json_encode(['message' => 'Invalid POST endpoint for user.']);
        }

        http_response_code(403);
        return json_encode(['message' => 'You don\'t have permission to access this route']);
    }
}
?>
