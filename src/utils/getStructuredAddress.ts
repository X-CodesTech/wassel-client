import { Location } from "@/types/types";

export const getStructuredAddress = (address: Location) => {
  return {
    ar: `${address.countryAr}, ${address.areaAr}, ${address.cityAr}, ${address.villageAr}`,
    en: `${address.country}, ${address.area}, ${address.city}, ${address.village}`,
  };
};
