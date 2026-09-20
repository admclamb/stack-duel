import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";

// Real functions (the Judge0 judging pipeline, etc.) are registered here starting Phase 2.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});
