import { Hono } from "hono";
import { db } from "./index.db";
import { createOrderSchema, createProductSchema, order, product } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from ".";
import { zValidator } from "@hono/zod-validator";

export const admin = new Hono()
  .post("/product/add", zValidator("json", createProductSchema), async (c) => {
    const ProdAttr = c.req.valid("json");
    const validatedProduct = createProductSchema.parse(ProdAttr);
    const result = await db.insert(product)
      .values(validatedProduct)
      .returning()
      .then((res) => res[0])

    if (!result) {
      return c.json({ "message": "something went wrong" });
    }
    return c.status(200);
  })
  .post("/product/update/:id{[0-8]+}", zValidator("json", createProductSchema), async (c) => {
    const ProdAttr = c.req.valid("json");
    const validatedProduct = createProductSchema.parse(ProdAttr);
    const result = await db.update(product)
      .set(validatedProduct)
      .returning({ id: product.Id })

    if (!result) {
      return c.json({ "message": "something went wrong" });
    }
    return c.status(200);
  })
  .post("/product/delete/:id{[0-9]+}", async (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const result = await db.delete(product)
      .where(eq(product.Id, id))
      .then((res) => res[0])

    if (result) {
      return c.status(200)
    } else {
      return c.json({ "message": "something went wrong" });
    }
  })
  .get("/orders/all", async (c) => {
    const result = await db.select()
      .from(order)
    return c.json({ order: result })
  })
  .get("/orders/:user", async (c) => {
    const UserId = c.req.param("user");
    const result = await db.select()
      .from(order)
      .where(eq(order.customerId, UserId))
    return c.json({ order: result })
  })
