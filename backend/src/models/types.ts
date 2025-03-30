export interface IMenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

export interface IOrder {
  id: number;
  user_id: number;
  status: string;
  total_price: number;
  created_at: Date;
}
