import { Component, OnInit, Sanitizer } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Spot } from '../../models/Spot';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-edit',
    templateUrl: 'edit.page.html',
    styleUrls: ['edit.page.scss']
})
export class EditPage implements OnInit {
    id: string;
    spot: Spot;
    isLoading = true;
    image: string = null;

    constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, public common: CommonService) { }

    async ngOnInit() {
        this.spot = this.common.router.getCurrentNavigation()?.extras?.state?.data;
        if (!this.spot) {
            this.id = this.activatedRoute.snapshot.paramMap.get("id");
            console.log(this.id);
            this.spot = JSON.parse(localStorage.getItem("allSpots")).find(i => i.rowKey == this.id);
        }
        console.log(this.spot);
        this.isLoading = false;
    }

    addImage(event) {
        console.log(event);
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.image = reader.result as string;
            console.log(this.image);
        };
        reader.onerror = (error) => {
            //handle errors
            console.warn(error);
        };
    }

    async saveChanges() {
        if (this.image != null) {
            await this.common.uploadImage(this.spot, this.image);
        }
        console.log(this.spot);
        this.http.post(`${environment.apiUrl}/update`, this.spot).toPromise().then((res: any) => {
            console.log(res);
            this.common.router.navigate(["details", this.spot.rowKey], { state: { data: this.spot } });
        }).catch(err => {
            this.common.handleErrorState(err);
        })
    }

    cancel() {
        this.common.router.navigate(["details", this.spot.rowKey], { state: { data: this.spot } });
    }

}