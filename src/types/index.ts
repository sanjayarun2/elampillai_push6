export interface Shop {
  id: string;
  name: string;
  address: string;
  description: string;
  rating: number;
  phone?: string;
  category: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  seller: string;
  whatsappLink: string;
  image: string;
  category: string;
}