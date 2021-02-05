import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Spot } from '../models/Spot';
import { CommonService } from "../services/common.service";

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, AfterViewChecked {

    title: string = "Spots nearby";
    allSpots: Array<Spot> = [];
    isLoading = true;
    spotsWereCached = false;

    constructor(private http: HttpClient, public common: CommonService) {}

    async ngAfterViewChecked() {
        console.log(this.common.router.getCurrentNavigation()?.extras);
        if (this.common.router.getCurrentNavigation()?.extras?.state?.refreshList && this.common.router.getCurrentNavigation()?.extras?.state?.refreshList == true) {
            console.log("SÄSÄSÄSÄ");
            await this.doRefresh();
        }
    }

    async ngOnInit() {
        await this.common.getCurrentLocation();
        this.isLoading = false;

        // Get spots, either from localStorage or db
        // Length must be over 2, value can be "[]"
        if (localStorage.getItem("allSpots") != null && localStorage.getItem("allSpots").length > 2) {
            this.allSpots = JSON.parse(localStorage.getItem("allSpots"));
            this.spotsWereCached = true;
        } else {
            this.allSpots = await this.common.getSpotList();
        }

        // Get distances to spots if the location had been changed from the previous one or if the spots were fetched from db
        if (this.common.locationChanged || !this.spotsWereCached) {
            for (let i in this.allSpots) {
                this.allSpots[i].isLoading = true;
                this.allSpots = await this.common.getDistanceToSpot(this.allSpots, i);
                this.allSpots.sort((a, b) => a.distance - b.distance);
                localStorage.setItem("allSpots", JSON.stringify(this.allSpots));
            }
        }
        this.allSpots.map(s => s.isLoading = false);
    }

    openSpotDetails(spot: Spot) {
        this.common.router.navigate(['/details', spot.RowKey], {state: { data: spot }});
    }

    async doRefresh(event?) {
        await this.common.getCurrentLocation();

        // Get spots, either from localStorage or db
        // Length must be over 2, value can be "[]"
        this.allSpots = await this.common.getSpotList();

        // Get distances to spots if the location had been changed from the previous one or if the spots were fetched from db
        for (let i in this.allSpots) {
            this.allSpots = await this.common.getDistanceToSpot(this.allSpots, i);
            this.allSpots.sort((a, b) => a.distance - b.distance);
            localStorage.setItem("allSpots", JSON.stringify(this.allSpots));
        }
        this.allSpots.map(s => s.isLoading = false);
        if (event) {
            event.target.complete();
        }
      }
}
