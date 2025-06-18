import { SubActivity } from "@/types/types";
import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";

class SubActivityServices {
  constructor() {}

  async addSubActivity(id: string, subActivity: SubActivity) {
    return await http.post(apiUrlConstants.subActivities, {
      ...subActivity,
      activity: id,
    });
  }

  async getSubActivityById(id: string) {
    return await http.get(`${apiUrlConstants.subActivities}/${id}`);
  }
  async getSubActivityByActivityId(id: string) {
    return await http.get(`${apiUrlConstants.subActivities}/by-activity/${id}`);
  }
}
export default new SubActivityServices();
