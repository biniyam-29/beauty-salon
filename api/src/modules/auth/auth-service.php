<?php
namespace src\modules\auth;

require_once 'vendor/autoload.php';
require_once __DIR__ . '/../../config/auth-constants.php';
require_once __DIR__ . '/../../config/Database.php';
//require_once 'src/common/mailer.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;
use src\common\constants\AuthConstants;
use src\config\Database;
use PDO;
use Faker\Factory as FakerFactory;
//use src\common\Mailer;
use Exception;

class AuthService{
    private PDO $conn;
    //private Mailer $mailer;

    public function __construct() {
        $this->conn = Database::connect();
        AuthConstants::initialize();
        //$this->mailer = Mailer::getInstance();
    }

    public function logIn($body) {
        try {
            $data = json_decode($body);
            if(!$data->email || !$data->password){
                http_response_code(400);
                return json_encode(["message" => "Bad request! Please fill out all fields!"]);
            }
            //$sql = 'SELECT * FROM users WHERE email = ?';
            $stmt = $this->conn->prepare('SELECT * FROM users WHERE email = ?');
            $stmt->execute([$data->email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(401);
                return json_encode(["message" => "Unauthorized! Invalid email or password!"]);
            }

            if (!password_verify($data->password, $user['password_hash'])) {
                http_response_code(401);
                return json_encode(["message" => "Unauthorized! Invalid password!"]);
            }

            $token = $this->generateToken($user, $user['id']);
            return json_encode(['token' => $token, 'payload' => $user]);
        } catch (Exception $e) {
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public function logOut() {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = trim(str_replace("Bearer ", "", $authHeader));
    
        try {
            $decoded = JWT::decode($token, new Key(AuthConstants::$secretKey, 'HS256'));
            $userId = $decoded->data->id;
    
            $sql = 'DELETE FROM `token` WHERE `userId` = ? AND `token` = ?';
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$userId, $token]);
    
            if ($stmt->rowCount() === 0) {
                return json_encode(["error" => "No matching token found"]);
            }
    
            return json_encode(["message" => "Logged out successfully"]);
        } catch (Exception $e) {
            return json_encode(['error' => $e->getMessage()]);
        }
    }    
    

    public function allLogOut($id){
        try{
            $sql = "DELETE FROM token WHERE userId = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$id]);
            return json_encode(["message" => "Logged out successfully"]);
        }catch(Exception $e){
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public function addDetails($body, $id) {
        try {
            $user = $this->fetchData('users', $id);
            if (!$user) {
                return json_encode(["message" => "User not found!"]);
            }

            $data = json_decode($body, true);
            $data += ['isActive' => true];
            $data = json_decode(json_encode($data));
            if(!$body || !isset($data->name) || !isset($data->password) || !isset($data->location)) {
                return json_encode(["message" => "Invalid request body!"]);
            }
            if($user['role'] === 'OWNER') {
                return json_encode(["message" => "Unauthorized! Only employees can update their details!"]);
            }
            if ($user['isActive'] == 1) {
                return json_encode(["message" => "User already has details!"]);
            }
            if (isset($data->password)) {
                $data->password = password_hash($data->password, PASSWORD_BCRYPT);
            }

            $fields = [];
            $values = [];

            foreach ($data as $key => $value) {
                if ($key === 'id' || $key === 'role' || $key === 'email') {
                    continue;
                }

                $fields[] = "$key = COALESCE(NULLIF(?, ''), $key)";
                $values[] = $value;
            }

            if (empty($fields)) {
                return json_encode(['error' => 'No fields to update']);
            }

            $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([...$values, $id]);

            $returnData = $this->fetchData('users', $id);
            
            $token = $this->generateToken($returnData, $id);

            return json_encode(['token' => $token, 'payload' => $returnData]);
            
        } catch (Exception $e) {
            return json_encode(['error' => $e->getMessage()]);
        }
    }

   public function addUser($body) {
        try {
            $data = json_decode($body);
            if(!$body || !isset($data->name) || !isset($data->email) || !isset($data->phoneNumber)) {
                return json_encode(["message" => "Invalid request body!"]);
            }
            if ($this->fetchData('users', $data->email, "email")) {
                return json_encode(["message" => "User already exists!"]);
            }

            $password = FakerFactory::create()->password;

            $id = trim($this->conn->query("SELECT UUID()")->fetchColumn());

            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            $this->conn->beginTransaction();
            $stmt = $this->conn->prepare("INSERT INTO users (id, name, email, phone, password) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$id, $data->name, $data->email, $data->phoneNumber, $hashedPassword]);
            $this->conn->commit();
            $emailBody = 'Hello ' . $data->name . ', your account has been created successfully. Your password is ' . $password;
            $subject = "Welcome to Dire Delivery";
           // $this->mailer->send($data->email, $subject, $emailBody);
            
            return json_encode(["message" => "employee successfully created", 'email' => $data->email, 'password' => $password]);
        } catch (Exception $e) {
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public function forgotPassword($body) {
        try{
            $data = json_decode($body);
            if(!$data->email){
                http_response_code(400);
                return json_encode(["message" => "Bad request! Please fill out all fields!"]);
            }
            $user = $this->fetchData('users', $data->email, 'email');
            if (!$user) {
                return json_encode(["message" => "email is not valid!"]);
            }
            $token = bin2hex(random_bytes(32));
            $sql = "REPLACE INTO password_reset (email, token, createdAt) VALUES (?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$data->email, $token, date('Y-m-d H:i:s')]);
            $emailBody = "Hello $user[name], click the link below to reset your password: https://dire-delivery.netlify.app/" . addslashes($token);
            $subject = "Reset Password";
            //$this->mailer->send($data->email, $subject, $emailBody);

            return json_encode(["message" => "Email sent successfully!"]);
        }catch(Exception $e){
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public function resetPassword($body, $token) {
        try{
            $data = json_decode($body);
            if( !$data->password){
                http_response_code(400);
                return json_encode(["message" => "Bad request! Please fill out all fields!"]);
            }
            $cachedToken = $this->fetchData('password_reset', $token, 'token');
            if (!$cachedToken ) {
                return json_encode(["message" => "Invalid token!"]);
            }
            $user = $this->fetchData('users', $cachedToken['email'], 'email');
            if (!$user) {
                return json_encode(["message" => "User not found!", "user" => $user, "cachedToken" => $cachedToken]);
            }
            $hashedPassword = password_hash($data->password, PASSWORD_BCRYPT);
            $sql = "UPDATE users SET password = ? WHERE email = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$hashedPassword, $cachedToken['email']]);
            $sql = "DELETE FROM password_reset WHERE email = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$cachedToken['email']]);
            return json_encode(["message" => "Password reset successfully!"]);
        }catch(Exception $e){
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    private function fetchData($table, $id, $column = 'id') {
        try{
            $allowedTables = ['users', 'token', 'password_reset']; 

            if (!in_array($table, $allowedTables)) {
                return ["message" => "Invalid table name."];
            }

            $stmt = $this->conn->prepare("SELECT * FROM $table WHERE $column = ?");
            $stmt->execute([$id]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        }catch(Exception $e){
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    private function generateToken($payload, $id, $exp = null) {
        try {
            $exp = $exp ? time() + $exp : time() + AuthConstants::$expirationTime;
            $payload = ['iat' => time(), 'exp' => $exp, 'data' => $payload];
            $token = JWT::encode($payload, AuthConstants::$secretKey, 'HS256');
            $sql = 'INSERT INTO token (token, userId) VALUES (?, ?)';

            $this->conn->beginTransaction();
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$token, $id]);
            $this->conn->commit();

            return $token;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public function rememberMe($token) {
        try {                                                        
            $tokenData = $this->fetchData('token', $token, 'token');
            if (!$tokenData) {
                return json_encode(["message" => "Invalid token!"]);
            }
            $user = $this->fetchData('users', $tokenData['userId'], 'id');
            if (!$user) {
                return json_encode(["message" => "User not found!"]);
            }

            $sql = "DELETE FROM token WHERE token = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$tokenData['token']]);

            $newToken = $this->generateToken($user, $user['id'], 604800);

            return json_encode(["message" => "Remember me set successfully!", "token" => $newToken]);
        } catch (Exception $e) {
            return json_encode(["error" => $e->getMessage()]);
        }
    }

}
?>
