export class Spot {
    RowKey: string;
    PartitionKey?: string = "spot";
    TimeStamp?: Date = new Date(Date.now());
    name: string;
    type: string;
    lat: string;
    lon: string;
    description?: string;
    imgUrls?: string;
    distance?: number = 0;
    duration?: string = "";
    isLoading?: boolean = true;
}