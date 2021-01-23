export class Spot {
    RowKey: string;
    name: string;
    type: string;
    lat: string;
    lon: string;
    description?: string;
    imgUrls?: string;
    distance?: number;
    isLoading?: boolean = true;
}