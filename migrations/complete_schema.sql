-- Complete Database Schema for MySQL
-- This file contains all table definitions

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS `quest_completions`;
DROP TABLE IF EXISTS `bot_votes`;
DROP TABLE IF EXISTS `support_ticket_messages`;
DROP TABLE IF EXISTS `pending_templates`;
DROP TABLE IF EXISTS `reaction_roles`;
DROP TABLE IF EXISTS `guild_settings`;
DROP TABLE IF EXISTS `bot_submissions`;
DROP TABLE IF EXISTS `comment_likes`;
DROP TABLE IF EXISTS `votes`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `server_joins`;
DROP TABLE IF EXISTS `bump_channels`;
DROP TABLE IF EXISTS `template_processes`;
DROP TABLE IF EXISTS `server_templates`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `partnerships`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `slideshows`;
DROP TABLE IF EXISTS `contact_submissions`;
DROP TABLE IF EXISTS `support_tickets`;
DROP TABLE IF EXISTS `faqs`;
DROP TABLE IF EXISTS `ads`;
DROP TABLE IF EXISTS `bots`;
DROP TABLE IF EXISTS `servers`;
DROP TABLE IF EXISTS `users`;

-- Users table
CREATE TABLE `users` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `discord_id` varchar(32) NOT NULL UNIQUE,
  `username` text NOT NULL,
  `discriminator` varchar(4),
  `avatar` text,
  `email` text,
  `is_admin` boolean DEFAULT false,
  `discord_access_token` text,
  `coins` int DEFAULT 0,
  `invite_count` int DEFAULT 0,
  `servers_joined` int DEFAULT 0,
  `daily_login_streak` int DEFAULT 0,
  `referral_count` int DEFAULT 0,
  `quests_claimed` json DEFAULT ('[]'),
  `last_login_date` timestamp,
  `metadata` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_discord_id` (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Servers table
CREATE TABLE `servers` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `server_id` varchar(32) NOT NULL UNIQUE,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `short_description` text,
  `icon_url` text,
  `banner_url` text,
  `invite_link` varchar(255) NOT NULL,
  `tags` json DEFAULT ('[]'),
  `category` varchar(100) NOT NULL,
  `member_count` int DEFAULT 0,
  `online_count` int DEFAULT 0,
  `verified` boolean DEFAULT false,
  `featured` boolean DEFAULT false,
  `nsfw` boolean DEFAULT false,
  `premium` boolean DEFAULT false,
  `owner_id` varchar(36) NOT NULL,
  `owner_username` text,
  `total_votes` int DEFAULT 0,
  `total_reviews` int DEFAULT 0,
  `average_rating` int DEFAULT 0,
  `total_comments` int DEFAULT 0,
  `advertising_user_id` varchar(36),
  `advertising_type` varchar(50),
  `advertising_expiry` timestamp,
  `bump_enabled` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_server_id` (`server_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bots table
CREATE TABLE `bots` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `bot_id` varchar(32) NOT NULL UNIQUE,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `short_description` text,
  `avatar_url` text,
  `banner_url` text,
  `invite_link` varchar(255) NOT NULL,
  `support_server_invite` varchar(255),
  `website_url` varchar(255),
  `github_url` varchar(255),
  `tags` json DEFAULT ('[]'),
  `category` varchar(100) NOT NULL,
  `server_count` int DEFAULT 0,
  `shard_count` int DEFAULT 0,
  `verified` boolean DEFAULT false,
  `featured` boolean DEFAULT false,
  `owner_id` varchar(36) NOT NULL,
  `prefix` text,
  `icon_url` text,
  `uses` text NOT NULL,
  `type` text NOT NULL,
  `total_votes` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_bot_id` (`bot_id`),
  INDEX `idx_owner_id` (`owner_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events table
CREATE TABLE `events` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `title` text NOT NULL,
  `description` text NOT NULL,
  `image_url` text,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp,
  `location` text,
  `organizer` text NOT NULL,
  `max_participants` int,
  `current_participants` int DEFAULT 0,
  `tags` json DEFAULT ('[]'),
  `featured` boolean DEFAULT false,
  `approved` boolean DEFAULT false,
  `owner_id` varchar(36) NOT NULL,
  `server_id` varchar(36),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_owner_id` (`owner_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ads table
CREATE TABLE `ads` (
  `id` varchar(191) PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `description` text,
  `content` text NOT NULL,
  `image_url` varchar(500),
  `target_url` varchar(500),
  `link_url` varchar(500),
  `position` varchar(50) NOT NULL DEFAULT 'sidebar',
  `is_active` boolean NOT NULL DEFAULT true,
  `impressions` int NOT NULL DEFAULT 0,
  `clicks` int NOT NULL DEFAULT 0,
  `budget` decimal(10,2) DEFAULT '0.00',
  `spent` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Slideshows table
CREATE TABLE `slideshows` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `title` text NOT NULL,
  `description` text,
  `image_url` text NOT NULL,
  `link_url` varchar(255),
  `is_active` boolean DEFAULT true,
  `order` int DEFAULT 0,
  `owner_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Server Joins table
CREATE TABLE `server_joins` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `user_id` varchar(36) NOT NULL,
  `target_server_id` varchar(32) NOT NULL,
  `member_count` int NOT NULL,
  `price` int NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `payment_id` varchar(255),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bump Channels table
CREATE TABLE `bump_channels` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `server_id` varchar(32) NOT NULL,
  `channel_id` varchar(32) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `last_bump_at` timestamp,
  `bump_count` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
CREATE TABLE `reviews` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `server_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `helpful` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_server_id` (`server_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments table
CREATE TABLE `comments` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `server_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `parent_id` varchar(36),
  `likes` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_server_id` (`server_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comment Likes table
CREATE TABLE `comment_likes` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `comment_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_comment_id` (`comment_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Votes table
CREATE TABLE `votes` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `server_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `vote_type` varchar(10) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_server_id` (`server_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partnerships table
CREATE TABLE `partnerships` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `title` text NOT NULL,
  `description` text NOT NULL,
  `requirements` text NOT NULL,
  `benefits` text NOT NULL,
  `contact_info` text NOT NULL,
  `image_url` text,
  `server_id` varchar(32),
  `tags` json DEFAULT ('[]'),
  `active` boolean DEFAULT true,
  `featured` boolean DEFAULT false,
  `owner_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_owner_id` (`owner_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Server Templates table
CREATE TABLE `server_templates` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `name` text NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `image_url` text,
  `tags` json DEFAULT ('[]'),
  `channels` json NOT NULL,
  `roles` json NOT NULL,
  `settings` json NOT NULL,
  `featured` boolean DEFAULT false,
  `verified` boolean DEFAULT false,
  `downloads` int DEFAULT 0,
  `rating` int DEFAULT 0,
  `owner_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_owner_id` (`owner_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Template Processes table
CREATE TABLE `template_processes` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `template_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `server_id` varchar(32),
  `status` varchar(20) DEFAULT 'pending',
  `progress` int DEFAULT 0,
  `error` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `completed_at` timestamp,
  INDEX `idx_template_id` (`template_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`template_id`) REFERENCES `server_templates`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jobs table
CREATE TABLE `jobs` (
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
  INDEX `idx_owner_id` (`owner_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FAQs table
CREATE TABLE `faqs` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `tags` json DEFAULT ('[]'),
  `is_active` boolean DEFAULT true,
  `order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support Tickets table
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
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Submissions table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bot Submissions table
CREATE TABLE `bot_submissions` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `bot_id` varchar(32) NOT NULL UNIQUE,
  `bot_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `owner_id` varchar(36) NOT NULL,
  `owner_discord_id` varchar(32) NOT NULL,
  `invite_url` varchar(500) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `reviewed_by` varchar(36),
  `reviewed_at` timestamp,
  `rejection_reason` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_bot_id` (`bot_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Guild Settings table
CREATE TABLE `guild_settings` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `guild_id` varchar(32) NOT NULL UNIQUE,
  `quest_claim_channel_id` varchar(32),
  `boost_channel_id` varchar(32),
  `welcome_channel_id` varchar(32),
  `goodbye_channel_id` varchar(32),
  `welcome_message` text,
  `goodbye_message` text,
  `command_prefix` varchar(10) DEFAULT '!',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reaction Roles table
CREATE TABLE `reaction_roles` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `guild_id` varchar(32) NOT NULL,
  `message_id` varchar(32) NOT NULL,
  `emoji` varchar(100) NOT NULL,
  `role_id` varchar(32) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY `unique_message_emoji` (`message_id`, `emoji`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quest Completions table
CREATE TABLE `quest_completions` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `user_id` varchar(36) NOT NULL,
  `quest_id` varchar(100) NOT NULL,
  `reward` int NOT NULL,
  `completed_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY `unique_user_quest` (`user_id`, `quest_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support Ticket Messages table
CREATE TABLE `support_ticket_messages` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `ticket_id` varchar(36) NOT NULL,
  `sender_id` varchar(36) NOT NULL,
  `sender_type` varchar(20) NOT NULL DEFAULT 'user',
  `message` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
