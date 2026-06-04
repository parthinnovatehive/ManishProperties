/**
 * Property Service
 * Handles all property-related API calls
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import {
  PropertiesListResponse,
  PropertyDetailResponse,
  PropertyCreateResponse,
  PropertyUpdateResponse,
  PropertyDeleteResponse,
  PropertyApproveResponse,
  PropertyRejectResponse,
  PropertyFeatureResponse,
} from "@/types/api";
import { Property } from "@/types/property";

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&auto=format&q=75";

function firstImage(images?: string[] | null): string | null {
  return Array.isArray(images) && images.length > 0 ? images[0] : null;
}

function normalizeAdminProperty(property: Property): Property {
  const image =
    property.img ||
    property.image ||
    firstImage(property.imgs) ||
    firstImage(property.images) ||
    FALLBACK_PROPERTY_IMAGE;

  const bathrooms = property.bathrooms ?? property.baths ?? 0;

  return {
    ...property,
    title: property.title || "Untitled property",
    subtitle: property.subtitle ?? null,
    description: property.description ?? "",
    price: property.price || "Price on request",
    priceNum: Number(property.priceNum ?? 0),
    city: property.city || "",
    location: property.location || property.city || "Unspecified location",
    type: property.type || "Property",
    beds: Number(property.beds ?? property.bedrooms ?? 0),
    baths: bathrooms,
    bathrooms,
    area: Number(property.area ?? 0),
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    image,
    img: image,
    images: Array.isArray(property.images) ? property.images : [image],
    rating: Number(property.rating ?? 0),
    reviews: Number(property.reviews ?? 0),
    featured: Boolean(property.featured),
    isNew: Boolean(property.isNew),
    status: property.status || "PENDING",
    submittedBy: property.submittedBy || "Unassigned",
    submitterEmail: property.submitterEmail || "Not available",
    views: Number(property.views ?? 0),
    inquiries: Number(property.inquiries ?? 0),
    rejectReason: property.rejectReason ?? null,
  };
}

export class PropertyService {
  /**
   * Get all properties (admin view)
   */
  async getAdminProperties(): Promise<Property[]> {
    const response = await apiClient.get<PropertiesListResponse>(
      API_ENDPOINTS.ADMIN.PROPERTIES
    );

    return ((response.properties || response.data || []) as Property[]).map(
      normalizeAdminProperty
    );
  }

  /**
   * Get property details
   */
  async getPropertyDetail(id: string | number): Promise<Property> {
    const response = await apiClient.get<PropertyDetailResponse>(
      `${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}`
    );

    const property = (response.property || response.data) as Property;
    if (!property) {
      throw new Error("Property not found");
    }

    return normalizeAdminProperty(property);
  }

  /**
   * Create new property
   */
  async createProperty(data: Partial<Property>): Promise<Property> {
    const response = await apiClient.post<PropertyCreateResponse>(
      API_ENDPOINTS.ADMIN.PROPERTIES_CREATE,
      data
    );

    const property = (response.property || response.data) as Property;
    if (!property) {
      throw new Error("Failed to create property");
    }

    return normalizeAdminProperty(property);
  }

  /**
   * Update property
   */
  async updateProperty(
    id: string | number,
    data: Partial<Property>
  ): Promise<Property> {
    const response = await apiClient.patch<PropertyUpdateResponse>(
      `${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}`,
      data
    );

    const property = (response.property || response.data) as Property;
    if (!property) {
      throw new Error("Failed to update property");
    }

    return normalizeAdminProperty(property);
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string | number): Promise<void> {
    await apiClient.delete<PropertyDeleteResponse>(
      `${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}`
    );
  }

  /**
   * Approve property
   */
  async approveProperty(id: string | number): Promise<Property> {
    const response = await apiClient.patch<PropertyApproveResponse>(
      `${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}/approve`,
      {}
    );

    const property = (response.property || response.data) as Property;
    if (!property) {
      throw new Error("Failed to approve property");
    }

    return normalizeAdminProperty(property);
  }

  /**
   * Reject property
   */
  async rejectProperty(id: string | number, reason?: string): Promise<Property> {
    const response = await apiClient.patch<PropertyRejectResponse>(
      `${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}/reject`,
      { reason }
    );

    const property = (response.property || response.data) as Property;
    if (!property) {
      throw new Error("Failed to reject property");
    }

    return normalizeAdminProperty(property);
  }

  /**
   * Toggle property featured status
   */
  async featureProperty(
    id: string | number,
    featured: boolean
  ): Promise<Property> {
    const response = await apiClient.patch<PropertyFeatureResponse>(
      `${API_ENDPOINTS.ADMIN.PROPERTIES}/${id}/feature`,
      { featured }
    );

    const property = (response.property || response.data) as Property;
    if (!property) {
      throw new Error("Failed to update property featured status");
    }

    return normalizeAdminProperty(property);
  }
}

/**
 * Singleton instance
 */
export const propertyService = new PropertyService();
