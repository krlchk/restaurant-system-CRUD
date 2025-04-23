import { OrderDAO } from "../src/models/DAO/order-DAO";
import { pool } from "../src/config";

describe("OrderDAO", () => {
  let testUserId: number;

  beforeAll(async () => {
    const res = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ('Test User', 'test@example.com', '123', 'customer') RETURNING id"
    );
    testUserId = res.rows[0].id;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM orders WHERE user_id = $1", [testUserId]);
    await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
  });

  test("createOrder should create new order", async () => {
    const order = await OrderDAO.createOrder(testUserId, 25.5);
  
    expect(order).toHaveProperty("id");
    expect(order.user_id).toBe(testUserId);
    expect(parseFloat(order.total_price)).toBeCloseTo(25.5, 2);
  });

  test("getByUserId should return orders for user", async () => {
    const orders = await OrderDAO.getByUserId(testUserId);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].user_id).toBe(testUserId);
  });
});