import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    private title: string = "Spots nearby";

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.http.get("https://www.google.fi/maps/@60.4461346,22.3011522,14z/data=!4m3!11m2!2swP6knl_0H5gCrJOKdsFNtr5nnr7lcQ!3e3").toPromise().then((res) => {
            console.log(res);
        })
    }

}
