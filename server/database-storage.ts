import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseAuth {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error updating last login:", error);
      return false;
    }
  }
}

export const databaseAuth = new DatabaseAuth();