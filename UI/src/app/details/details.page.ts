import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Spot } from '../models/Spot';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { environment } from 'src/environments/environment';


@Component({
    selector: 'app-details',
    templateUrl: 'details.page.html',
    styleUrls: ['details.page.scss']
})
export class DetailsPage implements OnInit {
    id: string;
    spot: Spot;
    isLoading = true;
    images: Array<string> = [];
    refreshList = false;

    constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, public common: CommonService){}

    async ngOnInit() {
        console.log(this.common.router.getCurrentNavigation().extras);
        this.spot = this.common.router.getCurrentNavigation()?.extras?.state?.data;
        this.refreshList = this.common.router.getCurrentNavigation()?.extras?.state?.refreshList;
        this.id = this.activatedRoute.snapshot.paramMap.get("id");
        console.log(this.spot);
        console.log(this.id);
        if (!this.spot) {
            this.spot = JSON.parse(localStorage.getItem("allSpots")).find(i => i.rowKey == this.id);
        }
        this.getImages();
        this.isLoading = false;
    }

    getImages() {
        if (this.spot && this.spot.imgUrls && this.spot.imgUrls.length > 0) {
            this.images = JSON.parse(this.spot.imgUrls);
            console.log(this.images);
        } else {
            this.images = null;
        }
    }

    async doRefresh(event) {
        await this.common.getCurrentLocation();
        this.spot = await this.common.getSpot(this.id);
        console.log(this.spot);
        await this.common.getDistanceToSpot2(this.spot);
        event.target.complete();
    }

    removeSpot() {
        console.log(this.spot);
        if(confirm("Are you sure to remove this spot?")) {
            console.log("SWÄÄG");
            this.http.post(`${environment.apiUrl}/remove-spot`, this.spot).toPromise().then((res: any) => {
                console.log(res);
                this.common.router.navigate(["/"], { state: { refreshList: true }});
            }).catch(err => {
                this.common.handleErrorState(err);
            });
        }
    }

    openNavigation() {
        window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${this.spot.lat},${this.spot.lon}`; // &origin=${this.common.currentLocation.latitude},${this.common.currentLocation.longitude}
    }

    goToMain() {
        this.common.router.navigate(["/"], { state: { refreshList: this.refreshList }});
    }

}
