import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DetailsPage } from './details.page';
import { EditPage } from './edit/edit.page';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: DetailsPage,
  },
  {
    path: 'edit',
    component: EditPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    IonicModule,
    FormsModule
  ],
  declarations: [DetailsPage, EditPage]
})
export class DetailsPageRoutingModule {}
