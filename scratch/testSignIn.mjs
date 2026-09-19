import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb";
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

const { auth } = await import("../src/lib/auth.js");
const db = (await import("../src/lib/db.js")).default;

async function testSignIn() {
  try {
    const email = "mdnuralam2812@gmail.com";
    const password = "01725.Nur";
    const name = "Super Admin";

    console.log("Seeding Super Admin user & account documents...");

    // Clean old records
    await db.collection("user").deleteMany({ email });
    await db.collection("account").deleteMany({ accountId: { $exists: true } });
    await db.collection("admins").deleteMany({ email });

    const adminId = new ObjectId();
    const adminIdStr = adminId.toString();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const now = new Date();

    // 1. Insert user
    await db.collection("user").insertOne({
      _id: adminId,
      id: adminIdStr,
      name,
      email,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Insert account
    await db.collection("account").insertOne({
      _id: new ObjectId(),
      id: adminIdStr,
      userId: adminIdStr,
      accountId: adminIdStr,
      providerId: "credential",
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Insert admin
    await db.collection("admins").insertOne({
      _id: adminId,
      name,
      email,
      role: "super_admin",
      isActive: true,
      mustChangePassword: false,
      createdAt: now,
      updatedAt: now,
    });

    console.log("Documents inserted successfully!");

    console.log("Testing auth.api.signInEmail...");
    const res = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    console.log("SUCCESS! signInEmail result:", res);
  } catch (err) {
    console.error("signInEmail error:", err);
  } finally {
    process.exit(0);
  }
}

testSignIn();
