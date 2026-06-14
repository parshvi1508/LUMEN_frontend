// Next.js only runs a file named `middleware.ts` exporting `middleware`.
// The gating logic lives in ./proxy; this is the wiring that activates it.
export { proxy as middleware, config } from "./proxy";
