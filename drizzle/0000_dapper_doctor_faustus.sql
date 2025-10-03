CREATE TABLE "devices" (
	"id" uuid NOT NULL,
	"image" text NOT NULL,
	"role" text NOT NULL,
	"driver" text NOT NULL,
	"address" jsonb NOT NULL,
	"labels" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "readings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"device_id" uuid NOT NULL,
	"value" numeric NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" text NOT NULL,
	"value" text DEFAULT '' NOT NULL
);
