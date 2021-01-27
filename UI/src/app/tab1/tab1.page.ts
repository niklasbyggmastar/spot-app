import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Spot } from '../models/Spot';
import { Router } from '@angular/router';
import { CommonService } from "../services/common.service";

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    title: string = "Spots nearby";
    allSpots: Array<Spot> = [];
    isLoading = true;
    spotsWereCached = false;

    constructor(private http: HttpClient, private router: Router, private common: CommonService) { }

    async ngOnInit() {
        await this.common.getCurrentLocation();
        this.isLoading = false;

        // Get spots, either from localStorage or db
        if (localStorage.getItem("allSpots") != null) {
            this.allSpots = JSON.parse(localStorage.getItem("allSpots"));
            this.spotsWereCached = true;
        } else {
            await this.getSpotList();
        }

        // Get distances to spots if the location had been changed from the previous one or if the spots were fetched from db
        if (this.common.locationChanged || !this.spotsWereCached) {
            for (let i in this.allSpots) {
                this.allSpots = await this.common.getDistanceToSpot(this.allSpots, i);
                this.allSpots.sort((a, b) => a.distance - b.distance);
                localStorage.setItem("allSpots", JSON.stringify(this.allSpots));
            }
        }
        this.allSpots.map(s => s.isLoading = false);
        

        /*this.http.get("https://goo.gl/maps/y6Uke9DGFF6euXD17").toPromise().then((res) => {
            console.log(res);
        })*/
    }


    async getSpotList() {
        return this.http.get(environment.storageAccountUrl).toPromise().then((res:any) => {
            this.allSpots = res.value;
        }).catch(err => {
            this.common.handleErrorState(err);
        });
    }

    openSpotDetails(spot: Spot) {
        this.router.navigate(['/details', spot.RowKey], {state: { data: spot }});
    }
}
