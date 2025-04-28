import { pool } from "../../config";
import { IUser } from "../types";
import bcrypt = require("bcrypt");

export class UserDAO {
  static async createUser(
    name: string,
    email: string,
    password: string,
    role: "customer" | "admin" = "customer"
  ): Promise<IUser> {
    console.log(`Creating user with email: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, role]
    );
    console.log("User created:", result.rows[0]);
    return result.rows[0];
  }

  static async getAllUsers(): Promise<IUser[]> {
    console.log("Fetching all users...");
    const result = await pool.query("SELECT * FROM users");
    console.log(`Fetched ${result.rows.length} users.`);
    return result.rows;
  }

  static async getUserById(id: number): Promise<IUser | null> {
    console.log(`Fetching user by ID: ${id}`);
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows[0]) {
      console.log("User found:", result.rows[0]);
    } else {
      console.log("User not found.");
    }
    return result.rows[0] || null;
  }

  static async updateUser(
    id: number,
    name: string,
    email: string
  ): Promise<IUser | null> {
    console.log(`Updating user ID ${id}`);
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );
    if (result.rows[0]) {
      console.log("User updated:", result.rows[0]);
    } else {
      console.log("User not found for update.");
    }
    return result.rows[0] || null;
  }
  static async deleteUser(id: number): Promise<IUser | null> {
    console.log(`Deleting user ID: ${id}`);
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows[0]) {
      console.log("User deleted:", result.rows[0]);
    } else {
      console.log("User not found for deletion.");
    }
    return result.rows[0] || null;
  }
  static async verifyUser(
    email: string,
    password: string
  ): Promise<IUser | null> {
    console.log(`Verifying user with email: ${email}`);
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      console.log("User not found during verification.");
      return null;
    }
    const user = result.rows[0];
    const isVerify = await bcrypt.compare(password, user.password);
    if (!isVerify) {
      console.log("Password verification failed.");
      return null;
    }
    console.log("User verified successfully.");
    return user;
  }
}
