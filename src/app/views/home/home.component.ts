import { Component, OnInit } from '@angular/core';
import { FolderService } from '@app/services/folder.service';
import { IFormattedFolderPath } from '@common/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  recentFolders$: Observable<IFormattedFolderPath[]>;

  constructor(
    private folderService: FolderService,
  ) {
  }

  ngOnInit() {
    this.recentFolders$ = this.folderService.recentFolders$;
    this.folderService.loadRecentFolders();
  }
}
