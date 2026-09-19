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

const db = (await import("../src/lib/db.js")).default;

async function seed() {
  try {
    const email = (process.env.SEED_SUPER_ADMIN_EMAIL || "mdnuralam2812@gmail.com").toLowerCase();
    const password = process.env.SEED_SUPER_ADMIN_PASSWORD || "01725.Nur";
    const name = "Super Admin";

    console.log("Seeding Super Admin user & account documents for:", email);

    // Clean existing user/account/admin records
    await db.collection("user").deleteMany({ email });
    await db.collection("admins").deleteMany({ email });

    const adminObjectId = new ObjectId();
    const adminIdStr = adminObjectId.toString();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const now = new Date();

    // 1. Better Auth user document (_id as ObjectId)
    await db.collection("user").insertOne({
      _id: adminObjectId,
      id: adminIdStr,
      name,
      email,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Better Auth account document (userId MUST be ObjectId for mongo adapter)
    await db.collection("account").deleteMany({ accountId: adminIdStr });
    await db.collection("account").insertOne({
      _id: new ObjectId(),
      id: adminIdStr,
      userId: adminObjectId, // ObjectId reference for Better Auth mongo adapter
      accountId: adminIdStr,
      providerId: "credential",
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    // 3. App Admin document
    await db.collection("admins").insertOne({
      _id: adminObjectId,
      name,
      email,
      role: "super_admin",
      isActive: true,
      mustChangePassword: false,
      createdAt: now,
      updatedAt: now,
    });

    console.log("Super Admin seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
