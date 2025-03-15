CREATE TABLE `birth_data` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`latitude` text NOT NULL,
	`longitude` text NOT NULL,
	`user_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `planetary_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`birth_data_id` text NOT NULL,
	`planet` text NOT NULL,
	`angle_type` text NOT NULL,
	`line_data` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`birth_data_id`) REFERENCES `birth_data`(`id`) ON UPDATE no action ON DELETE no action
);
