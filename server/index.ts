import { Hono } from "hono";
import { cors } from 'hono/cors'
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { userActions } from "./userActions";
import { adminActions } from "./adminActions";
import { publicActions } from "./actions";
import auth from "./authRoutes";

const app = new Hono();
app.use(logger());
const apiRoutes = app.basePath("/api")
	.route("/auth", auth)
	.route("/user", userActions)
	.route("/admin", adminActions)
	.route("/public", publicActions);

app.use('*', cors())

app.use('/static/*', serveStatic({
	root: './frontend/dist',
	rewriteRequestPath: (path) => path.replace(/^\/static/, ''),
}))

app.use('/*', serveStatic({
	root: './frontend/dist',
}))

app.get('*', serveStatic({
	root: './frontend/dist',
	path: 'index.html'
}))


Bun.serve(app)

export default app
export type ApiRoutes = typeof apiRoutes
