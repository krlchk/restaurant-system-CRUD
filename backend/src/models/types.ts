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
  total_price: string;
  created_at: Date;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}
