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

    title: string = "Spots nearby";
    currentLocation = {
        latitude: "",
        longitude: ""
    };
    allSpots: Array<Spot> = [];
    isLoading = true;
    errorMessage = null;

    constructor(private http: HttpClient, public geo: Geolocation, private router: Router) { }

    async ngOnInit() {
        await this.getCurrentLocation();
        this.isLoading = false;

        await this.getSpotList();
        

        for (let spot of this.allSpots) {
            console.log(spot.name);
            await this.getDistanceToSpot(spot);
            spot.isLoading = false;
        }

        this.allSpots.sort((a, b) => a.distance - b.distance);
        

        /*this.http.get("https://goo.gl/maps/y6Uke9DGFF6euXD17").toPromise().then((res) => {
            console.log(res);
        })*/
    }

    async getCurrentLocation() {
        return this.geo.getCurrentPosition().then(res => {
            console.log(res);
            if (res && res.coords) {
                this.currentLocation.latitude = res.coords.latitude.toString();
                this.currentLocation.longitude = res.coords.longitude.toString();
            }
        }).catch(err => {
            this.handleErrorState(err);
        });
    }

    async getSpotList() {
        return this.http.get(environment.storageAccountUrl).toPromise().then((res:any) => {
            console.log(res);
            this.allSpots = res.value;
        }).catch(err => {
            this.handleErrorState(err);
        });
    }

    openSpotDetails(id) {
        console.log(id);
        const navExtras: NavigationExtras = {
            state: {
                id: id
            }
        };
        this.router.navigate(['/details', id]);
    }

    private async getDistanceToSpot(spot: Spot) {
        console.log(this.currentLocation);
        console.log(spot.lat, spot.lon);
        const data = [
            {
                Latitude: this.currentLocation.latitude,
                Longitude: this.currentLocation.longitude
            },
            {
                Latitude: spot.lat,
                Longitude: spot.lon
            }
        ];

        return this.http.post(`${environment.apiUrl}/distance`, data).toPromise().then((res:any) => {
            console.log(res);
            const distance = (res.rows[0].elements[0].distance.value/1000).toFixed(2);
            console.log(distance);
            spot.distance = parseFloat(distance);
        }).catch(err => {
            this.handleErrorState(err);
        })
    }

    private handleErrorState(message: string) {
        console.warn(message);
        this.isLoading = false;
        this.errorMessage = message;
    }

}
