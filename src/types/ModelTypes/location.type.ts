export interface ILocation {
  country: string;
  countryAr: string;
  area: string;
  areaAr: string;
  city?: string;
  cityAr?: string;
  village?: string;
  villageAr?: string;
  isActive: boolean;
}

export interface ILocationPrice {
  location: string;
  cost: number;
}
