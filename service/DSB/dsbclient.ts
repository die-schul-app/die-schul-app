import axios, {AxiosInstance} from 'axios';
import {gzip, ungzip} from 'pako';
import {TimeTable} from '@/service/DSB/timetable';
import {AuthenticationError, IncompatiblePlan, NetworkError} from '@/service/DSB/errors';
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

    public async getTimetable(date: string): Promise<TimeTable> {
        const storedData = await AsyncStorage.getItem(`dsb_plan_${date}`);
        if (storedData) {
            return TimeTable.fromJson(storedData);
        } else {
            return new TimeTable(date, [], new Date());
        }
    }

    public async fetchTimetables(): Promise<void> {
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

        const jsonString = JSON.stringify(requestData);
        const compressedData = this.compressAndEncode(jsonString);
        const apiRequest = {req: {Data: compressedData, DataType: 1}};
        const response = await this.requester.post('/JsonHandler.ashx/GetData', apiRequest);

        if (!response.data || !response.data.d) {
            throw new Error('No response from DSB API - Response data: ' + JSON.stringify(response.data));
        }

        const responseData: DSBResponse = response.data;
        const decompressedResponse = this.decodeAndDecompress(responseData.d);
        const resultData: DSBResultData = JSON.parse(decompressedResponse);

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
                const timetable = TimeTable.fromHtml(htmlResponse.data);
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

    public isAuthenticated(): boolean {
        return !!(this.username && this.password);
    }

    public clearCredentials(): void {
        this.username = '';
        this.password = '';
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private compressAndEncode(data: string): string {
        try {
            const uint8Array = new TextEncoder().encode(data);
            const compressed = gzip(uint8Array);
            return this.uint8ArrayToBase64(compressed);
        } catch (error) {
            console.error('Compression error:', error);
            throw new NetworkError('Failed to compress request data');
        }
    }

    private decodeAndDecompress(data: string): string {
        try {
            const compressed = this.base64ToUint8Array(data);
            const decompressed = ungzip(compressed);
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
