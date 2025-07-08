import axios, { AxiosInstance } from 'axios';
import { deflate, inflate } from 'pako';
import { TimeTable } from './TimeTable';
import { AuthenticationError, IncompatiblePlan, NetworkError } from './errors';

interface DSBRequestData {
  UserId: string;
  UserPw: string;
  AppVersion: string;
  Language: string;
  OsVersion: string;
  AppId: string;
  Device: string;
  BundleId: string;
  Date: string;
  LastUpdate: string;
}

interface DSBResponse {
  d: string;
}

interface DSBResultData {
  Resultcode: number;
  ResultStatusInfo: string;
  ResultMenuItems: Array<{
    Childs: Array<{
      Root: {
        Childs: Array<{
          Childs: Array<{
            Detail: string;
          }>;
          Title: string;
        }>;
      };
    }>;
  }>;
}

export class DSBClient {
  private requester: AxiosInstance;
  private username: string;
  private password: string;
  private appId: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    // Generate a unique UUID for this app instance
    this.appId = this.generateUUID();
    
    this.requester = axios.create({
      baseURL: 'https://app.dsbcontrol.de',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DSBMobile/35 (Android)',
        'Accept': 'application/json, text/plain, */*',
      },
    });

    // Add response interceptor for error handling
    this.requester.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          throw new NetworkError(error.message);
        }
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new AuthenticationError();
        }
        throw error;
      }
    );
  }

  private generateUUID(): string {
    // Generate a v4 UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private compressAndEncode(data: string): string {
    try {
      // Convert string to Uint8Array
      const uint8Array = new TextEncoder().encode(data);
      // Compress with deflate using pako (GZIP format)
      const compressed = deflate(uint8Array);
      // Convert to base64
      return this.uint8ArrayToBase64(compressed);
    } catch (error) {
      console.error('Compression error:', error);
      throw new NetworkError('Failed to compress request data');
    }
  }

  private decodeAndDecompress(data: string): string {
    try {
      // Decode from base64
      const compressed = this.base64ToUint8Array(data);
      // Decompress with GZIP using pako
      const decompressed = inflate(compressed);
      // Convert back to string
      return new TextDecoder().decode(decompressed);
    } catch (error) {
      console.error('Decompression error:', error);
      throw new NetworkError('Failed to decompress response data');
    }
  }

  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  public async getTimetable(): Promise<TimeTable> {
    try {
      // Prepare the request data
      const now = new Date().toISOString();
      const requestData: DSBRequestData = {
        UserId: this.username,
        UserPw: this.password,
        AppVersion: "35", // DSBMobile version
        Language: "de",
        OsVersion: "33 Android 13", // Android API Level 33
        AppId: this.appId,
        Device: "SM-G991B", // Samsung Galaxy S21 (common device)
        BundleId: "de.heinekingmedia.dsbmobile",
        Date: now,
        LastUpdate: now
      };

      // Convert to JSON string, compress and encode
      const jsonString = JSON.stringify(requestData);
      const compressedData = this.compressAndEncode(jsonString);

      // Prepare the API request
      const apiRequest = {
        req: {
          Data: compressedData,
          DataType: 1 // GetData request type
        }
      };

      console.log('Sending DSB API request...');
      const response = await this.requester.post('/JsonHandler.ashx/GetData', apiRequest);

      if (!response.data || !response.data.d) {
        throw new AuthenticationError();
      }

      // Decode and decompress the response
      const responseData: DSBResponse = response.data;
      const decompressedResponse = this.decodeAndDecompress(responseData.d);
      const resultData: DSBResultData = JSON.parse(decompressedResponse);

      // Check for errors in the response
      if (resultData.Resultcode !== 0) {
        console.error('DSB API Error:', resultData.ResultStatusInfo);
        if (resultData.ResultStatusInfo.toLowerCase().includes('password') || 
            resultData.ResultStatusInfo.toLowerCase().includes('user') ||
            resultData.ResultStatusInfo.toLowerCase().includes('login')) {
          throw new AuthenticationError();
        }
        throw new NetworkError(resultData.ResultStatusInfo);
      }

      // Extract timetable URLs
      if (!resultData.ResultMenuItems || 
          !resultData.ResultMenuItems[0] || 
          !resultData.ResultMenuItems[0].Childs || 
          !resultData.ResultMenuItems[0].Childs[0] ||
          !resultData.ResultMenuItems[0].Childs[0].Root ||
          !resultData.ResultMenuItems[0].Childs[0].Root.Childs) {
        throw new IncompatiblePlan();
      }

      const plans = resultData.ResultMenuItems[0].Childs[0].Root.Childs;
      
      if (plans.length === 0) {
        throw new IncompatiblePlan();
      }

      // Get the first available plan (you could iterate through all plans if needed)
      const firstPlan = plans[0];
      if (!firstPlan.Childs || !firstPlan.Childs[0] || !firstPlan.Childs[0].Detail) {
        throw new IncompatiblePlan();
      }

      const timetableUrl = firstPlan.Childs[0].Detail;
      console.log('Fetching timetable from:', firstPlan.Title, 'URL:', timetableUrl);

      // Fetch the HTML content from the timetable URL
      const htmlResponse = await this.requester.get(timetableUrl);

      try {
        return TimeTable.fromHtml(htmlResponse.data);
      } catch (error) {
        console.error('Failed to parse timetable HTML:', error);
        throw new IncompatiblePlan();
      }

    } catch (error) {
      console.error('Failed to get timetable:', error);
      
      if (error instanceof AuthenticationError || 
          error instanceof IncompatiblePlan || 
          error instanceof NetworkError) {
        throw error;
      }
      
      throw new NetworkError('Failed to fetch timetable data');
    }
  }

  // Method to test authentication without fetching full timetable
  public async testAuthentication(): Promise<boolean> {
    try {
      await this.getTimetable();
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return false;
      }
      // Other errors might not be authentication related
      throw error;
    }
  }

  // Method to check if client has valid credentials
  public isAuthenticated(): boolean {
    return !!(this.username && this.password);
  }

  // Method to clear credentials (for logout)
  public clearCredentials(): void {
    this.username = '';
    this.password = '';
  }
}
