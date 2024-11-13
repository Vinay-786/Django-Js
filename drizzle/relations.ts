import { relations } from "drizzle-orm/relations";
import { userTable, order, product, item, sessionTable } from "./schema";

export const orderRelations = relations(order, ({one}) => ({
	user: one(userTable, {
		fields: [order.customerId],
		references: [userTable.Id]
	}),
}));

export const userTableRelations = relations(userTable, ({many}) => ({
	orders: many(order),
	sessionTables: many(sessionTable),
}));

export const itemRelations = relations(item, ({one}) => ({
	product: one(product, {
		fields: [item.productId],
		references: [product.Id]
	}),
}));

export const productRelations = relations(product, ({many}) => ({
	items: many(item),
}));

export const sessionTableRelations = relations(sessionTable, ({one}) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.Id]
	}),
}));
