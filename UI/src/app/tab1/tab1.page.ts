import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Spot } from '../models/Spot';
import { Router, NavigationExtras } from '@angular/router';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    private title: string = "Spots nearby";
    private currentLocation = {
        latitude: "",
        longitude: ""
    };
    private allSpots: Array<Spot>;

    constructor(private http: HttpClient, private geo: Geolocation, private router: Router) { }

    async ngOnInit() {
        console.log(environment.apiKey);
        await this.getCurrentLocationAndSpotList();

        for (let spot of this.allSpots) {
            console.log(spot.name);
            this.getDistanceToSpot(spot);
        }

        /*this.http.get("https://goo.gl/maps/y6Uke9DGFF6euXD17").toPromise().then((res) => {
            console.log(res);
        })*/
    }

    async getCurrentLocationAndSpotList() {
        this.geo.getCurrentPosition().then(res => {
            console.log(res);
            if (res && res.coords) {
                this.currentLocation.latitude = res.coords.latitude.toString();
                this.currentLocation.longitude = res.coords.longitude.toString();
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

    public openSpotDetails(id) {
        console.log(id);
        const navExtras: NavigationExtras = {
            state: {
                id: id
            }
        };
        this.router.navigate(['/details'], navExtras);
    }

    private getDistanceToSpot(spot: Spot) {
        console.log(spot.lat, spot.lon);
        const data = [
            {
                Latitude: this.currentLocation.latitude,
                Longitude: this.currentLocation.latitude
            },
            {
                Latitude: spot.lat,
                Longitude: spot.lon
            }
        ];

        this.http.post(`${environment.localApiUrl}/distance`, data).toPromise().then((res:any) => {
            console.log(res);
            const distance = (res.rows[0].elements[0].distance.value/1000).toFixed(2);
            console.log(distance);
            spot.distance = parseFloat(distance);
        }).catch(err => {
            console.warn(err);
        })
    }

}
