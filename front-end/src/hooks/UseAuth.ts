import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api/Api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  payload: {
    role: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface AuthUser {
  token: string;
  user: any;
  role: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response && response.token) {
      const authData: AuthUser = {
        token: response.token,
        user: response.payload,
        role: response.payload.role
      };
      
      // Store tokens in localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('role', response.payload.role);
      localStorage.setItem('user', JSON.stringify(response.payload));
      
      return authData;
    }
    
    throw new Error('Invalid login response');
  }

  logout(): void {
    // Clear all auth-related storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

// React Query hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, LoginCredentials>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Update any related queries if needed
      queryClient.setQueryData(['auth', 'user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      console.error('Login error:', error);
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.clear();
    }
  });
};

export const useAuth = () => {
  const user = authService.getCurrentUser();
  const token = authService.getToken();
  const role = authService.getRole();
  
  return {
    user,
    token,
    role,
    isAuthenticated: authService.isAuthenticated(),
  };
};
