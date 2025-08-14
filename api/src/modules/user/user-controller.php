<?php
namespace src\modules\user;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/user-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class UserController implements ControllerInterface {
    private UserService $userService;

    public function __construct() {
        $this->userService = new UserService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        // All user management routes require authentication
        if (!AuthGuard::authenticate()) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        // Only a super-admin can manage users
        if (!RoleGuard::roleGuard('super-admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden: You do not have permission to manage users.']);
        }

        $idOrAction = $paths[1] ?? null;
        $roleName = $paths[2] ?? null;

        switch ($method) {
            case 'POST':
                // POST /users
                return $this->userService->createUser($body);

            case 'GET':
                // GET /users/role/{roleName}
                if ($idOrAction === 'role' && $roleName) {
                    $page = $_GET['page'] ?? 1;
                    return $this->userService->getUserByRole($roleName, $page);
                }
                // GET /users/{id}
                if (is_numeric($idOrAction)) {
                    return $this->userService->getUserById($idOrAction);
                }
                // GET /users
                $page = $_GET['page'] ?? 1;
                return $this->userService->getAllUsers($page);

            case 'PUT':
                // PUT /users/{id}
                if (!$idOrAction || !is_numeric($idOrAction)) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: User ID is required for update.']);
                }
                return $this->userService->updateUser($idOrAction, $body);

            case 'DELETE':
                // DELETE /users/{id}
                if (!$idOrAction || !is_numeric($idOrAction)) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: User ID is required for delete.']);
                }
                return $this->userService->deleteUser($idOrAction);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
