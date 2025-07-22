import { SubActivity, SubActivityResponse } from "@/types/types";
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

  async getSubActivityByActivityId(id: string) {
    return await http.get(`${apiUrlConstants.subActivities}/by-activity/${id}`);
  }

  async getSubActivityById(id: string) {
    return await http.get(`${apiUrlConstants.subActivities}/${id}`);
  }

  async updateSubActivity(id: string, subActivity: SubActivity) {
    return await http.put(
      `${apiUrlConstants.subActivities}/${id}`,
      subActivity
    );
  }

  async deleteSubActivity(id: string) {
    return await http.delete(`${apiUrlConstants.subActivities}/${id}`);
  }

  async getSubActivityByPricingMethod(
    pricingMethods: "perLocation" | "perTrip" | "perItem"
  ) {
    return await http.get<SubActivityResponse>(
      `${apiUrlConstants.subActivities}/by-pricing-method`,
      {
        params: {
          pricingMethods,
        },
      }
    );
  }
}
export default new SubActivityServices();
