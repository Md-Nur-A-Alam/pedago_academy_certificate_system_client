import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

const { auth } = await import("../src/lib/auth.js");

async function testActualSignIn() {
  try {
    console.log("Calling auth.api.signInEmail with mdnuralam2812@gmail.com / 01725.Nur...");
    const res = await auth.api.signInEmail({
      body: {
        email: "mdnuralam2812@gmail.com",
        password: "01725.Nur",
      },
    });

    console.log("AUTH SIGN IN SUCCESSFUL! Result:", res);
  } catch (err) {
    console.error("AUTH SIGN IN ERROR:", err);
  } finally {
    process.exit(0);
  }
}

testActualSignIn();
