export interface TrackerLink {
  id: string;
  user_id: string;
  target_url: string;
  title: string | null;
  created_at: string;
  click_count: number;
}

export interface TrackerClick {
  id: number;
  link_id: string;
  ip: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  region: string | null;
  isp: string | null;
  asn: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  referer: string | null;
  clicked_at: string;
}
