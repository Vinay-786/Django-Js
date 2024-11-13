CREATE TYPE "public"."categories" AS ENUM('sergical', 'personal care', 'vitamin and nutrition');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Order" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"customer_id" uuid NOT NULL,
	"date" timestamp DEFAULT now(),
	"total_item" integer,
	"total_amount" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Item" (
	"order_item" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"product_name" varchar NOT NULL,
	"product_description" varchar(256),
	"price" integer,
	"stock" integer,
	"category" "categories"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"PhoneNo" integer,
	"address" varchar(256)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Order" ADD CONSTRAINT "Order_customer_id_users_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Item" ADD CONSTRAINT "Item_product_id_product_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
