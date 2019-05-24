import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '@app/views/home/home.component';
import { FolderComponent } from '@app/views/folder/folder.component';
import { SettingsComponent } from '@app/views/settings/settings.component';
import { IpcService } from '@app/services/ipc.service';
import * as ipcMessages from '@common/ipcMessages';
import { CanLeaveFolderGuard } from '@app/services/can-leave-folder.guard';


const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'folder', component: FolderComponent, canDeactivate: [CanLeaveFolderGuard]},
  {path: 'settings', component: SettingsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(private ipcService: IpcService, router: Router) {
    ipcService.on(ipcMessages.navigateTo)
      .subscribe(({data}) => router.navigate([data.path], {queryParams: data.query}));
  }
}
