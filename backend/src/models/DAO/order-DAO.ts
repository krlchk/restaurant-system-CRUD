import { pool } from "../../config";
import { IOrder } from "../types";

export class OrderDAO {
  static async getAll(): Promise<IOrder[]> {
    const result = await pool.query("SELECT * FROM Orders");
    return result.rows;
  }

  static async getByUserId(userId: number) {
    const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
      userId,
    ]);
    return result.rows;
  }

  static async createOrder(
    user_id: number,
    total_price: number
  ): Promise<IOrder> {
    const result = await pool.query(
      "INSERT INTO orders (user_id, status, total_price, created_at) VALUES ($1, 'pending', $2, NOW()) RETURNING *",
      [user_id, total_price]
    );
    return result.rows[0];
  }
  static async updateOrderStatus(
    orderId: number,
    newStatus: "pending" | "cooking" | "completed"
  ): Promise<IOrder | null> {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [newStatus, orderId]
    );
    return result.rows[0] || null;
  }
  static async deleteOrder(id: number): Promise<IOrder | null> {
    const result = await pool.query(
      "DELETE FROM orders WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  }
  static async getById(orderId: number) {
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [
      orderId,
    ]);
    return result.rows[0] || null;
  }
}
