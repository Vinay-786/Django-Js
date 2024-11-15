import { Hono } from 'hono'
import { jwt, sign } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'
import { setCookie, deleteCookie } from 'hono/cookie'
import { googleAuth } from '@hono/oauth-providers/google'
import { db } from './index.db'
import { NewUser, userTable } from '../drizzle/schema'
import { eq } from 'drizzle-orm'
import { logger } from 'hono/logger'
import { createMiddleware } from 'hono/factory'

// Types
interface User {
  id: string,
  exp: number
}

type Env = {
  Variables: User
}

// Create the Hono app
const app = new Hono()

app.use(logger())
// JWT middleware
const authMiddleware = jwt({
  secret: process.env.JWT_SECRET!,
  cookie: 'auth_token'
})

// Protected route middleware
export const requireAuth = createMiddleware<Env>(async (c, next) => {
  try {
    // Verify JWT token
    await authMiddleware(c, next)

    // Get user from JWT payload
    const payload = c.get('jwtPayload')
    if (!payload) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }

    // Set user in context
    c.set('jwtPayload', payload)

    await next()
  } catch (error) {
    return c.json({ "message": error })
  }
})

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

// Auth routes
app.get('/auth/google',
  async (c) => {
    const tokenId = c.get('token')
    // const grantedScopes = c.get('granted-scopes')
    const OAuthUser = c.get('user-google')

    const UserInfo: NewUser = {
      email: OAuthUser?.email!,
      name: OAuthUser?.given_name!,
      google_id: OAuthUser?.id!
    }

    const checkUser = await db.select()
      .from(userTable)
      .where(eq(userTable.email, OAuthUser?.email!)).then((res) => res[0])


    try {
      if (!checkUser) {
        await db.insert(userTable).values(UserInfo)
      }
    } catch (e) {
      throw new HTTPException(401, { message: "something went wrong" })
    } finally {
      // Create user object
      const user: User = {
        id: OAuthUser?.id!,
        exp: tokenId?.expires_in!
      }

      // Generate JWT token
      const token = await sign({ user }, process.env.JWT_SECRET!)
      // Set HTTP-only cookie
      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        maxAge: 60 * 60 * 24 // 24 hours
      })
    }

    return c.json({ message: 'Logged in successfully' })
  })

app.post('/auth/logout', (c) => {
  deleteCookie(c, 'auth_token')
  return c.json({ message: 'Logged out successfully' })
})

// Protected routes
app.get('/protected', requireAuth, (c) => {
  const user = c.var.jwtPayload
  return c.json({ "message": user.user })
})

// Public routes
app.get('/public', (c) => {
  return c.json({ message: 'Public route' })
})

export default app
