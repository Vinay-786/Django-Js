import { Hono } from "hono";
import { db } from "./index.db";
import { type PCategories, createOrderSchema, order, product } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getUser } from "./authmiddleware";
import { zValidator } from "@hono/zod-validator";


export const user = new Hono()
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
    const pcategory = c.req.param("category") as PCategories
    const result = await db.select()
      .from(product)
      .where(eq(product.category, pcategory))
    return c.json({ product: result })
  })
  .get("/myorders", getUser, async (c) => {
    const user = c.var.user;
    const result = await db.select()
      .from(order)
      .where(eq(order.customerId, user.Id))
    return c.json({ order: result })
  })
  .get("/placeorder", getUser, zValidator('json', createOrderSchema), async (c) => {
    const user = c.var.user;
    const orderAttr = c.req.valid("json");
    const validatedExpense = createOrderSchema.parse({
      ...orderAttr,
      cutomserId: user.Id
    });
    const result = await db.insert(order)
      .values(validatedExpense)
      .returning()
      .then((res) => res[0])
    if (result) {
      c.status(200);
      return c.json({ "message": "order placed successfully" });
    }
    return c.json({ "message": "something went wrong" });
  })
