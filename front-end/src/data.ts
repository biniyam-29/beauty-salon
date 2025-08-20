import type { User, Product } from "./types";

export const initialUsers: User[] = [
  {
    id: 1,
    name: "Nogin Tassos",
    email: "nogin@example.com",
    phone: "123-456-7890",
    role: "doctor",
    is_active: true,
    avatar: "https://placehold.co/40x40/d1d5db/4b5563?text=N",
  },
  {
    id: 2,
    name: "Prodiarquer",
    email: "prodi@example.com",
    phone: "123-456-7891",
    role: "reception",
    is_active: true,
    avatar: "https://placehold.co/40x40/d1d5db/4b5563?text=P",
  },
  {
    id: 3,
    name: "Wrom Torrtst",
    email: "wrom@example.com",
    phone: "123-456-7892",
    role: "inventory-manager",
    is_active: false,
    avatar: "https://placehold.co/40x40/d1d5db/4b5563?text=W",
  },
];

export const initialProducts: Product[] = [
  {
    id: 1,
    name: "Fity Sotam",
    brand: "BrandA",
    description: "A rejuvenating daily facial cleanser.",
    price: 5.0,
    stock_quantity: 15,
    image:
      "https://images.unsplash.com/photo-1580854212958-891b92931a2d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Days a Nam",
    brand: "BrandB",
    description: "Brightening serum with vitamin C.",
    price: 3.0,
    stock_quantity: 0,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Reoich Name",
    brand: "BrandA",
    description: "Hydrating moisturizer for dry skin.",
    price: 2.0,
    stock_quantity: 30,
    image:
      "https://plus.unsplash.com/premium_photo-1675827055694-de1a469a8b4d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Cotte Bmalls",
    brand: "BrandC",
    description: "Gentle exfoliating toner pads.",
    price: 3.0,
    stock_quantity: 5,
    image:
      "https://images.unsplash.com/photo-1590439471364-192aa70c2b51?q=80&w=400&auto=format&fit=crop",
  },
];

export const adminUser: User = {
  id: 0,
  name: "Admin User",
  email: "admin@example.com",
  phone: "",
  role: "super-admin",
  is_active: true,
  avatar: "https://placehold.co/40x40/fee2e2/991b1b?text=A",
};
