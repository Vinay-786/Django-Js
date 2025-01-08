import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, varchar, integer, serial, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod";

const PCategories = ["sergical", "personal_care", "vitals", "others"] as const
export const CategoryProductEnum = pgEnum("product", PCategories)

export const userTable = pgTable("Users", {
	Id: uuid("user_id").defaultRandom().primaryKey().notNull(),
	google_id: varchar("google_id"),
	name: varchar("name").notNull(),
	email: varchar("email").notNull(),
	phoneNo: integer("PhoneNo"),
	address: varchar("address", { length: 256 }),
});

export const order = pgTable("Order", {
	productId: serial("product_id").primaryKey().notNull(),
	customerId: uuid("customer_id").references(() => userTable.Id, { onDelete: 'cascade' }).notNull(),
	date: timestamp({ mode: 'date' }).defaultNow(),
	totalItem: integer("total_item"),
	totalAmount: integer("total_amount"),
});

export const product = pgTable("Product", {
	Id: serial("product_id").primaryKey().notNull(),
	productName: varchar("product_name").notNull(),
	productDescription: varchar("product_description", { length: 256 }),
	price: integer().notNull(),
	stock: integer().default(1),
	ProductCategory: CategoryProductEnum()
});

export const item = pgTable("Item", {
	orderItem: serial("order_item").primaryKey().notNull(),
	productId: integer("product_id").references(() => product.Id, { onDelete: 'cascade' }).notNull(),
	quantity: integer().notNull(),
});

export const sessionTable = pgTable("Session", {
	Id: uuid("session_id").primaryKey().notNull(),
	userId: uuid("user_id").references(() => userTable.Id, { onDelete: 'cascade' }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'date' }).notNull(),
});

export type User = InferSelectModel<typeof userTable>;
export type NewUser = InferInsertModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;

export const createOrderSchema = createInsertSchema(order)
export const createProductSchema = createInsertSchema(product)
export type Categories = (typeof PCategories)[any]
