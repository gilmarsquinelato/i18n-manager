import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { FolderComponent } from '@app/views/folder/folder.component';

@Injectable({
  providedIn: 'root'
})
export class CanLeaveFolderGuard implements CanDeactivate<FolderComponent> {
  canDeactivate(component: FolderComponent,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!component.isContentChanged) {
      return true;
    }

    return confirm('You have unsaved changes! If you leave, your changes will be lost, are you sure?');
  }
}
