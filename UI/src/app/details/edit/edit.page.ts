import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Spot } from '../../models/Spot';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';

@Component({
    selector: 'app-edit',
    templateUrl: 'edit.page.html',
    styleUrls: ['edit.page.scss']
})
export class EditPage implements OnInit {
    id: string;
    spot: Spot;
    isLoading = true;
    images: Array<string> = [];

    constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router, private common: CommonService, private fileChooser: FileChooser){}

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

    addImages() {
        console.log("add images");
        this.fileChooser.open().then(uri => {
            console.log(uri)
        }).catch(e => console.log(e));
    }

    saveChanges() {
        console.log(this.spot);
    }

    cancel() {
        this.router.navigate(["details", this.spot.RowKey], {state: { data: this.spot }});
    }

}