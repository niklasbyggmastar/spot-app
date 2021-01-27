import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Spot } from '../models/Spot';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../services/common.service';


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

    constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router, private common: CommonService){}

    async ngOnInit() {
        this.spot = this.router.getCurrentNavigation()?.extras?.state?.data;
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
        if (this.spot.imgUrls && this.spot.imgUrls.length > 0) {
            this.images = JSON.parse(this.spot.imgUrls);
            console.log(this.images);
        }
    }

    openNavigation() {
        window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${this.spot.lat},${this.spot.lon}`; // &origin=${this.common.currentLocation.latitude},${this.common.currentLocation.longitude}
    }

}
