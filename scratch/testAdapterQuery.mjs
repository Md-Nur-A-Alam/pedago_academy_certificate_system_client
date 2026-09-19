import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

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
const adapter = mongodbAdapter(db)({});

async function testAdapter() {
  try {
    const user = await adapter.findOne({
      model: "user",
      where: [{ field: "email", value: "mdnuralam2812@gmail.com" }],
    });
    console.log("User:", user);

    const account = await adapter.findOne({
      model: "account",
      where: [{ field: "userId", value: user.id }],
    });
    console.log("Account by userId (string):", account);

    const accountByAccountId = await adapter.findOne({
      model: "account",
      where: [{ field: "accountId", value: user.id }],
    });
    console.log("Account by accountId (string):", accountByAccountId);
  } catch (err) {
    console.error("Adapter error:", err);
  } finally {
    process.exit(0);
  }
}

testAdapter();
