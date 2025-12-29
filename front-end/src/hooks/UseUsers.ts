import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

// --- Type Definitions ---
export type UserRole = 'reception' | 'doctor' | 'admin' | 'professional' | 'cashier' ;
export type UserRoleFilter = UserRole | 'all';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  department?: string;
  profile_picture?: string | null;
}

export interface UsersResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  id: number;
}

export interface CreateUserResponse {
  message: string;
  user: User & { temporary_password: string };
}

// --- API Service ---
export class UsersService {
  private formatUser(user: any): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      is_active: user.is_active !== false,
      avatar: user.avatar || null,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
      department: user.department,
      profile_picture: user.profile_picture
        ? `data:image/jpeg;base64,${user.profile_picture}`
        : null,
    };
  }

  async getUsers(page: number = 1, role: UserRoleFilter = 'all'): Promise<UsersResponse> {
    let endpoint = '/users';
    if (role !== 'all') {
      endpoint = `/users/role/${role}`;
    }
    
    const response = await apiClient.get<UsersResponse>(`${endpoint}?page=${page}`);
    return {
      ...response,
      users: response.users.map(user => this.formatUser(user))
    };
  }

  async searchUsersByPhone(phone: string): Promise<User[]> {
    if (!phone.trim()) return [];
    
    try {
      const response = await apiClient.get<User[] | User>(`/users/search/${phone}`);
      const users = Array.isArray(response) ? response : [response];
      return users.map(user => this.formatUser(user));
    } catch (error: any) {
      if (error.message.includes('404') || error.message.includes('Not found')) {
        return [];
      }
      throw error;
    }
  }

  async getUser(id: number): Promise<User> {
    const user = await apiClient.get<User>(`/users/${id}`);
    return this.formatUser(user);
  }

  async createUser(data: CreateUserDto): Promise<CreateUserResponse> {
    return apiClient.post<CreateUserResponse>('/users', data);
  }

  async updateUser(data: UpdateUserDto): Promise<User> {
    return apiClient.put<User>(`/users/${data.id}`, data);
  }

  async deleteUser(id: number): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  }

  async resetPassword(body: {password: string, email: string}){
    return apiClient.post(`/auth/reset-password`, body);
  }
}

export const usersService = new UsersService();

// --- React Query Hooks ---
export const useUsers = (page: number = 1, role: UserRoleFilter = 'all') => {
  return useQuery({
    queryKey: ['users', page, role],
    queryFn: () => usersService.getUsers(page, role),
  });
};

export const useUser = (id: number | undefined) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => id ? usersService.getUser(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });
};

export const useUsersSearch = (phone: string) => {
  return useQuery({
    queryKey: ['users', 'search', phone],
    queryFn: () => usersService.searchUsersByPhone(phone),
    enabled: phone.trim().length >= 3 && /^\d+$/.test(phone),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserDto) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error);
      throw error;
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserDto) => usersService.updateUser(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
    onError: (error: Error) => {
      console.error('Error updating user:', error);
      throw error;
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting user:', error);
      throw error;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (body: {password: string, email: string}) => usersService.resetPassword(body)
  });
}