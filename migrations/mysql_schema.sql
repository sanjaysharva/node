
-- Drop existing tables if they exist (be careful in production!)
SET FOREIGN_KEY_CHECKS = 0;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
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
CREATE TABLE IF NOT EXISTS `servers` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `name` text NOT NULL,
  `description` text NOT NULL,
  `invite_code` text NOT NULL,
  `icon` text,
  `banner` text,
  `member_count` int DEFAULT 0,
  `online_count` int DEFAULT 0,
  `owner_id` varchar(36) NOT NULL,
  `tags` json DEFAULT ('[]'),
  `language` text DEFAULT 'English',
  `timezone` text DEFAULT 'UTC',
  `activity_level` text DEFAULT 'Medium',
  `verified` boolean DEFAULT false,
  `featured` boolean DEFAULT false,
  `is_advertising` boolean DEFAULT false,
  `advertising_members_needed` int DEFAULT 0,
  `advertising_user_id` varchar(36),
  `advertising_type` varchar(50),
  `bump_enabled` boolean DEFAULT false,
  `last_bump_at` timestamp,
  `discord_id` text,
  `average_rating` int DEFAULT 0,
  `total_reviews` int DEFAULT 0,
  `upvotes` int DEFAULT 0,
  `downvotes` int DEFAULT 0,
  `total_comments` int DEFAULT 0,
  `is_boosted` boolean DEFAULT false,
  `boost_expires_at` timestamp,
  `boost_type` varchar(50) DEFAULT 'none',
  `boosted_by_id` varchar(36),
  `boosted_at` timestamp,
  `boost_priority` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_owner_id` (`owner_id`),
  INDEX `idx_discord_id` (`discord_id`(255)),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bots table
CREATE TABLE IF NOT EXISTS `bots` (
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

-- Ads table
CREATE TABLE IF NOT EXISTS `ads` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `title` text NOT NULL,
  `description` text,
  `content` text,
  `image_url` text,
  `target_url` text,
  `link_url` text,
  `position` text NOT NULL,
  `is_active` boolean DEFAULT true,
  `impressions` int DEFAULT 0,
  `clicks` int DEFAULT 0,
  `budget` decimal(10,2) DEFAULT 0,
  `spent` decimal(10,2) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support tickets table
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `ticket_id` varchar(40) NOT NULL UNIQUE,
  `user_id` varchar(36) NOT NULL,
  `discord_user_id` varchar(32),
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

-- FAQs table
CREATE TABLE IF NOT EXISTS `faqs` (
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

-- Contact submissions table
CREATE TABLE IF NOT EXISTS `contact_submissions` (
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

-- Slideshows table
CREATE TABLE IF NOT EXISTS `slideshows` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `title` text NOT NULL,
  `image_url` text NOT NULL,
  `link_url` text,
  `position` int DEFAULT 0,
  `order` int DEFAULT 0,
  `page` text NOT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events table
CREATE TABLE IF NOT EXISTS `events` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `title` text NOT NULL,
  `description` text NOT NULL,
  `event_type` text NOT NULL,
  `image_url` text,
  `server_link` text,
  `rewards` text,
  `requirements` text,
  `max_participants` int,
  `registration_deadline` timestamp,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `location` text,
  `owner_id` varchar(36) NOT NULL,
  `featured` boolean DEFAULT false,
  `is_active` boolean DEFAULT true,
  `registration_count` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partnerships table
CREATE TABLE IF NOT EXISTS `partnerships` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `title` text NOT NULL,
  `description` text NOT NULL,
  `server_name` text NOT NULL,
  `server_icon` text,
  `member_count` int DEFAULT 0,
  `partnership_type` text NOT NULL,
  `requirements` json DEFAULT ('[]'),
  `benefits` json DEFAULT ('[]'),
  `contact_info` text,
  `discord_link` text NOT NULL,
  `verified` boolean DEFAULT false,
  `featured` boolean DEFAULT false,
  `owner_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Server templates table
CREATE TABLE IF NOT EXISTS `server_templates` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `name` text NOT NULL,
  `description` text NOT NULL,
  `category` text NOT NULL,
  `preview_image` text,
  `channels` text NOT NULL,
  `roles` text NOT NULL,
  `template_link` text NOT NULL UNIQUE,
  `downloads` int DEFAULT 0,
  `rating` int DEFAULT 0,
  `verified` boolean DEFAULT false,
  `featured` boolean DEFAULT false,
  `owner_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jobs table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Other supporting tables
CREATE TABLE IF NOT EXISTS `server_joins` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `user_id` varchar(36) NOT NULL,
  `server_id` varchar(36) NOT NULL,
  `coins_earned` int DEFAULT 0,
  `left_at` timestamp,
  `coins_deducted` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `comments` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `server_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `parent_id` varchar(36),
  `content` text NOT NULL,
  `likes` int DEFAULT 0,
  `is_edited` boolean DEFAULT false,
  `is_pinned` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `comment_likes` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `comment_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `votes` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `server_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `vote_type` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `server_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `rating` int NOT NULL,
  `review` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bump_channels` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `guild_id` text NOT NULL UNIQUE,
  `channel_id` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `template_processes` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `guild_id` text NOT NULL,
  `template_id` varchar(36),
  `template_name` text,
  `status` text DEFAULT 'in_progress',
  `total_channels` int DEFAULT 0,
  `total_roles` int DEFAULT 0,
  `channels_created` int DEFAULT 0,
  `roles_created` int DEFAULT 0,
  `channels_deleted` int DEFAULT 0,
  `roles_deleted` int DEFAULT 0,
  `errors` json DEFAULT ('[]'),
  `started_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `completed_at` timestamp,
  FOREIGN KEY (`template_id`) REFERENCES `server_templates`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bot-related tables
CREATE TABLE IF NOT EXISTS `bot_submissions` (
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

CREATE TABLE IF NOT EXISTS `guild_settings` (
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

CREATE TABLE IF NOT EXISTS `reaction_roles` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `guild_id` varchar(32) NOT NULL,
  `message_id` varchar(32) NOT NULL,
  `emoji` varchar(100) NOT NULL,
  `role_id` varchar(32) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY `unique_message_emoji` (`message_id`, `emoji`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quest_completions` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `user_id` varchar(36) NOT NULL,
  `quest_id` varchar(100) NOT NULL,
  `reward` int NOT NULL,
  `completed_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY `unique_user_quest` (`user_id`, `quest_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `support_ticket_messages` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `ticket_id` varchar(36) NOT NULL,
  `sender_id` varchar(36) NOT NULL,
  `sender_type` varchar(20) NOT NULL DEFAULT 'user',
  `message` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
