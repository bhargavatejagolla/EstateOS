import { z } from "zod";

/**
 * The single contract Phase 1 proves: the server responds with this shape,
 * the client validates against this exact same schema.
 * If either side drifts, one of them breaks. This is the guarantee.
 */
export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  db: z.literal("connected"),
  timestamp: z.string().datetime(),
});

export const HealthErrorSchema = z.object({
  status: z.literal("degraded"),
  db: z.literal("disconnected"),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type HealthError = z.infer<typeof HealthErrorSchema>;
