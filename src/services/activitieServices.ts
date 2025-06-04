import { Activity } from "@/types/types";
import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";

class ActivitieServices {
  constructor() {}

  async getActivities() {
    return await http.get<Activity[]>(apiUrlConstants.activities);
  }
  async addActivity(activity: Activity) {
    return await http.post<Activity>(apiUrlConstants.activities, activity);
  }
  async getActivityById(id: string) {
    return await http.get(`${apiUrlConstants.activities}/${id}`);
  }
  async updateActivity(id: string, activity: Activity) {
    return await http.put(`${apiUrlConstants.activities}/${id}`, activity);
  }
  async deleteActivity(id: string) {
    return await http.delete(`${apiUrlConstants.activities}/${id}`);
  }
}
export default new ActivitieServices();
