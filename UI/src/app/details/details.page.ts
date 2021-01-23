import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Spot } from '../models/Spot';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-details',
    templateUrl: 'details.page.html',
    styleUrls: ['details.page.scss']
})
export class DetailsPage implements OnInit {
    id: string;
    isLoading = false;
    errorMessage: string;

    constructor(private http: HttpClient, private route: ActivatedRoute){}

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get("id");
        console.log(this.id);
        this.http.get(`${environment.storageAccountUrl}&PartitionKey=spot&RowKey=${this.id}`).toPromise().then((res:any) => {
            console.log(res);
        }).catch(err => {
            console.warn(err);
        })
    }

}
