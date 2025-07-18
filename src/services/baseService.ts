import { handleError } from "@/utils/errorHandler";
import http from "./http";

export abstract class BaseService<T> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<T[]> {
    try {
      const { data } = await http.get<T[]>(this.baseUrl);
      return data;
    } catch (error) {
      throw handleError(error);
    }
  }

  async getById(id: string): Promise<T> {
    try {
      const { data } = await http.get<T>(`${this.baseUrl}/${id}`);
      return data;
    } catch (error) {
      throw handleError(error);
    }
  }

  async create(item: Partial<T>): Promise<T> {
    try {
      const { data } = await http.post<T>(this.baseUrl, item);
      return data;
    } catch (error) {
      throw handleError(error);
    }
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    try {
      const { data } = await http.put<T>(`${this.baseUrl}/${id}`, item);
      return data;
    } catch (error) {
      throw handleError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await http.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw handleError(error);
    }
  }
}
