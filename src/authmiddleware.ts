import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { db } from "./index.db";
import { eq } from "drizzle-orm";
import { userTable, type User } from "../drizzle/schema";
import { validateSessionToken } from "./session";

type Env = {
  Variables: {
    user: User
  }
}

export const getUser = createMiddleware<Env>(async (c, next) => {
  const sessionId = getCookie(c, 'mysession') ?? null;

  if (!sessionId || sessionId == undefined) {
    c.status(401);
    return c.json({ error: 'Unauthorized' });
  }

  try {
    const loggedUser = await validateSessionToken(sessionId);
    if (!loggedUser.session) {
      c.status(401);
      return c.json({ error: 'Unauthorized' });
    }
    const userExist: User | null = await db
      .select()
      .from(userTable)
      .where(eq(userTable.Id, loggedUser.user.Id))
      .then((res) => res[0])
    if (userExist) {
      c.set("user", userExist)
      await next();
    }

  } catch (e) {
    console.error(e);
    return c.json({ error: "Unauthorized" }, 401);

  }
});
