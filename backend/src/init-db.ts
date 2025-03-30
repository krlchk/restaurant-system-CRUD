import { pool } from "./config";

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(50) CHECK (role IN ('admin', 'customer')) NOT NULL
            );
      
            CREATE TABLE IF NOT EXISTS MenuItems (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT
            );
      
            CREATE TABLE IF NOT EXISTS Orders (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES Users(id),
                status VARCHAR(50) CHECK (status IN ('pending', 'cooking', 'completed')) NOT NULL DEFAULT 'pending',
                total_price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
      
            CREATE TABLE IF NOT EXISTS Order_Items (
                order_id INT REFERENCES Orders(id),
                menu_item_id INT REFERENCES MenuItems(id),
                quantity INT NOT NULL CHECK (quantity > 0),
                PRIMARY KEY (order_id, menu_item_id)
            );
          `);
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};
