import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Spot } from '../models/Spot';


@Component({
    selector: 'app-details',
    templateUrl: 'details.page.html',
    styleUrls: ['details.page.scss']
})
export class DetailsPage {

    private title: string = "Spots nearby";
    private currentLocation = {
        latitude: 0,
        longitude: 0
    };
    private allSpots: Array<Spot>;

    constructor(private http: HttpClient, private geo: Geolocation) { }

    async ngOnInit() {
        await this.getCurrentLocationAndSpotList();

        for (let spot of this.allSpots) {
            console.log(spot.name);
            //this.getDistanceToSpot(spot.lat, spot.lon);
        }

        /*this.http.get("https://goo.gl/maps/y6Uke9DGFF6euXD17").toPromise().then((res) => {
            console.log(res);
        })*/
    }

    async getCurrentLocationAndSpotList() {
        this.geo.getCurrentPosition().then(res => {
            console.log(res);
            if (res && res.coords) {
                this.currentLocation.latitude = res.coords.latitude;
                this.currentLocation.longitude = res.coords.longitude;
            }
        }).catch(error => {
            console.warn(error);
        });

        return this.http.get(environment.storageAccountUrl).toPromise().then((res:any) => {
            console.log(res);
            this.allSpots = res.value;
        }).catch(err => {
            console.warn(err);
        });
    }

/*    private getDistanceToSpot(lat: string, lon: string) {
        this.http.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${this.currentLocation.latitude},${this.currentLocation.longitude}&destinations=${lat},${lon}&key=${environment.apiKey}`).toPromise().then((res:any) => {
            console.log(res);
        }).catch(err => {
            console.warn(err);
        })
    }*/

}
