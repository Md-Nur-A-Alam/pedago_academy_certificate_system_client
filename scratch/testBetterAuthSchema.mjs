import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const [k, ...v] = line.split("=");
    if (k && v.length > 0) {
      process.env[k.trim()] = v.join("=").trim();
    }
  });
}

const db = (await import("../src/lib/db.js")).default;

const testAuth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false, // temporarily enabled to test schema generation
    password: {
      hash: async (p) => bcrypt.hash(p, 10),
      verify: async ({ password, hash }) => bcrypt.compare(password, hash),
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
});

async function inspectSchema() {
  try {
    const email = "testsignup@pedagoacademy.com";
    const password = "TestPassword123!";

    await db.collection("user").deleteMany({ email });
    await db.collection("account").deleteMany({ accountId: email });

    console.log("Creating user via testAuth.api.signUpEmail...");
    const res = await testAuth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Test User",
      },
    });

    console.log("signUpEmail res:", res);

    const userDoc = await db.collection("user").findOne({ email });
    const accountDoc = await db.collection("account").findOne({ userId: userDoc?.id || userDoc?._id?.toString() });

    console.log("Better Auth generated User doc:", userDoc);
    console.log("Better Auth generated Account doc:", accountDoc);

    console.log("Now testing sign-in with generated documents...");
    const signInRes = await testAuth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    console.log("signInEmail SUCCESS! Result:", signInRes);

    await db.collection("user").deleteMany({ email });
    await db.collection("account").deleteMany({ accountId: email });
  } catch (err) {
    console.error("Error inspecting schema:", err);
  } finally {
    process.exit(0);
  }
}

inspectSchema();
