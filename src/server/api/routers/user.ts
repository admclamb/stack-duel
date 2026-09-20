import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getCurrentAppUser } from "~/server/auth/current-user";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(() => getCurrentAppUser()),
});
