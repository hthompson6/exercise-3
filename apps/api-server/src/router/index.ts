import { createCallerFactory, createTRPCRouter } from "../trpc";
import { SbirRouter } from "./sbir-records";

export const router = createTRPCRouter({
  sbirRecord: SbirRouter
});

export type AppRouter = typeof router;

export const createCaller = createCallerFactory(router);
