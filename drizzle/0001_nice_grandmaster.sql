CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(80) NOT NULL,
	`outcome` enum('allowed','rejected','unavailable') NOT NULL,
	`broker` varchar(64),
	`symbol` varchar(32),
	`message` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_logs_user_created_idx` ON `audit_logs` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `audit_logs_event_type_idx` ON `audit_logs` (`eventType`,`createdAt`);