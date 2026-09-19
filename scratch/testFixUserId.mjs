import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb";

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
const { mongodbAdapter } = await import("better-auth/adapters/mongodb");
const adapter = mongodbAdapter(db)({});

async function testFix() {
  const user = await db.collection("user").findOne({ email: "mdnuralam2812@gmail.com" });
  console.log("User doc _id:", user._id);

  // Update account.userId to be ObjectId(user._id)
  await db.collection("account").updateMany(
    { accountId: user._id.toString() },
    { $set: { userId: user._id } }
  );

  console.log("Updated account.userId to ObjectId!");

  const accountByUserId = await adapter.findOne({
    model: "account",
    where: [{ field: "userId", value: user._id.toString() }],
  });

  console.log("Adapter findOne account result AFTER fix:", accountByUserId);

  // Now test sign in with auth.api.signInEmail
  const { auth } = await import("../src/lib/auth.js");
  const res = await auth.api.signInEmail({
    body: {
      email: "mdnuralam2812@gmail.com",
      password: "01725.Nur",
    },
  });

  console.log("SUCCESS!! signInEmail result:", res);
  process.exit(0);
}

testFix();
