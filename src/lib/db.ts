import "server-only";
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "rokketsupport";

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }
  if (!clientPromise) {
    // In dev, Next.js's module reloading would otherwise open a new
    // connection on every edit — cache the client on the global object so
    // it survives hot reloads.
    const globalForMongo = globalThis as unknown as {
      _mongoClientPromise?: Promise<MongoClient>;
    };
    if (process.env.NODE_ENV === "development") {
      if (!globalForMongo._mongoClientPromise) {
        globalForMongo._mongoClientPromise = new MongoClient(uri).connect();
      }
      clientPromise = globalForMongo._mongoClientPromise;
    } else {
      clientPromise = new MongoClient(uri).connect();
    }
  }
  return clientPromise;
}

interface SeedTeamMemberDoc {
  _id: string;
  name: string;
  username: string;
  usernameLower: string;
  email: string;
  role: string;
  passwordHash: string;
  createdAt: Date;
}

let schemaReady: Promise<void> | null = null;

function ensureSchema(db: Db): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const teamMembers = db.collection<SeedTeamMemberDoc>("team_members");
      await teamMembers.createIndex({ usernameLower: 1 }, { unique: true });

      const count = await teamMembers.countDocuments();
      if (count === 0) {
        // Seed the first site admin (plaintext: ddxs489Z!) so the original
        // login keeps working on a fresh database.
        await teamMembers.insertOne({
          _id: "seed-admin",
          name: "Site Admin",
          username: "Admin",
          usernameLower: "admin",
          email: "",
          role: "admin",
          passwordHash: "$2b$10$pk6z1orPLrAVH07C9H2x1OqyOx7u.j0smRNfB5dtcf4nKg3qnBJEi",
          createdAt: new Date(),
        });
      }
    })();
  }
  return schemaReady;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const db = client.db(dbName);
  await ensureSchema(db);
  return db;
}
