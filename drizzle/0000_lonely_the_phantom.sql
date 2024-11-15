CREATE TYPE "public"."ProductCategory" AS ENUM('sergical', 'personal', 'vitals', 'others');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Item" (
	"order_item" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Order" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"customer_id" uuid NOT NULL,
	"date" timestamp DEFAULT now(),
	"total_item" integer,
	"total_amount" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Product" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"product_name" varchar NOT NULL,
	"product_description" varchar(256),
	"price" integer NOT NULL,
	"stock" integer DEFAULT 1,
	"category" "ProductCategory"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Session" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_id" varchar,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"PhoneNo" integer,
	"address" varchar(256)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Item" ADD CONSTRAINT "Item_product_id_Product_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("product_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Order" ADD CONSTRAINT "Order_customer_id_Users_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."Users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_Users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
