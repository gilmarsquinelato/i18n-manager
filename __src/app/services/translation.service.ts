import { Injectable } from '@angular/core';
import { SettingsService } from '@app/services/settings.service';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  settings: any;

  constructor(
    private settingsService: SettingsService,
    private http: HttpClient,
  ) {
    this.settingsService.getSettings().subscribe((data) => this.settings = data);
  }

  translate(source: string, text: string, target: string) {
    source = source.split('-')[0];
    target = target.split('-')[0];
    return this.http.post(
      `${this.baseUrl}?key=${this.settings.googleTranslateApiKey}`,
      {
        target,
        source,
        q: text,
        format: 'text'
      })
      .pipe(
        switchMap(response => of(_.get(response, 'data.translations[0].translatedText', '')))
      );
  }
}
