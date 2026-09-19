import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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

async function testCurrentPassword() {
  const user = await db.collection("user").findOne({ email: "mdnuralam2812@gmail.com" });
  console.log("User doc:", user);

  const account = await db.collection("account").findOne({ userId: user?.id || user?._id?.toString() });
  console.log("Account doc:", account);

  if (account) {
    const match = await bcrypt.compare("01725.Nur", account.password);
    console.log("Does '01725.Nur' match stored hash?", match);
  }

  process.exit(0);
}

testCurrentPassword();
