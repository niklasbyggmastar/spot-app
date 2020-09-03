import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-explore-container',
    templateUrl: './explore-container.component.html',
    styleUrls: ['./explore-container.component.scss'],
})

export class ExploreContainerComponent implements OnInit {
    @Input() name: string;

    constructor(private http: HttpClient) { }

    ngOnInit() {
    }

}
