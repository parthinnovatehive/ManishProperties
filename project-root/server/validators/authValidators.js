const { z } = require("zod");

const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username too short")
    .max(50, "Username too long"),

  password: z
    .string()
    .min(6, "Password too short")
    .max(100, "Password too long"),
});

module.exports = {
  loginSchema,
};