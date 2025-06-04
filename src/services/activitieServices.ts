import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";

class ActivitieServices {
  constructor() {}

  async getActivities() {
    return await http.get(apiUrlConstants.activities);
  }
  async addActivity() {
    return await http.post(apiUrlConstants.activities);
  }
  async getActivityById(id: string) {
    return await http.get(`${apiUrlConstants.activities}/${id}`);
  }
  async updateActivity(id: string) {
    return await http.put(`${apiUrlConstants.activities}/${id}`);
  }
  async deleteActivity(id: string) {
    return await http.delete(`${apiUrlConstants.activities}/${id}`);
  }
}
export default new ActivitieServices();
