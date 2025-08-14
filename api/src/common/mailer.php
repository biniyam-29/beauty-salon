<?php
namespace src\common;

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
//use Exception;

// Load Composer's autoloader
require_once __DIR__ . '/../../vendor/autoload.php';

class Mailer {
    private static ?Mailer $instance = null;
    private PHPMailer $mail;

    /**
     * The constructor is private to prevent direct creation of the object.
     * It configures PHPMailer to use Gmail's SMTP server.
     */
    private function __construct() {
        $this->mail = new PHPMailer(true); // Enable exceptions

        try {
            // --- Server settings for Gmail ---
            // $this->mail->SMTPDebug = SMTP::DEBUG_SERVER;  // Uncomment for detailed error output
            $this->mail->isSMTP();
            $this->mail->Host       = 'smtp.gmail.com';
            $this->mail->SMTPAuth   = true;
            $this->mail->Username   = $_ENV['SMTP_USER'];
            $this->mail->Password   = $_ENV['SMTP_PASS'];
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $this->mail->Port       = 465;

            // --- Sender Information ---
            $this->mail->setFrom($_ENV['SMTP_USER'], 'Beauty Salon Clinic');

        } catch (Exception $e) {
            error_log("Mailer could not be initialized. Mailer Error: {$this->mail->ErrorInfo}");
        }
    }

    /**
     * Gets the single instance of the Mailer class.
     */
    public static function getInstance(): Mailer {
        if (self::$instance === null) {
            self::$instance = new Mailer();
        }
        return self::$instance;
    }

    /**
     * Sends an email.
     */
    public function send(string $to, string $subject, string $body): bool {
        try {
            // --- Recipients ---
            $this->mail->addAddress($to);

            // --- Content ---
            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body    = $body;
            $this->mail->AltBody = strip_tags($body);

            $this->mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Message could not be sent. Mailer Error: {$this->mail->ErrorInfo}");
            return false;
        }
    }
}
?>
