import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import type { Property } from "@/types/property";

type ApiListResponse<T> = {
  success: boolean;
  data?: T[];
  [key: string]: unknown;
};

type ApiItemResponse<T> = {
  success: boolean;
  data?: T;
  [key: string]: unknown;
};

function listFrom<T>(response: ApiListResponse<T>, key: string): T[] {
  return ((response[key] as T[] | undefined) || response.data || []) as T[];
}

function itemFrom<T>(response: ApiItemResponse<T>, key: string): T {
  const item = (response[key] as T | undefined) || response.data;
  if (!item) throw new Error("API response did not include expected data");
  return item;
}

export const estateApi = {
  properties: {
    list: async () => listFrom<Property>(await apiClient.get(API_ENDPOINTS.PUBLIC.PROPERTIES), "properties"),
    featured: async () => listFrom<Property>(await apiClient.get(API_ENDPOINTS.PUBLIC.FEATURED_PROPERTIES), "properties"),
    detail: async (id: string | number) => itemFrom<Property>(await apiClient.get(API_ENDPOINTS.PUBLIC.PROPERTIES_DETAIL(String(id))), "property"),
    submit: async (payload: Partial<Property>) => itemFrom<Property>(await apiClient.post(API_ENDPOINTS.PUBLIC.PROPERTIES_SUBMIT, payload), "property"),
  },
  adminProperties: {
    list: async () => listFrom<Property>(await apiClient.get(API_ENDPOINTS.ADMIN.PROPERTIES), "properties"),
    create: async (payload: Partial<Property>) => itemFrom<Property>(await apiClient.post(API_ENDPOINTS.ADMIN.PROPERTIES_CREATE, payload), "property"),
    update: async (id: string | number, payload: Partial<Property>) => itemFrom<Property>(await apiClient.patch(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}`, payload), "property"),
    remove: async (id: string | number) => apiClient.delete(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}`),
    approve: async (id: string | number) => itemFrom<Property>(await apiClient.patch(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}/approve`, {}), "property"),
    reject: async (id: string | number, reason?: string) => itemFrom<Property>(await apiClient.patch(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}/reject`, { reason }), "property"),
    feature: async (id: string | number, featured: boolean) => itemFrom<Property>(await apiClient.patch(`${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}/feature`, { featured }), "property"),
  },
  users: {
    list: async <T = unknown>() => listFrom<T>(await apiClient.get(API_ENDPOINTS.USERS), "users"),
    create: async <T = unknown>(payload: T) => itemFrom<T>(await apiClient.post(API_ENDPOINTS.USERS, payload), "user"),
    update: async <T = unknown>(id: string | number, payload: Partial<T>) => itemFrom<T>(await apiClient.patch(`${API_ENDPOINTS.USERS}/${id}`, payload), "user"),
    remove: async (id: string | number) => apiClient.delete(`${API_ENDPOINTS.USERS}/${id}`),
  },
  agents: {
    list: async <T = unknown>() => listFrom<T>(await apiClient.get(API_ENDPOINTS.AGENTS), "agents"),
    dashboard: async <T = unknown>() => itemFrom<T>(await apiClient.get(`${API_ENDPOINTS.AGENTS}/dashboard`), "data"),
    leads: async <T = unknown>() => listFrom<T>(await apiClient.get(`${API_ENDPOINTS.AGENTS}/leads`), "leads"),
    lead: async <T = unknown>(id: string | number) => itemFrom<T>(await apiClient.get(`${API_ENDPOINTS.AGENTS}/leads/${id}`), "lead"),
    createLead: async <T = unknown>(payload: T) => itemFrom<T>(await apiClient.post(`${API_ENDPOINTS.AGENTS}/leads`, payload), "lead"),
    updateLead: async <T = unknown>(id: string | number, payload: Partial<T>) => itemFrom<T>(await apiClient.patch(`${API_ENDPOINTS.AGENTS}/leads/${id}`, payload), "lead"),
    removeLead: async (id: string | number) => apiClient.delete(`${API_ENDPOINTS.AGENTS}/leads/${id}`),
    update: async <T = unknown>(id: string | number, payload: Partial<T>) => itemFrom<T>(await apiClient.patch(`${API_ENDPOINTS.AGENTS}/${id}`, payload), "agent"),
  },
  admins: {
    list: async <T = unknown>() => listFrom<T>(await apiClient.get(API_ENDPOINTS.ADMINS), "admins"),
    create: async <T = unknown>(payload: T) => itemFrom<T>(await apiClient.post(API_ENDPOINTS.ADMINS, payload), "admin"),
    update: async <T = unknown>(id: string | number, payload: Partial<T>) => itemFrom<T>(await apiClient.patch(`${API_ENDPOINTS.ADMINS}/${id}`, payload), "admin"),
  },
  superAdmin: {
    dashboard: async <T = unknown>() => itemFrom<T>(await apiClient.get(`${API_ENDPOINTS.SUPER_ADMIN}/dashboard`), "data"),
    settings: async <T = unknown>() => itemFrom<T>(await apiClient.get(`${API_ENDPOINTS.SUPER_ADMIN}/settings`), "data"),
    monitoring: async <T = unknown>() => itemFrom<T>(await apiClient.get(`${API_ENDPOINTS.SUPER_ADMIN}/monitoring`), "data"),
  },
  appointments: {
    list: async <T = unknown>() => listFrom<T>(await apiClient.get(API_ENDPOINTS.APPOINTMENTS), "appointments"),
    create: async <T = unknown>(payload: T) => itemFrom<T>(await apiClient.post(API_ENDPOINTS.APPOINTMENTS, payload), "appointment"),
    update: async <T = unknown>(id: string | number, payload: Partial<T>) => itemFrom<T>(await apiClient.patch(`${API_ENDPOINTS.APPOINTMENTS}/${id}`, payload), "appointment"),
    remove: async (id: string | number) => apiClient.delete(`${API_ENDPOINTS.APPOINTMENTS}/${id}`),
  },
  complaints: {
    list: async <T = unknown>() => listFrom<T>(await apiClient.get(API_ENDPOINTS.COMPLAINTS), "complaints"),
    create: async <T = unknown>(payload: T) => itemFrom<T>(await apiClient.post(API_ENDPOINTS.COMPLAINTS, payload), "complaint"),
    update: async <T = unknown>(id: string | number, payload: Partial<T>) => itemFrom<T>(await apiClient.patch(`${API_ENDPOINTS.COMPLAINTS}/${id}`, payload), "complaint"),
    remove: async (id: string | number) => apiClient.delete(`${API_ENDPOINTS.COMPLAINTS}/${id}`),
  },
  messages: {
    list: async <T = unknown>() => listFrom<T>(await apiClient.get(API_ENDPOINTS.MESSAGES), "messages"),
    create: async <T = unknown>(payload: T) => itemFrom<T>(await apiClient.post(API_ENDPOINTS.MESSAGES, payload), "data"),
    update: async <T = unknown>(id: string | number, payload: Partial<T>) => itemFrom<T>(await apiClient.patch(`${API_ENDPOINTS.MESSAGES}/${id}`, payload), "data"),
  },
  content: {
    cities: async <T = unknown>() => listFrom<T>(await apiClient.get(API_ENDPOINTS.PUBLIC.CITIES), "cities"),
    testimonials: async <T = unknown>() => listFrom<T>(await apiClient.get(API_ENDPOINTS.PUBLIC.TESTIMONIALS), "testimonials"),
    categories: async <T = unknown>() => itemFrom<T>(await apiClient.get(API_ENDPOINTS.PUBLIC.CATEGORIES), "data"),
  },
};
