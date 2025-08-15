<?php

require_once __DIR__ . '/vendor/autoload.php';
// Set default headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Include all controller files
require_once __DIR__ . '/src/modules/auth/auth-controller.php';
require_once __DIR__ . '/src/modules/user/user-controller.php';
require_once __DIR__ . '/src/modules/customers/customer-controller.php';
require_once __DIR__ . '/src/modules/lookups/lookup-controller.php';
require_once __DIR__ . '/src/modules/consultations/consultation-controller.php';
require_once __DIR__ . '/src/modules/products/product-controller.php';
require_once __DIR__ . '/src/modules/prescriptions/prescription-controller.php';
require_once __DIR__ . '/src/modules/images/image-controller.php';
require_once __DIR__ . '/src/modules/reminders/reminder-controller.php';
// Add other controllers as you create them...

use src\modules\auth\AuthController;
use src\modules\lookups\LookupController;
use src\modules\customers\CustomerController;
use src\modules\user\UserController;
use src\modules\consultations\ConsultationController;
use src\modules\products\ProductController;
use src\modules\prescriptions\PrescriptionController;
use src\modules\images\ImageController;
use src\modules\reminders\ReminderController;


// --- Basic Routing ---
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$paths = explode('/', trim($uri, '/'));
$requestMethod = $_SERVER["REQUEST_METHOD"];
$requestBody = file_get_contents('php://input');

$module = $paths[0] ?? null; // The first part of the path, e.g., 'auth' or 'user'
$controller = null;

// Instantiate the correct controller based on the URL
switch ($module) {
    case 'auth':
        $controller = new AuthController();
        break;
    case 'users':
        $controller = new UserController();
        break;
    case 'lookups':
        $controller = new LookupController();
        break;
    case 'customers':
        $controller = new CustomerController();
        break;
    case 'consultations':
        $controller = new ConsultationController();
        break;
    case 'products':
        $controller = new ProductController();
        break;
    case 'prescriptions':
        $controller = new PrescriptionController();
        break;
    case 'images':
        $controller = new ImageController();
        break;
    case 'reminders':
        $controller = new ReminderController();
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Invalid main endpoint.']);
        exit();
}

// Pass the request to the chosen controller's handler
if ($controller) {
    echo $controller->handleRequest($paths, $requestMethod, $requestBody);
}

?>
