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
        console.log(this.spot);
        if (!this.spot) {
            this.id = this.activatedRoute.snapshot.paramMap.get("id");
            console.log(this.id);
            this.spot = JSON.parse(localStorage.getItem("allSpots")).find(i => i.RowKey == this.id);
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
        const res: Array<Spot> = await this.common.getSpotList()
        console.log(res);
        console.log(this.spot?.RowKey);
        console.log(this.id);
        if (this.id == undefined) {
            this.id = this.activatedRoute.snapshot.paramMap.get("id");
        } 
        this.spot = res.find(s => s.RowKey == this.id);
        console.log(this.spot);
        const data = [
            {
                Latitude: this.common.currentLocation.latitude,
                Longitude: this.common.currentLocation.longitude
            },
            {
                Latitude: this.spot.lat,
                Longitude: this.spot.lon
            }
        ];
        this.getImages();

        this.http.post(`${environment.apiUrl}/distance`, data).toPromise().then((res:any) => {
            const distance = (res.rows[0].elements[0].distance.value/1000).toFixed(1);
            const duration = res.rows[0].elements[0].duration.text;
            console.log(distance, duration);
            this.spot.distance = parseFloat(distance);
            this.spot.duration = duration;
            this.spot.isLoading = false;
        }).catch(err => {
            this.common.handleErrorState(err);
        })
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
