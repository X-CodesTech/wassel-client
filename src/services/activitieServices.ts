import { apiUrlConstants } from "./apiUrlConstants";
import http from "./http";

class ActivitieServices {
  constructor() {}

  async getActivities() {
    return await http.get(apiUrlConstants.activities);
  }
}
export default new ActivitieServices();
