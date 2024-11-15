import { Hono } from "hono";
import { db } from "./index.db";
import { createOrderSchema, order, User } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from ".";
import { zValidator } from "@hono/zod-validator";

export const user = new Hono()
  .get("/myorders", requireAuth, async (c) => {
    const user = c.var.jwtPayload.user
    const result = await db.select()
      .from(order)
      .where(eq(order.customerId, user.id))
    return c.json({ order: result })
  })
  .get("/placeorder", requireAuth, zValidator('json', createOrderSchema), async (c) => {
    const user = c.var.jwtPayload.user
    const orderAttr = c.req.valid("json");
    const validatedExpense = createOrderSchema.parse({
      ...orderAttr,
      cutomserId: user.id
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
