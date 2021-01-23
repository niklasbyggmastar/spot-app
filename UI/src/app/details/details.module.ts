import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DetailsPage } from './details.page';

const routes: Routes = [
  {
    path: '',
    component: DetailsPage,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    IonicModule,
    HttpClientModule
  ],
  declarations: [DetailsPage]
})
export class DetailsPageRoutingModule {}
