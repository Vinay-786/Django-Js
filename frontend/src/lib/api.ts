import { hc } from "hono/client";
import { ApiRoutes } from "@server/index";

export let client: any;
if (import.meta.env.DEV) {
	client = hc<ApiRoutes>('http://localhost:5173/')
}
if (import.meta.env.PROD) {
	client = hc<ApiRoutes>('http://localhost:3000/')
}

