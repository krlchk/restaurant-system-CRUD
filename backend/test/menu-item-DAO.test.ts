import { MenuItemDAO } from "../src/models/DAO/menu-Item-DAO";
import { pool } from "../src/config";

// Мокаємо pool.query
jest.mock("../src/config", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("MenuItemDAO", () => {
  const mockQuery = pool.query as jest.Mock;

  afterEach(() => {
    mockQuery.mockReset();
  });

  test("should return all menu items", async () => {
    const fakeItems = [
      { id: 1, name: "Pizza", price: 12.5 },
      { id: 2, name: "Burger", price: 10 },
    ];

    mockQuery.mockResolvedValueOnce({ rows: fakeItems });

    const items = await MenuItemDAO.getAll();

    expect(items).toHaveLength(2);
    expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM menu_items");
    expect(items[0].name).toBe("Pizza");
  });

  test("should return item by ID", async () => {
    const fakeItem = { id: 2, name: "Burger", price: 10 };
    mockQuery.mockResolvedValueOnce({ rows: [fakeItem] });

    const item = await MenuItemDAO.getById(2);

    expect(item).toBeDefined();
    expect(item?.name).toBe("Burger");
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT * FROM menu_items WHERE id = $1",
      [2]
    );
  });
});
