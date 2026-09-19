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

async function checkCollections() {
  const collections = await db.listCollections().toArray();
  console.log("All collections in DB:", collections.map(c => c.name));

  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`Collection "${c.name}" doc count:`, count);
    if (count > 0) {
      const sample = await db.collection(c.name).findOne();
      console.log(`Sample doc in "${c.name}":`, sample);
    }
  }
  process.exit(0);
}

checkCollections();
