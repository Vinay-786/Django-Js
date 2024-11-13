import { Hono } from 'hono'
import { googleAuth } from "@hono/oauth-providers/google"
import { db } from './index.db'
import { NewUser, userTable } from '../drizzle/schema'
import { eq } from 'drizzle-orm'
import { createSession, generateSessionToken, setSessionTokenCookie } from './session'

const app = new Hono()

app.get('/', (c) => {
  return c.html(
    `
    <html>
    <h1> Hello world! </h1>
    <a href="/auth/google"> Login </a>
    </html>
  `)
})

app.use(
  '/auth/google',
  googleAuth({
    client_id: Bun.env.GOOGLE_ID,
    client_secret: Bun.env.GOOGLE_SECRET,
    scope: ['openid', 'email', 'profile'],
  })
)

app.get('/auth/google', async (c) => {
  const token = c.get('token')
  const grantedScopes = c.get('granted-scopes')
  const user = c.get('user-google')

  const UserInfo: NewUser = {
    email: user?.email!,
    name: user?.given_name!,
    google_id: user?.id
  }

  if (user && user.email !== undefined) {
    const checkUser = db
      .select()
      .from(userTable)
      .where(eq(userTable.email, user.email))
      .then((res) => res[0]);

    let Inserteduser;
    try {
      if (checkUser !== null) {
        c.status(401)
        return c.json({ "message": "user already exists" })
      } else {
        const result = await db.insert(userTable).values(UserInfo).returning({id: userTable.Id})
        Inserteduser = result[0].id;
        return c.json({ "message": "user created successfully" });
      }
    } finally {
      const token = generateSessionToken();
      const session = await createSession(token, Inserteduser!)
      setSessionTokenCookie(c, token, session.expiresAt)
    }
  }

  return c.json({
    token,
    grantedScopes,
    user,
  })
})

export default app
