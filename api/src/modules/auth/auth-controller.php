<?php
namespace src\modules\auth;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/auth-service.php';
require_once __DIR__ . '/guards/auth-guard.php';
require_once __DIR__ . '/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;
use Exception;

class AuthController implements ControllerInterface {
    private AuthService $authService;

    public function __construct() {
        $this->authService = new AuthService();
    }

    /**
     * Handles incoming requests for the auth module.
     * @param array $paths The parts of the URL path, e.g., ['auth', 'login'].
     * @param string $method The HTTP request method (GET, POST, etc.).
     * @param string|null $body The raw request body.
     */
    public function handleRequest(array $paths, string $method, ?string $body) {
        try {
            switch ($method) {
                case 'POST':
                    return $this->handlePostRequest($paths, $body);
                case 'GET':
                    return $this->handleGetRequest($paths);
                default:
                    http_response_code(405); // Method Not Allowed
                    return json_encode(['message' => 'Invalid request method for auth module']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'An internal server error occurred: ' . $e->getMessage()]);
        }
    }

    /**
     * Handles all POST requests for the auth module.
     */
    private function handlePostRequest(array $paths, ?string $body) {
        $action = $paths[1] ?? null; // e.g., 'login', 'add-user'
        $userId = $paths[2] ?? null; // e.g., the user ID for sign-up

        switch ($action) {
            case 'login':
                return $this->authService->logIn($body);

            case 'forgot-password':
                return $this->authService->forgotPassword($body);

            case 'reset-password':
                return $this->authService->resetPassword($body);

            default:
                http_response_code(404);
                return json_encode(['message' => 'Invalid auth endpoint for POST request.']);
        }
    }

    /**
     * Handles all GET requests for the auth module.
     */
    private function handleGetRequest(array $paths) {
        $action = $paths[1] ?? null; // e.g., 'logout'
        $userId = $paths[2] ?? null; // e.g., the user ID for logout

        switch ($action) {
            case 'logout':
                if (AuthGuard::authenticate()) {
                    return $this->authService->logOut();
                }
                 http_response_code(401);
                 return json_encode(["message" => "Unauthorized!"]);

            case 'all-logout':
                if (AuthGuard::authenticate()) {
                    return $this->authService->allLogOut($userId);
                }
                 http_response_code(401);
                 return json_encode(["message" => "Unauthorized!"]);

            case 'remember-me':
                if (AuthGuard::authenticate()) {
                    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
                    $token = str_replace("Bearer ", "", $authHeader);
                    return $this->authService->rememberMe($token);
                }
                 http_response_code(401);
                 return json_encode(["message" => "Unauthorized!"]);

            default:
                http_response_code(404);
                return json_encode(['message' => 'Invalid auth endpoint for GET request.']);
        }
    }
}
?>
