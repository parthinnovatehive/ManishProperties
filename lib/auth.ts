// Re-export Auth utilities from the .tsx implementation
export type Role = 'user' | 'agent' | 'admin' | 'super-admin' | null;
export { AuthProvider, useAuth } from './auth.tsx';
