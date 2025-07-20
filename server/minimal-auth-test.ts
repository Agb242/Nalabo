// Test minimal user creation
import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";

async function createTestUser() {
  try {
    console.log("Creating test user...");
    
    const hashedPassword = await bcrypt.hash("test12345", 12);
    
    // Insert directly with only existing columns
    const result = await db.execute({
      sql: `INSERT INTO users (username, email, password, role, points) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, username, email, role, points, created_at`,
      args: ["testuser8", "test8@nalabo.com", hashedPassword, "user", 0]
    });
    
    console.log("User created:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

createTestUser();