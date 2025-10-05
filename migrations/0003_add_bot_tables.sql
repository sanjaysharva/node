
-- Add bot_submissions table for tracking bot review process
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
  INDEX `idx_status` (`status`),
  INDEX `idx_owner_discord_id` (`owner_discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add guild_settings table for quest bot configuration
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
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_guild_id` (`guild_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add reaction_roles table for role management
CREATE TABLE IF NOT EXISTS `reaction_roles` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `guild_id` varchar(32) NOT NULL,
  `message_id` varchar(32) NOT NULL,
  `emoji` varchar(100) NOT NULL,
  `role_id` varchar(32) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_guild_message` (`guild_id`, `message_id`),
  INDEX `idx_message_emoji` (`message_id`, `emoji`),
  UNIQUE KEY `unique_message_emoji` (`message_id`, `emoji`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add pending_templates table for template application tracking
CREATE TABLE IF NOT EXISTS `pending_templates` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `guild_id` varchar(32) NOT NULL UNIQUE,
  `template_link` varchar(500) NOT NULL,
  `template_data` json NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `timestamp` bigint NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_guild_id` (`guild_id`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add support_ticket_messages table for ticket conversation history
CREATE TABLE IF NOT EXISTS `support_ticket_messages` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `ticket_id` varchar(36) NOT NULL,
  `sender_id` varchar(36) NOT NULL,
  `sender_type` varchar(20) NOT NULL DEFAULT 'user',
  `message` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_ticket_id` (`ticket_id`),
  FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure bots table exists with all required columns
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
  INDEX `idx_verified` (`verified`),
  INDEX `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add last_bump tracking to servers table if not exists
ALTER TABLE `servers`
ADD COLUMN IF NOT EXISTS `last_bump_at` timestamp AFTER `bump_enabled`;

-- Add metadata column to users table if not exists (for quest completions)
ALTER TABLE `users`
MODIFY COLUMN `metadata` text AFTER `last_login_date`;

-- Add quest_completions table for better tracking
CREATE TABLE IF NOT EXISTS `quest_completions` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `user_id` varchar(36) NOT NULL,
  `quest_id` varchar(100) NOT NULL,
  `reward` int NOT NULL,
  `completed_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_quest_id` (`quest_id`),
  UNIQUE KEY `unique_user_quest` (`user_id`, `quest_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add bot_votes table for tracking bot votes
CREATE TABLE IF NOT EXISTS `bot_votes` (
  `id` varchar(36) PRIMARY KEY DEFAULT (UUID()),
  `bot_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_bot_id` (`bot_id`),
  INDEX `idx_user_id` (`user_id`),
  UNIQUE KEY `unique_user_bot_vote` (`bot_id`, `user_id`, `created_at`),
  FOREIGN KEY (`bot_id`) REFERENCES `bots`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
