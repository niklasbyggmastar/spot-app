import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { environment } from 'src/environments/environment';
import { Spot } from '../models/Spot';
import { Router } from '@angular/router';
import { NgxImageCompressService } from 'ngx-image-compress';

@Injectable({
    providedIn: "root"
})
export class CommonService {

    currentLocation = {
        latitude: "",
        longitude: ""
    };
    locationChanged = false;
    updateThreshold: number = 900000; // 15 minutes (in ms)
    errorMessage = null;
    numberOfDecimalsInCoordinates = 3;
    debug = {
        isVisible: false,
        oldPosition: null,
        lastUpdated: null,
        timeDifference: null,
        isMoreThanThreshold: false
    }

    constructor(private http: HttpClient, private geo: Geolocation, public router: Router, private compressor: NgxImageCompressService) { }

    async getCurrentLocation() {
        return this.geo.getCurrentPosition().then(res => {
            if (res && res.coords) {

                // The real current location
                this.currentLocation.latitude = res.coords.latitude.toFixed(this.numberOfDecimalsInCoordinates).toString();
                this.currentLocation.longitude = res.coords.longitude.toFixed(this.numberOfDecimalsInCoordinates).toString();
                
                // The previously got location
                const oldPosition = JSON.parse(localStorage.getItem("currentLocation"));
                const lastUpdated = parseInt(localStorage.getItem("locationUpdated"));
                this.debug = {
                    isVisible: this.debug.isVisible,
                    oldPosition: oldPosition,
                    lastUpdated: new Date(lastUpdated).toLocaleString(),
                    timeDifference: Date.now()-lastUpdated,
                    isMoreThanThreshold: Date.now()-lastUpdated > this.updateThreshold
                };

                console.log(this.debug);

                // If not the first time, so a previous position has been saved
                // Set new location only if the position differs from the old location or 60 min has passed
                if (Date.now()-lastUpdated > this.updateThreshold ||
                    (oldPosition == null || 
                    (oldPosition != null && (oldPosition.latitude != this.currentLocation.latitude || oldPosition.longitude != this.currentLocation.longitude)))) 
                {
                    this.setNewLocation();
                }
            }
        }).catch(err => {
            this.handleErrorState(err);
        });
    }

    async getSpotList(): Promise<Array<Spot>> {
        return this.http.get(`${environment.apiUrl}/all-spots`).toPromise().then((res: Array<Spot>) => {
            console.log(res);
            return res;
        }).catch(err => {
            this.handleErrorState(err);
            return null;
        });
    }

    async getSpot(rowKey: string): Promise<Spot> {
        return this.http.post(`${environment.apiUrl}/spot`, {data: rowKey}).toPromise().then((res: Spot) => {
            return res;
        }).catch(err => {
            this.handleErrorState(err);
            return null;
        })
    }

    setNewLocation() {
        console.log("SET NEW LOCATION");
        localStorage.setItem("currentLocation", JSON.stringify(this.currentLocation));
        localStorage.setItem("locationUpdated", Date.now().toString());
        this.locationChanged = true;
    }
    
    handleErrorState(message: string): any{
        console.warn(message);
        alert(message);
        if (message != typeof(String)) {
            this.errorMessage = `Could not connect to the API: ${environment.apiUrl}. Check your internet connection and make sure the API is running.`;
            return;
        }
        this.errorMessage = message;
    }

    async getDistanceToSpot(allSpots: Array<Spot>, i: any): Promise<Array<Spot>> {
        const data = [
            {
                Latitude: this.currentLocation.latitude,
                Longitude: this.currentLocation.longitude
            },
            {
                Latitude: allSpots[i]?.lat,
                Longitude: allSpots[i]?.lon
            }
        ];

        return this.http.post(`${environment.apiUrl}/distance`, data).toPromise().then((res:any) => {
            const distance = (res.rows[0].elements[0].distance.value/1000).toFixed(1);
            const duration = res.rows[0].elements[0].duration.text;
            console.log(distance, duration);
            allSpots[i].distance = parseFloat(distance);
            allSpots[i].duration = duration;
            allSpots[i].isLoading = false;
            return allSpots;
        }).catch(err => {
            this.handleErrorState(err);
            return allSpots;
        })
    }

    async getDistanceToSpot2(spot: Spot): Promise<Spot> {
        const data = [
            {
                Latitude: this.currentLocation.latitude,
                Longitude: this.currentLocation.longitude
            },
            {
                Latitude: spot?.lat,
                Longitude: spot?.lon
            }
        ];

        return this.http.post(`${environment.apiUrl}/distance`, data).toPromise().then((res:any) => {
            console.log(res);
            const distance = (res.rows[0].elements[0].distance.value/1000).toFixed(1);
            const duration = res.rows[0].elements[0].duration.text;
            console.log(distance, duration);
            spot.distance = parseFloat(distance);
            spot.duration = duration;
            spot.isLoading = false;
            return spot;
        }).catch(err => {
            this.handleErrorState(err);
            return null;
        })
    }

    async uploadImage(spot: Spot, image): Promise<Spot> {
        console.log(image);
        const compressedImage = await this.compressImage(image);
        console.log(compressedImage);
        return this.http.post(`${environment.apiUrl}/add-image`, { data: compressedImage, name: `${spot.rowKey}-${Date.now().toString()}` }).toPromise().then((res: any) => {
            console.log(res);
            if (res && res.result) {
                console.log(spot.imgUrls);
                const existingImages: Array<string> = spot.imgUrls ? JSON.parse(spot.imgUrls) : [];
                existingImages.push(res.result);
                spot.imgUrls = JSON.stringify(existingImages);
                console.log(spot);
                return spot;
            }
        }).catch(err => {
            this.handleErrorState(err);
            return null;
        })
	}

    async compressImage(image): Promise<string> {
        return this.compressor.compressFile(image, -1, 50, 50).then(res => {
            return res;
        }).catch(err => {
            this.handleErrorState(err);
            return null;
        })
    }

}
