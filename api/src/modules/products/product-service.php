<?php
namespace src\modules\products;

header("Content-Type: application/json");
require_once __DIR__ . '/../../config/Database.php';

use src\config\Database;
use PDO;
use Exception;

class ProductService {
    private PDO $conn;

    public function __construct() {
        $this->conn = Database::connect();
    }

    /**
     * Creates a new product.
     */
    public function createProduct(string $body): string {
        $data = json_decode($body, true);

        if (!isset($data['name']) || !isset($data['price'])) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: name and price are required.']);
        }

        try {
            $stmt = $this->conn->prepare(
                "INSERT INTO products (name, brand, description, stock_quantity, price)
                 VALUES (:name, :brand, :description, :stock_quantity, :price)"
            );
            $stmt->execute([
                ':name' => $data['name'],
                ':brand' => $data['brand'] ?? null,
                ':description' => $data['description'] ?? null,
                ':stock_quantity' => $data['stock_quantity'] ?? 0,
                ':price' => $data['price']
            ]);
            $productId = $this->conn->lastInsertId();

            return json_encode(['message' => 'Product created successfully.', 'productId' => $productId]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves a paginated list of all products.
     */
    public function getAllProducts($page = 1): string {
        $limit = 10;
        $offset = max(0, ($page - 1)) * $limit;

        try {
            $stmt = $this->conn->prepare(
                "SELECT id, name, brand, price, stock_quantity, TO_BASE64(image_data) as image_data, image_data_mimetype 
                 FROM products 
                 ORDER BY name ASC 
                 LIMIT :limit OFFSET :offset"
            );
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($products as &$product) {
                if ($product['image_data'] && $product['image_data_mimetype']) {
                    $product['image_data'] = 'data:' . $product['image_data_mimetype'] . ';base64,' . $product['image_data'];
                }
                unset($product['image_mimetype']);
            }

            $totalStmt = $this->conn->query("SELECT COUNT(*) FROM products");
            $totalProducts = $totalStmt->fetchColumn();

            return json_encode([
                'products' => $products,
                'totalPages' => ceil($totalProducts / $limit),
                'currentPage' => (int)$page
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Retrieves a single product by its ID.
     */
    public function getProductById(int $id): string {
        try {
            // UPDATED: Added columns for the product image
            $stmt = $this->conn->prepare(
                "SELECT *, TO_BASE64(image_data) as image_data 
                 FROM products WHERE id = :id"
            );
            $stmt->execute([':id' => $id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                http_response_code(404);
                return json_encode(['error' => 'Product not found.']);
            }

            // Build the full data URI for the image
            if ($product['image_data'] && $product['image_data_mimetype']) {
                $product['image_data'] = 'data:' . $product['image_data_mimetype'] . ';base64,' . $product['image_data'];
            }
            unset($product['image_mimetype']); // Clean up the response

            return json_encode($product);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates an existing product.
     */
    public function updateProduct(int $id, string $body): string {
        $data = json_decode($body, true);
        if (empty($data)) {
            http_response_code(400);
            return json_encode(['error' => 'Bad request: No data provided.']);
        }

        $allowedFields = ['name', 'brand', 'description', 'stock_quantity', 'price'];
        $fieldsToUpdate = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fieldsToUpdate[] = "`$field` = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (empty($fieldsToUpdate)) {
            http_response_code(400);
            return json_encode(['error' => 'No valid fields to update.']);
        }

        $params['id'] = $id;
        $sql = "UPDATE products SET " . implode(', ', $fieldsToUpdate) . " WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Product not found or no changes made.']);
            }

            return json_encode(['message' => 'Product updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Deletes a product.
     */
    public function deleteProduct(int $id): string {
        try {
            $stmt = $this->conn->prepare("DELETE FROM products WHERE id = :id");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Product not found.']);
            }

            return json_encode(['message' => 'Product deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Updates the picture for an existing product.
     */
    public function updateProductPicture(int $productId, array $file): string {
        if (empty($file) || $file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            return json_encode(['error' => 'File upload error or no file provided.']);
        }
        if ($file['size'] > 2000000) { // 2MB limit
            http_response_code(400);
            return json_encode(['error' => 'File is too large. Max size is 2MB.']);
        }

        $imageData = file_get_contents($file['tmp_name']);
        $imageMimeType = $file['type'];

        try {
            $stmt = $this->conn->prepare("UPDATE products SET image_data = :image_data, image_data_mimetype = :mimetype WHERE id = :id");
            $stmt->bindParam(':image_data', $imageData, PDO::PARAM_LOB);
            $stmt->bindParam(':mimetype', $imageMimeType, PDO::PARAM_STR);
            $stmt->bindParam(':id', $productId, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                 http_response_code(404);
                 return json_encode(['error' => 'Product not found.']);
            }

            return json_encode(['message' => 'Product picture updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
