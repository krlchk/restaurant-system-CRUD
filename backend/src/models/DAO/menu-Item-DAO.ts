import { pool } from "../../config";
import { IMenuItem } from "../types";

export class MenuItemDAO {
  static async getAll(): Promise<IMenuItem[]> {
    const result = await pool.query("SELECT * FROM menu_items");
    return result.rows;
  }
  static async getById(id: number): Promise<IMenuItem[]> {
    const result = await pool.query("SELECT * FROM menu_items WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  }
}
