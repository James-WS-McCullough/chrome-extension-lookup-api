import { z } from "zod";

const envSchema = z.object({
  port: z.coerce.number().int().positive().default(3000),
  simulatedDelayMs: z.coerce.number().int().nonnegative().default(0),
});

export const env = envSchema.parse({
  port: process.env.PORT,
  simulatedDelayMs: process.env.SIMULATED_DELAY_MS,
});
