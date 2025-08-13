-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS skin_clinic_db;
USE skin_clinic_db;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `role` ENUM('super-admin', 'inventory-manager', 'reception', 'doctor') NOT NULL,
  `specialization` VARCHAR(255) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

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
  `emergency_contact_name` VARCHAR(255) NULL,
  `emergency_contact_phone` VARCHAR(20) NULL,
  `how_heard` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

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
  `image_data` MEDIUMBLOB NULL, -- MODIFIED: Changed from image_url to store binary data
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `consultations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consultations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` INT UNSIGNED NOT NULL,
  `doctor_id` INT UNSIGNED NOT NULL,
  `consultation_date` DATETIME NOT NULL,
  `initial_form_data` JSON NULL,
  `notes` TEXT NULL,
  `follow_up_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_consultations_customers_idx` (`customer_id` ASC),
  INDEX `fk_consultations_users_idx` (`doctor_id` ASC),
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
-- Table `prescriptions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `consultation_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `instructions` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_prescriptions_consultations_idx` (`consultation_id` ASC),
  INDEX `fk_prescriptions_products_idx` (`product_id` ASC),
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
-- Table `consultation_images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `consultation_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `consultation_id` INT UNSIGNED NOT NULL,
  `image_data` MEDIUMBLOB NOT NULL, -- MODIFIED: Changed from image_url to store binary data
  `description` VARCHAR(255) NULL,
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_consultation_images_consultations_idx` (`consultation_id` ASC),
  CONSTRAINT `fk_consultation_images_consultations`
    FOREIGN KEY (`consultation_id`)
    REFERENCES `consultations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);

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
  INDEX `fk_reminders_customers_idx` (`customer_id` ASC),
  INDEX `fk_reminders_consultations_idx` (`consultation_id` ASC),
  CONSTRAINT `fk_reminders_customers`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reminders_consultations`
    FOREIGN KEY (`consultation_id`)
    REFERENCES `consultations` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
);
