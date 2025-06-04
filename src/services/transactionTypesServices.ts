import { TransactionType } from "@/types/types";
import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";

class transactionTypesServices {
  constructor() {}

  async addTransactionType(name: string) {
    return await http.post<{
      success: true;
      data: TransactionType;
    }>(apiUrlConstants.transactionTypes, {
      name,
    });
  }

  async getTransactionTypes() {
    return await http.get<{
      success: true;
      data: TransactionType[];
    }>(apiUrlConstants.transactionTypes);
  }

  async deleteTransactionType(id: string) {
    return await http.delete(`${apiUrlConstants.transactionTypes}/${id}`);
  }

  async updateTransactionType(id: string, name: string) {
    return await http.put<{
      success: true;
      data: TransactionType;
    }>(`${apiUrlConstants.transactionTypes}/${id}`, {
      name,
    });
  }

  async getTransactionTypeById(id: string) {
    return await http.get(`${apiUrlConstants.transactionTypes}/${id}`);
  }
}

export default new transactionTypesServices();
