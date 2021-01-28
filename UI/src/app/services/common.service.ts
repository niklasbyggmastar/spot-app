import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { environment } from 'src/environments/environment';
import { Spot } from '../models/Spot';

@Injectable({
    providedIn: "root"
})
export class CommonService {

    currentLocation = {
        latitude: "",
        longitude: ""
    };
    locationChanged = false;
    errorMessage = null;

    constructor(private http: HttpClient, private geo: Geolocation) { }

    async getCurrentLocation() {
        return this.geo.getCurrentPosition().then(res => {
            if (res && res.coords) {

                // The real current location
                this.currentLocation.latitude = res.coords.latitude.toString();
                this.currentLocation.longitude = res.coords.longitude.toString();
                
                // The previously got location
                const oldPosition = JSON.parse(localStorage.getItem("currentLocation"));
                const lastUpdated = parseInt(localStorage.getItem("locationUpdated"));

                // If not the first time, so a previous position has been saved
                // Set new location only if the position differs from the old location or 60 min has passed
                if (Date.now()-lastUpdated > 3600000 || (oldPosition == null || (oldPosition != null && (oldPosition.latitude != this.currentLocation.latitude || oldPosition.longitude != this.currentLocation.longitude)))) {
                    this.setNewLocation();
                }
            }
        }).catch(err => {
            this.handleErrorState(err);
        });
    }

    setNewLocation() {
        console.log("SET NEW LOCATION");
        localStorage.setItem("currentLocation", JSON.stringify(this.currentLocation));
        localStorage.setItem("locationUpdated", Date.now().toString());
        this.locationChanged = true;
    }
    
    handleErrorState(message: string) {
        console.warn(message);
        this.errorMessage = message;
    }

    async getDistanceToSpot(allSpots: Array<Spot>, i: any): Promise<Array<Spot>> {
        const data = [
            {
                Latitude: this.currentLocation.latitude,
                Longitude: this.currentLocation.longitude
            },
            {
                Latitude: allSpots[i].lat,
                Longitude: allSpots[i].lon
            }
        ];

        return this.http.post(`${environment.apiUrl}/distance`, data).toPromise().then((res:any) => {
            const distance = (res.rows[0].elements[0].distance.value/1000).toFixed(1);
            console.log(distance);
            allSpots[i].distance = parseFloat(distance);
            allSpots[i].isLoading = false;
            return allSpots;
        }).catch(err => {
            this.handleErrorState(err);
            return new Array<Spot>();
        })
    }

}
