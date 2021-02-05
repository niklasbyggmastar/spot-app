import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Spot } from '../models/Spot';
import { CommonService } from '../services/common.service';

@Component({
	selector: 'app-tab2',
	templateUrl: 'tab2.page.html',
	styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

	title = "Add spot";
	spot: Spot = new Spot();
	image = null;
	address: string = null;
	isUsingCurrentLocation = null;

	constructor(private http: HttpClient, public common: CommonService) { }

	async save() {
		if (this.isUsingCurrentLocation == false) {
			await this.getCoordinatesFromAddress();
			this.spot = await this.common.getDistanceToSpot2(this.spot);
		}
		this.spot.RowKey = this.spot.name.replace(/ /g, "-").toLowerCase();
		if (this.image != null) {
            this.spot = await this.common.uploadImage(this.spot, this.image);
		}
        console.log(this.spot);
        this.http.post(`${environment.apiUrl}/update`, this.spot).toPromise().then((res: any) => {
            console.log(res);
			this.common.router.navigate(["details", this.spot.RowKey], { state: { data: this.spot, refreshList: true } });
			this.resetForm();
        }).catch(err => {
			this.common.handleErrorState(err);
        })
	}

	resetForm() {
		console.log("LOL");
		this.spot = new Spot();
		this.image = null;
		this.address = null;
		this.isUsingCurrentLocation = null;
		(<HTMLInputElement>document.getElementById('file-input')).value = null;
	}

	async getCoordinatesFromAddress() {
		return this.http.post(`${environment.apiUrl}/get-coordinates`, {address: this.address}).toPromise().then((res: any) => {
			console.log(res);
			if (res.results && res.results[0].geometry) {
				this.spot.lat = res.results[0].geometry.location.lat.toFixed(this.common.numberOfDecimalsInCoordinates).toString();
				this.spot.lon = res.results[0].geometry.location.lng.toFixed(this.common.numberOfDecimalsInCoordinates).toString();
			}
		}).catch(err => {
			this.common.handleErrorState(err);
			return null;
		})
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
	
	async selectLocationMethod(event, isCurrentLocation) {
		console.log(event);
		//event.target.innerHTML += event.target.innerHTML.includes("ion-icon") ? "" : "<ion-icon name=\"checkmark-circle-outline\" style=\"transform:scale(1.5);margin-left:7px\"></ion-icon>";
		event.target.className += " btn-selected";
		if (isCurrentLocation) {
			this.isUsingCurrentLocation = true;
			await this.common.getCurrentLocation();
			this.spot.lat = this.common.currentLocation.latitude;
			this.spot.lon = this.common.currentLocation.longitude;
		} else {
			this.isUsingCurrentLocation = false;
		}
		
	}

}
