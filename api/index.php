<?php
require_once 'src/modules/user/user-controller.php';
require_once 'src/main.php';

use src\modules\user\UserController;
use src\App;

$app = new App();

$app->registerRoute('users', UserController::class);

$app->handleRequest();
?>