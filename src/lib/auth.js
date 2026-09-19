import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import db from "./db.js";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    password: {
      hash: async (password) => {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
      },
      verify: async ({ password, hash }) => {
        return bcrypt.compare(password, hash);
      },
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"],
  secret: process.env.BETTER_AUTH_SECRET,
});
