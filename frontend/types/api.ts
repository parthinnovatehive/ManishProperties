/**
 * API Response Types
 * Centralized type definitions for all API responses
 */

import { Property } from "./property";

/**
 * Generic API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Authentication Responses
 */
export interface AdminData {
  id: string;
  username: string;
  email?: string;
  role: string;
  name?: string;
  phone?: string;
  city_id?: string;
  sub_area_ids?: string[]; // Added array of subarea IDs
}

export interface LoginResponse extends ApiResponse<never> {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  refreshToken?: string;
  admin: AdminData;
  user?: AdminData;
  message?: string;
}


export interface LogoutResponse extends ApiResponse<never> {
  success: boolean;
  message?: string;
}

/**
 * Admin Properties Responses
 */
export interface PropertiesListResponse extends ApiResponse<Property[]> {
  success: boolean;
  properties?: Property[];
  data?: Property[];
  message?: string;
}

export interface PropertyDetailResponse extends ApiResponse<Property> {
  success: boolean;
  property?: Property;
  data?: Property;
  message?: string;
}

export interface PropertyCreateResponse extends ApiResponse<Property> {
  success: boolean;
  property?: Property;
  data?: Property;
  id?: string | number;
  message?: string;
}

export interface PropertyUpdateResponse extends ApiResponse<Property> {
  success: boolean;
  property?: Property;
  data?: Property;
  message?: string;
}

export interface PropertyDeleteResponse extends ApiResponse<never> {
  success: boolean;
  message?: string;
}

export interface PropertyApproveResponse extends ApiResponse<Property> {
  success: boolean;
  property?: Property;
  data?: Property;
  message?: string;
}

export interface PropertyRejectResponse extends ApiResponse<Property> {
  success: boolean;
  property?: Property;
  data?: Property;
  message?: string;
}

export interface PropertyFeatureResponse extends ApiResponse<Property> {
  success: boolean;
  property?: Property;
  data?: Property;
  featured?: boolean;
  message?: string;
}

/**
 * Admin Dashboard Response
 */
export interface DashboardStats {
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  totalViews: number;
}

export interface DashboardResponse extends ApiResponse<DashboardStats> {
  success: boolean;
  stats?: DashboardStats;
  data?: DashboardStats;
  message?: string;
}

/**
 * Paginated Response Helper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  success: boolean;
  data?: T[];
  items?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  message?: string;
}

/**
 * Admin List Response
 */
export interface AdminsListResponse extends ApiResponse<AdminData[]> {
  success: boolean;
  admins?: AdminData[];
  data?: AdminData[];
  message?: string;
}
