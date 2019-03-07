import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ParsedFile } from '@common/types';
import * as _ from 'lodash';
import { getLocaleLabel } from '@common/language';
import { SettingsService } from '@app/services/settings.service';


@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent implements OnInit {
  @Input() path: string[] = [];
  @Input() folder: ParsedFile[] = [];
  @Input() originalFolder: ParsedFile[] = [];
  @Input() status: {[k: string]: any} = {};
  @Input() languageList: any[];
  @Output() translate = new EventEmitter<any>();
  @Output() change = new EventEmitter<any>();
  @Output() contextMenu = new EventEmitter<any>();


  isTranslating: boolean;
  translateErrors: string[];
  settings: any;

  constructor(
    private settingsService: SettingsService,
  ) {
  }

  ngOnInit() {
    this.settingsService.getSettings().subscribe((data) => this.settings = data);
    this.change.emit();
  }

  getValue = (language: string): string =>
    _.get(this.folder.find(i => i.language === language).data, this.path) || '';

  getStatus = (language: string): string => {
    const itemStatus = this.status[this.path.join('.')];

    if (!itemStatus || !itemStatus[language]) {
      return '';
    }

    if (itemStatus[language].isNew) {
      return 'new';
    }

    if (itemStatus[language].isChanged) {
      return 'changed';
    }

    if (itemStatus[language].isMissing) {
      return 'missing';
    }

    return '';
  };

  getLanguageLabel = (language: string): string => {
    const localeLabel = getLocaleLabel(language);
    if (!localeLabel) {
      return language;
    }

    return `${localeLabel} - ${language}`;
  };

  updateValue(event, language: string) {
    _.set(this.folder.find(i => i.language === language).data, this.path, event.target.value);
    this.change.emit();
  }

  onMouseUp(event: MouseEvent) {
    if (event.button === 2) {
      this.contextMenu.emit({
        x: event.pageX,
        y: event.pageY,
      });
    }
  }

  get isTranslationEnabled() {
    return this.settings.googleTranslateApiKey;
  }

  translateField(source: string, target: string) {
    this.translate.emit({source, target});
  }
}
