import { Location } from "@/types/types";

export const getStructuredAddress = (address: Location) => {
  return {
    ar: `${address.areaAr}, ${address.cityAr}, ${address.villageAr}`,
    en: `${address.area}, ${address.city}, ${address.village}`,
  };
};
