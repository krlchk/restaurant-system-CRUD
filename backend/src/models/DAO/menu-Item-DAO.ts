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
  static async seed() {
    const items = [
      {
        name: "Margherita Pizza",
        price: 8.99,
        description: "Classic pizza with tomato sauce and mozzarella cheese.",
      },
      {
        name: "Cheeseburger",
        price: 7.49,
        description: "Juicy beef patty with cheese, lettuce, and tomato.",
      },
      {
        name: "Spaghetti Carbonara",
        price: 9.99,
        description: "Pasta with creamy sauce, pancetta, and parmesan.",
      },
      {
        name: "Caesar Salad",
        price: 6.49,
        description: "Romaine lettuce, croutons, and Caesar dressing.",
      },
      {
        name: "Chicken Nuggets",
        price: 5.99,
        description: "Crispy chicken bites served with dipping sauce.",
      },
    ];

    for (const item of items) {
      await pool.query(
        "INSERT INTO menu_items (name, price, description) VALUES ($1, $2, $3)",
        [item.name, item.price, item.description]
      );
    }
  }
}
