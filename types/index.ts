export interface IPData {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  isp: string;
  asn: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

export interface APIError {
  message: string;
  code?: string;
}

export type LookupResult =
  | { success: true; data: IPData }
  | { success: false; error: string };

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
