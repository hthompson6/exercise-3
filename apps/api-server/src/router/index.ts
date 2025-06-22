import { createCallerFactory, createTRPCRouter } from "../trpc";
import { SbirRouter } from "./sbir-records";

import { helloWorldRouter } from "./hello-world";

export const router = createTRPCRouter({
  helloWorld: helloWorldRouter,
  sbirRecord: SbirRouter
});

export type AppRouter = typeof router;

export const createCaller = createCallerFactory(router);
