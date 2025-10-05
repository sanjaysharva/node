
-- Add FAQs table
CREATE TABLE `faqs` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `tags` json DEFAULT ('[]'),
  `is_active` boolean DEFAULT true,
  `order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add Support Tickets table
CREATE TABLE `support_tickets` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `ticket_id` varchar(20) NOT NULL UNIQUE,
  `user_id` varchar(36) NOT NULL,
  `subject` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `priority` varchar(50) NOT NULL DEFAULT 'medium',
  `description` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'open',
  `assigned_to` varchar(36),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Add Contact Submissions table
CREATE TABLE `contact_submissions` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50),
  `country` varchar(100),
  `reason` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'new',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add Jobs table if not exists
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `title` text NOT NULL,
  `description` text NOT NULL,
  `company` text NOT NULL,
  `location` text,
  `type` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `requirements` text,
  `salary` text,
  `benefits` text,
  `application_url` varchar(255) NOT NULL,
  `image_url` text,
  `tags` json DEFAULT ('[]'),
  `featured` boolean DEFAULT false,
  `remote` boolean DEFAULT false,
  `active` boolean DEFAULT true,
  `owner_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `expires_at` timestamp,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
