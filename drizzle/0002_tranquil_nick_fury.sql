CREATE TABLE `paper_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cashBalance` decimal(24,8) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paper_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `paper_accounts_user_idx` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `paper_fills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`side` enum('BUY','SELL') NOT NULL,
	`quantity` decimal(24,8) NOT NULL,
	`price` decimal(24,8) NOT NULL,
	`realizedPnl` decimal(24,8) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paper_fills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paper_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`side` enum('BUY','SELL') NOT NULL,
	`orderType` enum('market','limit') NOT NULL,
	`quantity` decimal(24,8) NOT NULL,
	`limitPrice` decimal(24,8),
	`executedQuantity` decimal(24,8) NOT NULL DEFAULT '0',
	`averageFillPrice` decimal(24,8),
	`status` enum('open','filled','cancelled','rejected') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paper_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paper_positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(32) NOT NULL,
	`quantity` decimal(24,8) NOT NULL DEFAULT '0',
	`averageEntryPrice` decimal(24,8) NOT NULL DEFAULT '0',
	`realizedPnl` decimal(24,8) NOT NULL DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paper_positions_id` PRIMARY KEY(`id`),
	CONSTRAINT `paper_positions_user_symbol_idx` UNIQUE(`userId`,`symbol`)
);
--> statement-breakpoint
ALTER TABLE `paper_accounts` ADD CONSTRAINT `paper_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paper_fills` ADD CONSTRAINT `paper_fills_orderId_paper_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `paper_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paper_fills` ADD CONSTRAINT `paper_fills_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paper_orders` ADD CONSTRAINT `paper_orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paper_positions` ADD CONSTRAINT `paper_positions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `paper_fills_user_created_idx` ON `paper_fills` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `paper_fills_order_idx` ON `paper_fills` (`orderId`);--> statement-breakpoint
CREATE INDEX `paper_orders_user_status_idx` ON `paper_orders` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `paper_orders_user_created_idx` ON `paper_orders` (`userId`,`createdAt`);