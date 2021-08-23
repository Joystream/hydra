export interface GetResponse {
    statusCode: number;
    body: string;
}
export declare function get(url: string): Promise<GetResponse>;
