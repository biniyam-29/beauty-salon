<?php
namespace src\modules\products;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/product-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;

class ProductController implements ControllerInterface {
    private ProductService $productService;

    public function __construct() {
        $this->productService = new ProductService();
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        if (!AuthGuard::authenticate()) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        // Only super-admins and inventory managers can create, update, or delete products
        if ($method !== 'GET' && !RoleGuard::roleGuard('super-admin') && !RoleGuard::roleGuard('inventory-manager')) {
             http_response_code(403);
             return json_encode(['message' => 'Forbidden: You do not have permission to manage products.']);
        }

        $id = $paths[1] ?? null;

        switch ($method) {
            case 'POST':
                return $this->productService->createProduct($body);

            case 'GET':
                if ($id) {
                    return $this->productService->getProductById($id);
                }
                $page = $_GET['page'] ?? 1;
                return $this->productService->getAllProducts($page);

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Product ID is required for update.']);
                }
                return $this->productService->updateProduct($id, $body);

            case 'DELETE':
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Product ID is required for delete.']);
                }
                return $this->productService->deleteProduct($id);

            default:
                http_response_code(405);
                return json_encode(['message' => 'Method Not Allowed']);
        }
    }
}
