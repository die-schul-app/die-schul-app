import axios, { AxiosInstance } from 'axios';
import { TimeTable } from './TimeTable';
import { AuthenticationError, IncompatiblePlan, MissingToken, NetworkError } from './errors';

export class DSBClient {
  private requester: AxiosInstance;
  private token?: string;
  private id: string;
  private password: string;
  private resourceBaseURL: string;

  constructor(username: string, password: string) {
    this.id = username;
    this.password = password;
    this.resourceBaseURL = 'https://light.dsbcontrol.de';
    
    this.requester = axios.create({
      baseURL: 'https://light.dsbcontrol.de',
      timeout: 10000,
      headers: {
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

  private async checkToken(): Promise<void> {
    if (this.token === undefined) {
      await this.fetchToken();
      if (this.token === undefined) {
        throw new MissingToken();
      }
    }
  }

  public async fetchToken(): Promise<void> {
    try {
      const res = await this.requester.get(
        "/authid?bundleid=de.heinekingmedia.dsbmobile&appversion=35&osversion=22&pushid" +
        `&user=${encodeURIComponent(this.id)}&password=${encodeURIComponent(this.password)}`
      );

      if (!res.data || res.data.trim().length === 0) {
        throw new AuthenticationError();
      }

      this.token = res.data;
    } catch (error) {
      console.error('Failed to fetch DSB token:', error);
      if (error instanceof AuthenticationError || error instanceof NetworkError) {
        throw error;
      }
      throw new AuthenticationError();
    }
  }

  public async getTimetable(): Promise<TimeTable> {
    await this.checkToken();
    
    try {
      let resp = await this.requester.get(
        `/dsbtimetables?authid=${this.token}`
      );

      if (!resp.data || !Array.isArray(resp.data) || resp.data.length === 0) {
        throw new IncompatiblePlan();
      }

      // Navigate to the timetable data
      const firstItem = resp.data[0];
      if (!firstItem?.Childs?.[0]?.Detail) {
        throw new IncompatiblePlan();
      }

      let resURL: string = firstItem.Childs[0].Detail;
      resURL = resURL.replace(
        "https://light.dsbcontrol.de",
        this.resourceBaseURL
      );

      resp = await this.requester.get(resURL);

      try {
        return TimeTable.fromHtml(resp.data);
      } catch (error) {
        console.error('Failed to parse timetable HTML:', error);
        throw new IncompatiblePlan();
      }
    } catch (error) {
      console.error('Failed to get timetable:', error);
      if (error instanceof IncompatiblePlan || error instanceof NetworkError) {
        throw error;
      }
      throw new NetworkError('Failed to fetch timetable data');
    }
  }

  // Method to clear token (for logout or re-authentication)
  public clearToken(): void {
    this.token = undefined;
  }

  // Method to check if client is authenticated
  public isAuthenticated(): boolean {
    return this.token !== undefined;
  }
}
