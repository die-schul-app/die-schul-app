import axios, {AxiosInstance} from 'axios';
import {gzip, ungzip} from 'pako';
import {TimeTable} from './TimeTable';
import {AuthenticationError, IncompatiblePlan, NetworkError} from './errors';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    ResultMenuItems: {
        Childs: {
            Root: {
                Childs: {
                    Childs: {
                        Detail: string;
                    }[];
                    Title: string;
                }[];
            };
        }[];
    }[];
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
                'User-Agent': 'DSBMobile/2.5.9 (Android)',
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

    /**
     * Get a timetable for a specific date from local storage.
     * date should be in ISO format (YYYY-MM-DD).
     */
    public async getTimetable(date: string): Promise<TimeTable> {
        const storedData = await AsyncStorage.getItem(`dsb_plan_${date}`);
        if (storedData) {
            const timetableData = JSON.parse(storedData);
            return new TimeTable(timetableData);
        } else {
            throw new Error(`No timetable found for date: ${date}`);
        }
    }

    /**
     * Fetches all available plans, parses them, and saves each plan locally by date.
     * If a plan for a day already exists, it is replaced.
     */
    public async fetchTimetables(): Promise<void> {
        // Prepare the request data
        const now = new Date().toISOString();
        const requestData: DSBRequestData = {
            UserId: this.username,
            UserPw: this.password,
            AppVersion: "2.5.9",
            Language: "de",
            OsVersion: "28 Android 9",
            AppId: this.appId,
            Device: "SM-G950F",
            BundleId: "de.heinekingmedia.dsbmobile",
            Date: now,
            LastUpdate: now
        };

        // Convert to JSON string, compress, encode and send the request
        const jsonString = JSON.stringify(requestData);
        const compressedData = this.compressAndEncode(jsonString);
        const apiRequest = {req: {Data: compressedData, DataType: 1}};
        const response = await this.requester.post('/JsonHandler.ashx/GetData', apiRequest);

        if (!response.data || !response.data.d) {
            throw new Error('No response from DSB API - Response data: ' + JSON.stringify(response.data));
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

        let plans;
        try {
            plans = resultData.ResultMenuItems[0].Childs[0].Root.Childs;
        } catch (_error) {
            throw new IncompatiblePlan();
        }

        if (plans.length === 0) {
            throw new IncompatiblePlan();
        }

        for (const plan of plans) {
            if (!plan.Childs || !plan.Childs[0] || !plan.Childs[0].Detail) continue;
            const timetableUrl = plan.Childs[0].Detail;
            try {
                const htmlResponse = await this.requester.get(timetableUrl);
                const timetable = new TimeTable(htmlResponse.data);
                await AsyncStorage.setItem(
                    `dsb_plan_${timetable.date}`,
                    JSON.stringify(timetable)
                );
                console.log('Stored plan for date:', timetable.date);
            } catch (error) {
                console.error('Failed to parse or fetch plan:', plan.Title, error);
            }
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

    // Generate a v4 UUID
    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private compressAndEncode(data: string): string {
        try {
            // Convert string to Uint8Array
            const uint8Array = new TextEncoder().encode(data);
            // Compress with gzip using pako
            const compressed = gzip(uint8Array);
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
            // Decompress with gzip using pako
            const decompressed = ungzip(compressed);
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
}
