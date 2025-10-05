
-- Fix ads table - add missing columns
ALTER TABLE `ads` 
ADD COLUMN IF NOT EXISTS `content` text NOT NULL AFTER `description`,
ADD COLUMN IF NOT EXISTS `target_url` varchar(500) AFTER `content`;

-- Ensure ads table has all required columns with correct types
ALTER TABLE `ads`
MODIFY COLUMN `id` varchar(191) NOT NULL,
MODIFY COLUMN `title` varchar(255) NOT NULL,
MODIFY COLUMN `description` text,
MODIFY COLUMN `image_url` varchar(500),
MODIFY COLUMN `link_url` varchar(500),
MODIFY COLUMN `position` varchar(50) NOT NULL DEFAULT 'sidebar',
MODIFY COLUMN `is_active` boolean NOT NULL DEFAULT true,
MODIFY COLUMN `impressions` int NOT NULL DEFAULT 0,
MODIFY COLUMN `clicks` int NOT NULL DEFAULT 0,
MODIFY COLUMN `budget` decimal(10,2) DEFAULT '0.00',
MODIFY COLUMN `spent` decimal(10,2) DEFAULT '0.00',
MODIFY COLUMN `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
MODIFY COLUMN `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;

-- Fix slideshows table - ensure all columns exist
ALTER TABLE `slideshows`
MODIFY COLUMN `id` varchar(36) NOT NULL,
MODIFY COLUMN `title` text NOT NULL,
ADD COLUMN IF NOT EXISTS `description` text AFTER `title`,
MODIFY COLUMN `image_url` text NOT NULL,
MODIFY COLUMN `link_url` varchar(255),
ADD COLUMN IF NOT EXISTS `is_active` boolean DEFAULT true AFTER `link_url`,
ADD COLUMN IF NOT EXISTS `order` int DEFAULT 0 AFTER `is_active`,
ADD COLUMN IF NOT EXISTS `owner_id` varchar(36) NOT NULL AFTER `order`,
MODIFY COLUMN `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
MODIFY COLUMN `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;

-- Ensure faqs table has correct structure
ALTER TABLE `faqs`
MODIFY COLUMN `id` varchar(36) NOT NULL,
MODIFY COLUMN `question` text NOT NULL,
MODIFY COLUMN `answer` text NOT NULL,
MODIFY COLUMN `category` varchar(100) NOT NULL,
MODIFY COLUMN `tags` json DEFAULT ('[]'),
MODIFY COLUMN `is_active` boolean DEFAULT true,
MODIFY COLUMN `order` int DEFAULT 0,
MODIFY COLUMN `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
MODIFY COLUMN `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;

-- Ensure support_tickets table has correct structure
ALTER TABLE `support_tickets`
MODIFY COLUMN `id` varchar(36) NOT NULL,
MODIFY COLUMN `ticket_id` varchar(20) NOT NULL UNIQUE,
MODIFY COLUMN `user_id` varchar(36) NOT NULL,
MODIFY COLUMN `subject` text NOT NULL,
MODIFY COLUMN `category` varchar(100) NOT NULL,
MODIFY COLUMN `priority` varchar(50) NOT NULL DEFAULT 'medium',
MODIFY COLUMN `description` text NOT NULL,
MODIFY COLUMN `status` varchar(50) NOT NULL DEFAULT 'open',
MODIFY COLUMN `assigned_to` varchar(36),
MODIFY COLUMN `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
MODIFY COLUMN `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;

-- Ensure contact_submissions table has correct structure
ALTER TABLE `contact_submissions`
MODIFY COLUMN `id` varchar(36) NOT NULL,
MODIFY COLUMN `first_name` varchar(100) NOT NULL,
MODIFY COLUMN `last_name` varchar(100) NOT NULL,
MODIFY COLUMN `email` varchar(255) NOT NULL,
MODIFY COLUMN `phone` varchar(50),
MODIFY COLUMN `country` varchar(100),
MODIFY COLUMN `reason` varchar(100) NOT NULL,
MODIFY COLUMN `description` text NOT NULL,
MODIFY COLUMN `status` varchar(50) NOT NULL DEFAULT 'new',
MODIFY COLUMN `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Fix servers table to match schema
ALTER TABLE `servers`
ADD COLUMN IF NOT EXISTS `server_id` varchar(32) AFTER `id`,
ADD COLUMN IF NOT EXISTS `short_description` text AFTER `description`,
ADD COLUMN IF NOT EXISTS `icon_url` text AFTER `short_description`,
ADD COLUMN IF NOT EXISTS `banner_url` text AFTER `icon_url`,
ADD COLUMN IF NOT EXISTS `invite_link` varchar(255) AFTER `banner_url`,
ADD COLUMN IF NOT EXISTS `category` varchar(100) AFTER `tags`,
ADD COLUMN IF NOT EXISTS `nsfw` boolean DEFAULT false AFTER `featured`,
ADD COLUMN IF NOT EXISTS `premium` boolean DEFAULT false AFTER `nsfw`,
ADD COLUMN IF NOT EXISTS `owner_username` text AFTER `owner_id`,
ADD COLUMN IF NOT EXISTS `total_votes` int DEFAULT 0 AFTER `owner_username`,
ADD COLUMN IF NOT EXISTS `advertising_type` varchar(50) AFTER `advertising_user_id`,
ADD COLUMN IF NOT EXISTS `advertising_expiry` timestamp AFTER `advertising_type`;

-- Fix bots table to match schema
ALTER TABLE `bots`
ADD COLUMN IF NOT EXISTS `short_description` text AFTER `description`,
ADD COLUMN IF NOT EXISTS `avatar_url` text AFTER `short_description`,
ADD COLUMN IF NOT EXISTS `support_server_invite` varchar(255) AFTER `invite_link`,
ADD COLUMN IF NOT EXISTS `website_url` varchar(255) AFTER `support_server_invite`,
ADD COLUMN IF NOT EXISTS `github_url` varchar(255) AFTER `website_url`,
ADD COLUMN IF NOT EXISTS `category` varchar(100) AFTER `tags`,
ADD COLUMN IF NOT EXISTS `shard_count` int DEFAULT 0 AFTER `server_count`,
ADD COLUMN IF NOT EXISTS `total_votes` int DEFAULT 0 AFTER `type`;

-- Ensure servers has unique constraint on server_id
CREATE UNIQUE INDEX IF NOT EXISTS `servers_server_id_unique` ON `servers`(`server_id`);

-- Ensure bots has unique constraint on bot_id  
CREATE UNIQUE INDEX IF NOT EXISTS `bots_bot_id_unique` ON `bots`(`bot_id`);
