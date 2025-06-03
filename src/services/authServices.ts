import { Axios } from "axios";
import { type AxiosResponse } from "axios";

class authServies {
  constructor() {}

  requestSimulator(params?: any): Promise<AxiosResponse<any>> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(params);
      }, 1000);
    });
  }

  async login({ email, password }: { email: string; password: string }) {
    return await this.requestSimulator({ email, password });
  }
  async logout() {
    return await this.requestSimulator();
  }
  async register() {
    return await this.requestSimulator();
  }
  async forgotPassword() {
    return await this.requestSimulator();
  }
  async resetPassword() {
    return await this.requestSimulator();
  }
  async changePassword() {
    return await this.requestSimulator();
  }
  async updateProfile() {
    return await this.requestSimulator();
  }
  async getProfile() {
    return await this.requestSimulator();
  }
}

export default new authServies();
