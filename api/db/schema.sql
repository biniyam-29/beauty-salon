-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS skin_clinic_db;
USE skin_clinic_db;

-- -----------------------------------------------------
-- Table `users`: System operators (staff)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `role` ENUM('super-admin', 'doctor', 'reception', 'inventory-manager') NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `customers`: Clinic clients
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(255) NULL UNIQUE,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `birth_date` DATE NULL,
  `emergency_contact_name` VARCHAR(255) NULL,
  `emergency_contact_phone` VARCHAR(20) NULL,
  `how_heard` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `products`: Inventory for treatments and sale
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `stock_quantity` INT UNSIGNED NOT NULL DEFAULT 0,
  `price` DECIMAL(10, 2) NOT NULL,
  `image_data` MEDIUMBLOB NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `skin_concerns`: Lookup for consistent data
[cite_start]-- From the form section: SKIN CONCERNS [cite: 58-74]
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `skin_concerns` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `health_conditions`: Lookup for consistent data
[cite_start]-- From the form section: HEALTH HISTORY [cite: 87-103]
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `health_conditions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `customer_skin_concerns`: Links customers to their concerns
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_skin_concerns` (
  `customer_id` INT UNSIGNED NOT NULL,
  `concern_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`customer_id`, `concern_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`concern_id`) REFERENCES `skin_concerns`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `customer_health_conditions`: Links customers to their health conditions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_health_conditions` (
  `customer_id` INT UNSIGNED NOT NULL,
  `condition_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`customer_id`, `condition_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`condition_id`) REFERENCES `health_conditions`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `customer_profile`: Stores detailed answers from the form
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_profile` (
  `customer_id` INT UNSIGNED NOT NULL,
  `skin_type` ENUM('Normal', 'Dry', 'Oily', 'Combo') NULL,
  `sun_exposure` ENUM('Never', 'Light', 'Moderate', 'Excessive') NULL,
  `bruises_easily` BOOLEAN NULL,
  `known_allergies_details` TEXT NULL,
  `uses_retinoids_acids` BOOLEAN NULL COMMENT 'Used Retin-A, Glycolic Acid, etc.',
  `recent_dermal_fillers` BOOLEAN NULL,
  `previous_acne_medication` TEXT NULL,
  `drinks_smokes` BOOLEAN NULL,
  `dietary_supplements` TEXT NULL,
  `other_medication` TEXT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  CONSTRAINT `fk_customer_profile_customers`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table `consultations`: Records of each client visit (REVISED)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consultations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` INT UNSIGNED NOT NULL,
  `doctor_id` INT UNSIGNED NOT NULL,
  `consultation_date` DATETIME NOT NULL,
  `treatment_goals_today` TEXT NULL,
  `previous_treatment_feedback` TEXT NULL,
  `doctor_notes` TEXT NULL,
  `follow_up_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_consultations_customers`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_consultations_users`
    FOREIGN KEY (`doctor_id`)
    REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table `prescriptions`: Products prescribed during a consultation
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `consultation_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `instructions` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_prescriptions_consultations`
    FOREIGN KEY (`consultation_id`)
    REFERENCES `consultations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prescriptions_products`
    FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table `consultation_images`: Progress photos for a consultation
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consultation_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `consultation_id` INT UNSIGNED NOT NULL,
  `image_data` MEDIUMBLOB NOT NULL,
  `description` VARCHAR(255) NULL,
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_consultation_images_consultations`
    FOREIGN KEY (`consultation_id`)
    REFERENCES `consultations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table `reminders`: For follow-up appointments
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` INT UNSIGNED NOT NULL,
  `consultation_id` INT UNSIGNED NULL,
  `reminder_date` DATE NOT NULL,
  `status` ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_reminders_customers`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reminders_consultations`
    FOREIGN KEY (`consultation_id`)
    REFERENCES `consultations` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table `product_contraindications`: THE RULES ENGINE for safety alerts
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_contraindications` (
  `product_id` INT UNSIGNED NOT NULL,
  `condition_id` INT UNSIGNED NOT NULL,
  `reason` VARCHAR(255) NULL,
  PRIMARY KEY (`product_id`, `condition_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`condition_id`) REFERENCES `health_conditions`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table `audit_log`: Records important events, like alert overrides
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `action` VARCHAR(255) NOT NULL COMMENT 'e.g., ALERT_OVERRIDE',
  `details` TEXT NULL COMMENT 'e.g., Overrode alert for Product X on Customer Y',
  `justification` TEXT NULL COMMENT 'Reason provided by the user for the override',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION
);