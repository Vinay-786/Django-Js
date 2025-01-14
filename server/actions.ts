import { Hono } from "hono";
import { db } from "./index.db";
import { type Categories, product } from "./schema";
import { eq } from "drizzle-orm";


export const publicActions = new Hono()
	.get("/products/all", async (c) => {
		const result = await db.select().from(product);
		return c.json({ products: result })
	})

	.get("/products/:id{[0-9]+}", async (c) => {
		const id = Number.parseInt(c.req.param("id"));
		const result = await db.select()
			.from(product)
			.where(eq(product.Id, id))
		return c.json({ product: result[0] })
	})
	.get("/products/:name", async (c) => {
		const pname = c.req.param("name")
		const result = await db.select()
			.from(product)
			.where(eq(product.productName, pname))
		return c.json({ product: result })
	})
	.get("/products/:category", async (c) => {
		const pcategory = c.req.param("category") as Categories;
		const result = await db.select()
			.from(product)
			.where(eq(product.ProductCategory, pcategory))
		return c.json({ product: result })
	}).get('test', (c) => {
		return c.json({ "message": "public route" });
	})
