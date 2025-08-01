import {
  Location,
  LocationFilters,
  InsertLocation,
  LocationsResponse,
} from "@/types/types";
import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";

class LocationServices {
  constructor() {}

  async getLocations(page: number, limit: number, filters?: LocationFilters) {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${apiUrlConstants.locations}/search?${queryString}`
      : `${apiUrlConstants.locations}/search`;

    return await http.get<LocationsResponse>(url, {
      params: {
        page,
        limit,
      },
    });
  }

  async getLocationById(id: string) {
    return await http.get<LocationsResponse>(
      `${apiUrlConstants.locations}/${id}`
    );
  }

  async addLocation(location: InsertLocation) {
    return await http.post<Location>(apiUrlConstants.locations, location);
  }

  async updateLocation(id: string, location: InsertLocation) {
    return await http.put<Location>(
      `${apiUrlConstants.locations}/${id}`,
      location
    );
  }

  async deleteLocation(id: string) {
    return await http.delete(`${apiUrlConstants.locations}/${id}`);
  }
}

export default new LocationServices();
