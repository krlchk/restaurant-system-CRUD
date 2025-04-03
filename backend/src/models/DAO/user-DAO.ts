import { pool } from "../../config";
import { IUser } from "../types";
import bcrypt = require("bcrypt");

export class UserDAO {
  static async createUser(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING *",
      [name, email, hashedPassword]
    );
    return result.rows[0];
  }

  static async getAllUsers(): Promise<IUser[]> {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
  }

  static async getUserById(id: number): Promise<IUser | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async updateUser(
    id: number,
    name: string,
    email: string
  ): Promise<IUser | null> {
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );
    return result.rows[0] || null;
  }
  static async deleteUser(id: number): Promise<IUser | null> {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  }
  static async verifyUser(
    email: string,
    password: string
  ): Promise<IUser | null> {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) return null;
    const user = result.rows[0];
    const isVerify = await bcrypt.compare(password, user.password);
    if (!isVerify) return null;
    return user;
  }
}
