import { pool } from "../../config";
import { IOrder } from "../types";

export class OrderDAO {
  static async getAll(): Promise<IOrder[]> {
    console.log("Fetching all orders...");
    const result = await pool.query("SELECT * FROM Orders");
    console.log(`Fetched ${result.rows.length} orders.`);
    return result.rows;
  }

  static async getByUserId(userId: number) {
    console.log(`Fetching orders for user ID: ${userId}`);
    const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
      userId,
    ]);
    console.log(`Fetched ${result.rows.length} orders for user ID: ${userId}`);
    return result.rows;
  }

  static async createOrder(
    userId: number,
    totalPrice: number
  ): Promise<IOrder> {
    console.log(
      `Creating order for user ID ${userId} with total price ${totalPrice}`
    );
    const res = await pool.query(
      "INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *",
      [userId, totalPrice]
    );
    console.log("Order created:", res.rows[0]);
    return res.rows[0];
  }

  static async updateOrderStatus(
    orderId: number,
    newStatus: "pending" | "cooking" | "completed"
  ): Promise<IOrder | null> {
    console.log(`Updating order ID ${orderId} to status '${newStatus}'`);
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [newStatus, orderId]
    );
    if (result.rows[0]) {
      console.log("Order updated:", result.rows[0]);
    } else {
      console.log("Order not found for update.");
    }
    return result.rows[0] || null;
  }
  static async deleteOrder(id: number): Promise<IOrder | null> {
    console.log(`Deleting order ID: ${id}`);

    const result = await pool.query(
      "DELETE FROM orders WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows[0]) {
      console.log("Order deleted:", result.rows[0]);
    } else {
      console.log("Order not found for deletion.");
    }
    return result.rows[0] || null;
  }
  static async getById(orderId: number) {
    console.log(`Fetching order by ID: ${orderId}`);
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [
      orderId,
    ]);
    if (result.rows[0]) {
      console.log("Order found:", result.rows[0]);
    } else {
      console.log("Order not found.");
    }
    return result.rows[0] || null;
  }
}
