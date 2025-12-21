<?php
namespace src\modules\notes;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/visitnote-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class VisitNoteController implements ControllerInterface {
    private VisitNoteService $noteService;

    public function __construct() {
        $this->noteService = new VisitNoteService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        $user = AuthGuard::authenticate('guard');
        if (!$user) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }

        // Allow receptionists and doctors to manage notes
        if (!RoleGuard::roleGuard('reception') && !RoleGuard::roleGuard('doctor') && !RoleGuard::roleGuard('admin')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden']);
        }

        $module = $paths[0] ?? null;
        $id = $paths[1] ?? null;
        $subResource = $paths[2] ?? null;
        $subResourceId = $paths[3] ?? null;

        switch ($method) {
            case 'POST': // POST /customers/{id}/notes
                if ($module === 'customers' && $id && $subResource === 'notes') {
                    return $this->noteService->createNote($id, $body, $user->id);
                }
                break;
            case 'GET':
                // GET /customers/{id}/notes
                if ($module === 'customers' && $id && $subResource === 'notes') {
                    return $this->noteService->getNotesForCustomer($id);
                }
                // GET /notes/{id}
                if ($module === 'notes' && $id) {
                    return $this->noteService->getNoteById($id);
                }
                break;
            case 'PUT': // PUT /notes/{id}
                if ($module === 'notes' && $id) {
                    return $this->noteService->updateNote($id, $body);
                }
                break;
            case 'DELETE':
                // DELETE /customers/{customerId}/notes/{noteId}
                if ($module === 'customers' && $id && $subResource === 'notes' && $subResourceId) {
                    return $this->noteService->deleteNote($subResourceId);
                }
                // DELETE /notes/{noteId}
                if ($module === 'notes' && $id) {
                    return $this->noteService->deleteNote($id);
                }
                break;
        }

        http_response_code(404);
        return json_encode(['message' => 'Endpoint not found.']);
    }
}
