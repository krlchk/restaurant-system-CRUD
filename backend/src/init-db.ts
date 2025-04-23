import { pool } from "./config";

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT
            );
      
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id),
                status VARCHAR(50) CHECK (status IN ('pending', 'cooking', 'completed')) NOT NULL DEFAULT 'pending',
                total_price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};