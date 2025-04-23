import { UserDAO } from "../src/models/DAO/user-DAO";
import { pool } from "../src/config";

describe("UserDAO", () => {
  let userId: number;

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    await pool.end();
  });

  test("createUser should insert a user", async () => {
    const user = await UserDAO.createUser("Test User", "test@email.com", "password123");
    expect(user).toHaveProperty("id");
    expect(user.email).toBe("test@email.com");
    userId = user.id;
  });

  test("getUserById should retrieve the correct user", async () => {
    const user = await UserDAO.getUserById(userId);
    expect(user).not.toBeNull();
    expect(user!.id).toBe(userId);
  });

  test("updateUser should update name and email", async () => {
    const updated = await UserDAO.updateUser(userId, "Updated", "new@email.com");
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("Updated");
  });

  test("deleteUser should remove user", async () => {
    const deleted = await UserDAO.deleteUser(userId);
    expect(deleted).not.toBeNull();
    expect(deleted!.id).toBe(userId);
  });
});
