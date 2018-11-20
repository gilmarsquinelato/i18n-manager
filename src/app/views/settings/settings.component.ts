import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, FormGroup} from '@angular/forms';
import { SettingsService } from '@app/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings = new FormGroup({
    googleTranslateApiKey: new FormControl(''),
  });

  originalSettings: any;

  translateApiKeyLink = 'https://console.cloud.google.com/apis/credentials/wizard?api=translate.googleapis.com';

  constructor(
    private settingsService: SettingsService,
    private location: Location,
  ) {
  }

  ngOnInit() {
    this.settingsService.getSettings().subscribe((data) => {
      this.originalSettings = data;
      this.settings.patchValue(data);
    });
  }

  saveSettings(event) {
    event.preventDefault();
    if (this.settings.valid) {
      this.settingsService.save(this.settings.value);
      this.location.back();
    }
  }

  onCancel(event) {
    event.preventDefault();
    this.settings.patchValue(this.originalSettings);
    this.location.back();
  }
}
