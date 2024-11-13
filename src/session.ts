import { userTable, sessionTable, type User, type Session } from '../drizzle/schema';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from "@oslojs/crypto/sha2";
import { db } from './index.db'; 
import { eq } from 'drizzle-orm';
import { Context } from 'hono';


export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session: Session = {
        Id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
    await db.insert(sessionTable).values(session);
    return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const result = await db
        .select({ user: userTable, session: sessionTable })
        .from(sessionTable)
        .innerJoin(userTable, eq(sessionTable.userId, userTable.Id))
        .where(eq(sessionTable.Id, sessionId));
    if (result.length < 1) {
        return { session: null, user: null };
    }
    const { user, session } = result[0];
    if (Date.now() >= session.expiresAt.getTime()) {
        await db.delete(sessionTable).where(eq(sessionTable.Id, session.Id));
        return { session: null, user: null }
    }
    //get a fresh 30 day token if old one exceeded 15 days
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db
            .update(sessionTable)
            .set({
                expiresAt: session.expiresAt
            })
            .where(eq(sessionTable.Id, session.Id));
    }
    return { session, user }
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.delete(sessionTable).where(eq(sessionTable.Id, sessionId))
}

export function setSessionTokenCookie(c: Context, token: string, expiresAt: Date): void{
    if (process.env.NODE_ENV === 'production') {
        c.header(
            'Set-Cookie',
            `mysession=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/; Secure;`
        );
    } else {
        c.header(
            'Set-Cookie',
            `mysession=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/`
        );
    }
}

export function deleteSessionTokenCookie(c: Context): void{
    if (process.env.NODE_ENV === 'production') {
        c.header(
            "Set-Cookie",
            "mysession=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/; Secure;"
        );
    } else {
        c.header("Set-Cookie",
            "mysession=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/");
    }
}

export type SessionValidationResult =
    | { session: Session; user: User }
    | { session: null; user: null };



