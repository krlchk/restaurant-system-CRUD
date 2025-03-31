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
}
