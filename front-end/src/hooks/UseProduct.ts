import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

// --- Type Definitions ---
export interface Product {
  id: number;
  name: string;
  brand?: string | null;
  description?: string | null;
  price: string | number;
  cost: string | number;
  stock_quantity: number;
  image_data?: string | null;
  image_data_mimetype?: string | null;
}

// API Response type for paginated data
export interface ProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
}

export interface CreateProductDto {
  name: string;
  brand?: string;
  description?: string;
  price: number;
  cost: number;
  stock_quantity: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: number;
}

// --- API Service ---
export class ProductsService {
  private parseProduct(product: Product): Product {
    return {
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      cost: typeof product.cost === 'string' ? parseFloat(product.cost) : product.cost,
    };
  }

  async getProducts(page: number = 1): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(`/products?page=${page}`);
    return {
      ...response,
      products: response.products.map(product => this.parseProduct(product))
    };
  }

  async getProduct(id: number): Promise<Product> {
    const product = await apiClient.get<Product>(`/products/${id}`);
    return this.parseProduct(product);
  }

  async createProduct(data: CreateProductDto): Promise<{ productId: number }> {
    return apiClient.post<{ productId: number }>('/products', data);
  }

  async updateProduct(data: UpdateProductDto): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/products/${data.id}`, data);
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/products/${id}`);
  }

  async uploadProductImage(productId: number, imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('product_picture', imageFile);
    
    return apiClient.post(`/products/${productId}/picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const productsService = new ProductsService();

// --- React Query Hooks ---
export const useProducts = (page: number = 1) => {
  return useQuery({
    queryKey: ['products', page],
    queryFn: () => productsService.getProducts(page),
  });
};

export const useProduct = (id: number | undefined) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => id ? productsService.getProduct(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProductDto) => productsService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      console.error('Error creating product:', error);
      throw error;
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProductDto) => productsService.updateProduct(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
    onError: (error: Error) => {
      console.error('Error updating product:', error);
      throw error;
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting product:', error);
      throw error;
    },
  });
};

export const useUploadProductImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, imageFile }: { productId: number; imageFile: File }) => 
      productsService.uploadProductImage(productId, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      console.error('Error uploading product image:', error);
      throw error;
    },
  });
};