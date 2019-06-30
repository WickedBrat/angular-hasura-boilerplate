import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdvancedComponent } from './advanced.component';
import { AuthenticationGuard } from '@app/core';

// Module is lazy loaded, see app-routing.module.ts
const routes: Routes = [
  {
    path: '',
    canActivate: [AuthenticationGuard],
    component: AdvancedComponent,
    data: { title: 'Advanced' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AdvancedRoutingModule {}
