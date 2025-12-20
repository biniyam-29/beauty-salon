export interface Product {
  id: number;
  name: string;
  brand: string | null;
  cost: number;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_data: string | null; // Base64 data string from the API
  image_data_mimetype?: string;
}