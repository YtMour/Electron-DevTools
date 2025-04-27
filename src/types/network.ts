export interface DNSRecord {
  name: string;
  value: string;
  ttl: number;
}

export interface WhoisData {
  domain_name?: string;
  registrar?: string;
  whois_server?: string;
  referral_url?: string;
  updated_date?: Date;
  creation_date?: Date;
  expiration_date?: Date;
  name_servers?: string[];
  status?: string[];
  emails?: string[];
  dnssec?: string;
  [key: string]: any;
}

export interface IPData {
  address: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  location: {
    lat: number;
    lng: number;
  };
  org?: string;
  isp?: string;
  timezone?: string;
}

export interface PortScanResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: string;
  banner?: string;
}

export interface SubnetCalculationResult {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  cidr: number;
  firstUsableHost: string;
  lastUsableHost: string;
  totalHosts: number;
  usableHosts: number;
  binaryNetworkAddress: string;
  binarySubnetMask: string;
  addressClass: string;
  isPrivate: boolean;
}

export interface MacAddress {
  address: string;
  type: 'global' | 'local' | 'multicast' | 'random';
  vendor?: string;
} 