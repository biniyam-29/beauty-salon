<?php
namespace src\modules\products;

require_once __DIR__ . '/../../modules/controller-interface.php';
require_once __DIR__ . '/product-service.php';
require_once __DIR__ . '/../auth/guards/auth-guard.php';
require_once __DIR__ . '/../auth/guards/role-guard.php';
require_once __DIR__ . '/../contraindications/contraindication-service.php';

use src\modules\ControllerInterface;
use src\modules\auth\guards\AuthGuard;
use src\modules\auth\guards\RoleGuard;
use src\modules\contraindications\ContraindicationService;

class ProductController implements ControllerInterface {
    private ProductService $productService;
    private ContraindicationService $contraindicationService;

    public function __construct() {
        $this->productService = new ProductService();
        $this->contraindicationService = new ContraindicationService(); 
    }

    public function handleRequest(array $paths, string $method, ?string $body) {
        if (!AuthGuard::authenticate()) {
            http_response_code(401);
            return json_encode(['message' => 'Unauthorized']);
        }
        
        $id = $paths[1] ?? null;
        $subResource = $paths[2] ?? null;
        $subResourceId = $paths[3] ?? null;

        switch ($method) {
            case 'GET':
                if (!RoleGuard::roleGuard('reception') && !RoleGuard::roleGuard('doctor') && !RoleGuard::roleGuard('admin')) {
                    http_response_code(403);
                    return json_encode(['message' => 'Forbidden: You do not have permission to view products.']);
                }
                if ($id && $subResource === 'contraindications') {
                    return $this->contraindicationService->getRulesForProduct($id);
                }
                if ($id) {
                    return $this->productService->getProductById($id);
                }
                $page = $_GET['page'] ?? 1;
                return $this->productService->getAllProducts($page);

            case 'POST':
                // Handle sub-resources first
                if ($id && $subResource === 'picture') {
                    if (!RoleGuard::roleGuard('inventory-manager') && !RoleGuard::roleGuard('admin')) {
                        http_response_code(403);
                        return json_encode(['message' => 'Forbidden: You do not have permission to manage products.']);
                    }
                    $file = $_FILES['product_picture'] ?? null;
                    return $this->productService->updateProductPicture($id, $file);
                }
                if ($id && $subResource === 'contraindications') {
                    if (!RoleGuard::roleGuard('admin')) {
                        http_response_code(403);
                        return json_encode(['message' => 'Forbidden: Only a admin can manage contraindication rules.']);
                    }
                    return $this->contraindicationService->addRule($id, $body);
                }
                // Handle main resource creation
                if (!RoleGuard::roleGuard('inventory-manager') && !RoleGuard::roleGuard('admin') ) {
                    http_response_code(403);
                    return json_encode(['message' => 'Forbidden: You do not have permission to manage products.']);
                }
                return $this->productService->createProduct($body);

            case 'PUT':
                if (!RoleGuard::roleGuard('inventory-manager') && !RoleGuard::roleGuard('admin') ) {
                    http_response_code(403);
                    return json_encode(['message' => 'Forbidden: You do not have permission to manage products.']);
                }
                if (!$id) {
                    http_response_code(400);
                    return json_encode(['error' => 'Bad Request: Product ID is required for update.']);
                }
                return $this->productService->updateProduct($id, $body);

            case 'DELETE':
                if ($id && $subResource === 'contraindications' && $subResourceId) {
                     if (!RoleGuard::roleGuard('admin')) {
                        http_response_code(403);
                        return json_encode(['message' => 'Forbidden: Only a admin can manage contraindication rules.']);
                    }
                    return $this->contraindicationService->deleteRule($id, $subResourceId);
                }
                if (!RoleGuard::roleGuard('admin')) {
                    http_response_code(403);
                    return json_encode(['message' => 'Forbidden: You do not have permission to manage products.']);
                }
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
