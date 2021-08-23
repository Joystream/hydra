export declare class EncodingService {
    JSON_MARKER: string;
    encode64(str: string): string;
    encode(input: object): string;
    decode64(str: string): string;
    decode<T>(str: string): T;
}
