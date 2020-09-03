import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    private title: string = "Spots nearby";
    private latitude: number;
    private longitude: number;

    constructor(private http: HttpClient, private geo: Geolocation) { }

    ngOnInit() {
        console.log(environment.apiKey);

        this.geo.getCurrentPosition().then(res => {
            console.log(res);
            if (res && res.coords) {
                this.latitude = res.coords.latitude;
                this.longitude = res.coords.longitude;
            }
        }).catch(error => {
            console.warn(error);
        });

        /*this.http.get("https://goo.gl/maps/y6Uke9DGFF6euXD17").toPromise().then((res) => {
            console.log(res);
        })*/
    }

}
