import { pool } from "../../config";
import { IOrder } from "../types";

export class OrderDAO {
  static async getAll(): Promise<IOrder[]> {
    const result = await pool.query("SELECT * FROM Orders");
    return result.rows;
  }

  static async createOrder(
    user_id: number,
    total_price: number
  ): Promise<IOrder> {
    const result = await pool.query(
      "INSERT INTO orders [user_id, status, total_price, created_at] VALUES ($1, 'pending', $2, NOW()) RETURNING *",
      [user_id, total_price]
    );
    return result.rows[0];
  }
  static async updateOrderStatus(
    orderId: number,
    newStatus: string
  ): Promise<IOrder | null> {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [newStatus, orderId]
    );
    return result.rows[0] || null;
  }
}
