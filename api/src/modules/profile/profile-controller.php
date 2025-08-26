<?php
namespace src\modules\profile;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/profile-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;

class ProfileController implements ControllerInterface {
    private ProfileService $profileService;

    public function __construct() {
        $this->profileService = new ProfileService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        // All profile routes require authentication
        $user = AuthGuard::authenticate('guard');
        if (!$user) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }

        $action = $paths[1] ?? null;

        switch ($method) {
            case 'GET':
                // GET /profile
                return $this->profileService->getMyProfile($user->id);

            case 'PUT':
                // PUT /profile
                return $this->profileService->updateMyProfile($user->id, $body);

            case 'POST':
                // POST /profile/picture
                if ($action === 'picture') {
                    $file = $_FILES['profile_picture'] ?? null;
                    return $this->profileService->updateProfilePicture($user->id, $file);
                }
                http_response_code(404);
                return json_encode(['message' => 'Endpoint not found.']);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
