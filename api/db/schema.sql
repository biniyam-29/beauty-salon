-- db/schema.sql (MySQL Version)

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `role` ENUM('super-admin', 'admin','doctor', 'reception', 'inventory-manager') NOT NULL,
  `profile_picture` MEDIUMBLOB NULL,
  `profile_picture_mimetype` VARCHAR(20) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `customers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(255) NULL UNIQUE,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `birth_date` DATE NULL,
  `assigned_doctor_id` INT UNSIGNED NULL, 
  `emergency_contact_name` VARCHAR(255) NULL,
  `emergency_contact_phone` VARCHAR(20) NULL,
  `how_heard` VARCHAR(255) NULL,
  `profile_picture` MEDIUMBLOB NULL,
  `profile_picture_mimetype` VARCHAR(20) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_customer_doctor` FOREIGN KEY (`assigned_doctor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `stock_quantity` INT UNSIGNED NOT NULL DEFAULT 0,
  `price` DECIMAL(10, 2) NOT NULL,
  `cost` DECIMAL(10, 2) NOT NULL,
  `image_data` MEDIUMBLOB NULL,
  `image_data_mimetype` VARCHAR(20) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `skin_concerns`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `skin_concerns` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `skin_care_history`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `skin_care_history` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `health_conditions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `health_conditions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `customer_skin_concerns`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_skin_concerns` (
  `customer_id` INT UNSIGNED NOT NULL,
  `concern_id` INT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL DEFAULT (CURDATE()),
  `end_date` DATE NULL,
  PRIMARY KEY (`customer_id`, `concern_id`),
  CONSTRAINT `fk_csc_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_csc_concern` FOREIGN KEY (`concern_id`) REFERENCES `skin_concerns`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `customer_health_conditions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_health_conditions` (
  `customer_id` INT UNSIGNED NOT NULL,
  `condition_id` INT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL DEFAULT (CURDATE()),
  `end_date` DATE NULL,
  PRIMARY KEY (`customer_id`, `condition_id`),
  CONSTRAINT `fk_chc_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chc_condition` FOREIGN KEY (`condition_id`) REFERENCES `health_conditions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `customer_profile`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_profile` (
  `customer_id` INT UNSIGNED NOT NULL,
  `skin_type` ENUM('Normal', 'Dry', 'Oily', 'Combo') NULL,
  `skin_feel` VARCHAR(255) NULL,
  `sun_exposure` ENUM('Never', 'Light', 'Moderate', 'Excessive') NULL,
  `foundation_type` VARCHAR(255) NULL,
  `healing_profile` VARCHAR(255) NULL,
  `skin_care_history` VARCHAR(255) NULL,
  `previous_treatment_likes` TEXT NULL,
  `vitamin_a_derivatives` TEXT NULL,
  `recent_botox_fillers` BOOLEAN NULL,
  `supplements_details` TEXT NULL,
  `prescription_meds` TEXT NULL,
  `bruises_easily` BOOLEAN NULL,
  `used_products` JSON NULL,
  `uses_retinoids_acids` BOOLEAN NULL,
  `recent_dermal_fillers` BOOLEAN NULL,
  `previous_acne_medication` TEXT NULL,
  `known_allergies_details` TEXT NULL,
  `dietary_supplements` TEXT NULL,
  `current_prescription` TEXT NULL,
  `other_conditions` TEXT NULL,
  `other_medication` TEXT NULL,
  `drinks_or_smokes` BOOLEAN NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  CONSTRAINT `fk_cp_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- -----------------------------------------------------
-- Table `consultations`
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
  CONSTRAINT `fk_con_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_con_user` FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `consultation_id` INT UNSIGNED NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_img_consultation`
    FOREIGN KEY (`consultation_id`)
    REFERENCES `consultations`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `visit_notes` (UPDATED)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `visit_notes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` INT UNSIGNED NOT NULL,
  `reception_id` INT UNSIGNED NOT NULL,
  `note_text` TEXT NOT NULL,
  `status` ENUM('pending', 'handled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_vn_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vn_receptionist` FOREIGN KEY (`reception_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- -----------------------------------------------------
-- Table `prescriptions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `consultation_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NULL,
  `product_name_custom` VARCHAR(255) NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `instructions` TEXT NULL,
  `status` ENUM('prescribed', 'sold', 'cancelled') NOT NULL DEFAULT 'prescribed',
  `checkout_by_user_id` INT UNSIGNED NULL,
  `checkout_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pre_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pre_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_pre_checkout_user` FOREIGN KEY (`checkout_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `reminders`
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
  CONSTRAINT `fk_rem_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rem_consultation` FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `product_contraindications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_contraindications` (
  `product_id` INT UNSIGNED NOT NULL,
  `condition_id` INT UNSIGNED NOT NULL,
  `reason` VARCHAR(255) NULL,
  PRIMARY KEY (`product_id`, `condition_id`),
  CONSTRAINT `fk_pc_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pc_condition` FOREIGN KEY (`condition_id`) REFERENCES `health_conditions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `audit_log`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT NULL,
  `justification` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_al_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `token` (NEW)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `token` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `userId` INT UNSIGNED NOT NULL,
    `token` TEXT NOT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_token_user`
        FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `customer_consents` (NEW)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_consents` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` INT UNSIGNED NOT NULL,
  `signature_data` TEXT NOT NULL COMMENT 'Stores base64 encoded signature image',
  `consent_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cc_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `password_reset` (NEW)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_reset` (
  `email` VARCHAR(255) NOT NULL COMMENT 'User email associated with the password reset',
  `token` VARCHAR(255) NOT NULL COMMENT 'Secure password reset token',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Token creation timestamp',
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `phone_bookings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `phone_bookings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reception_id` INT UNSIGNED NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `service_name` VARCHAR(100) NOT NULL,
  `booking_date` DATE NOT NULL,
  `booking_time` TIME NOT NULL,
  `notes` TEXT NULL,
  `status`ENUM('scheduled', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'scheduled',
  `is_expired` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  
  -- Indexes for performance
  INDEX `idx_phone_bookings_date` (`booking_date`),
  INDEX `idx_phone_bookings_status` (`status`),
  INDEX `idx_phone_bookings_reception` (`reception_id`),
  INDEX `idx_phone_bookings_phone` (`customer_phone`),
  INDEX `idx_phone_bookings_date_time` (`booking_date`, `booking_time`),
  INDEX `idx_phone_bookings_expired` (`is_expired`),
  INDEX `idx_phone_bookings_created` (`created_at`),
  INDEX `idx_phone_bookings_updated` (`updated_at`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `service` 
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `service` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'The name of the service',
  `description` VARCHAR(255),
  `price` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Service creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
