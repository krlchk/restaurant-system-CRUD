import { pool } from "../../config";
import { IUser } from "../types";

export class UserDAO {
  static async createUser(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING *",
      [name, email, password]
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
}
