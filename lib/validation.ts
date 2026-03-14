import { z } from "zod";

const postgresUuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const postgresUuidField = z
  .string()
  .trim()
  .regex(postgresUuidPattern, "Invalid UUID");
