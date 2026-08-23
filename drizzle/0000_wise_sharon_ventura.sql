CREATE TABLE `copy_trades` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `traderId` int NOT NULL,
  `status` enum('staged','active','paused','stopped') NOT NULL DEFAULT 'staged',
  `allocationBps` int NOT NULL,
  `maxLossBps` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `copy_trades_id` PRIMARY KEY(`id`)
);
CREATE TABLE `traders` (
  `id` int AUTO_INCREMENT NOT NULL,
  `ownerUserId` int,
  `provider` varchar(64) NOT NULL,
  `providerTraderId` varchar(128) NOT NULL,
  `name` varchar(160) NOT NULL,
  `strategy` varchar(160) NOT NULL,
  `winRateBps` int NOT NULL DEFAULT 0,
  `monthlyReturnBps` int NOT NULL DEFAULT 0,
  `followers` int NOT NULL DEFAULT 0,
  `totalTrades` int NOT NULL DEFAULT 0,
  `reputationBps` int NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `traders_id` PRIMARY KEY(`id`)
);
CREATE TABLE `trading_bots` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `name` varchar(160) NOT NULL,
  `strategy` varchar(80) NOT NULL,
  `symbol` varchar(32) NOT NULL,
  `allocationBps` int NOT NULL,
  `stopLossBps` int NOT NULL,
  `takeProfitBps` int NOT NULL,
  `status` enum('staged','active','paused','stopped') NOT NULL DEFAULT 'staged',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `trading_bots_id` PRIMARY KEY(`id`)
);
CREATE TABLE `trading_signals` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int,
  `provider` varchar(64) NOT NULL,
  `model` varchar(128) NOT NULL,
  `symbol` varchar(32) NOT NULL,
  `direction` enum('BUY','SELL','HOLD') NOT NULL,
  `confidenceBps` int NOT NULL,
  `reasoning` text NOT NULL,
  `status` enum('active','expired') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `expiresAt` timestamp,
  CONSTRAINT `trading_signals_id` PRIMARY KEY(`id`)
);
ALTER TABLE `copy_trades` ADD CONSTRAINT `copy_trades_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `copy_trades` ADD CONSTRAINT `copy_trades_traderId_traders_id_fk` FOREIGN KEY (`traderId`) REFERENCES `traders`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `traders` ADD CONSTRAINT `traders_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `trading_bots` ADD CONSTRAINT `trading_bots_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `trading_signals` ADD CONSTRAINT `trading_signals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;
CREATE INDEX `copy_trades_user_status_idx` ON `copy_trades` (`userId`,`status`);
CREATE INDEX `copy_trades_trader_idx` ON `copy_trades` (`traderId`);
CREATE INDEX `traders_provider_trader_idx` ON `traders` (`provider`,`providerTraderId`);
CREATE INDEX `traders_status_idx` ON `traders` (`status`);
CREATE INDEX `trading_bots_user_status_idx` ON `trading_bots` (`userId`,`status`);
CREATE INDEX `trading_signals_symbol_status_idx` ON `trading_signals` (`symbol`,`status`);
CREATE INDEX `trading_signals_created_at_idx` ON `trading_signals` (`createdAt`);
