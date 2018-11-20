import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges, ViewEncapsulation,
} from '@angular/core';
import { ParsedFile } from '@common/types';
import * as _ from 'lodash';
import { getLocaleLabel } from '@common/language';
import { SettingsService } from '@app/services/settings.service';
import { TranslationService } from '@app/services/translation.service';


interface ILanguageStatus {
  isNew: boolean;
  isMissing: boolean;
  isChanged: boolean;
}


@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent implements OnInit, OnChanges {
  @Input() path: string[] = [];
  @Input() folder: ParsedFile[] = [];
  @Input() originalFolder: ParsedFile[] = [];
  @Output() change = new EventEmitter<any>();
  @Output() contextMenu = new EventEmitter<any>();


  status: { [s: string]: ILanguageStatus } = {};
  isTranslating: boolean;
  translateErrors: string[];
  settings: any;

  constructor(
    private settingsService: SettingsService,
    private translationService: TranslationService,
  ) {
  }

  ngOnInit() {
    this.settingsService.getSettings().subscribe((data) => this.settings = data);
    this.updateStatus();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.path && changes.path.currentValue !== changes.path.previousValue) ||
      (changes.originalFolder && changes.originalFolder.currentValue !== changes.originalFolder.previousValue)) {
      this.updateStatus();
    }
  }

  getValue = (language: string): string =>
    _.get(this.folder.find(i => i.language === language).data, this.path) || '';

  getStatus = (language: string): string => {
    if (!this.status[language]) {
      return '';
    }

    if (this.status[language].isNew) {
      return 'new';
    }

    if (this.status[language].isChanged) {
      return 'changed';
    }

    if (this.status[language].isMissing) {
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
    this.updateLanguageStatus(language);
    this.change.emit();
  }

  private updateStatus() {
    for (const item of this.folder) {
      this.updateLanguageStatus(item.language);
    }
    this.translateErrors = [];
  }

  private updateLanguageStatus(language: string) {
    this.status[language] = {
      isNew: this.isNewItem(language),
      isMissing: this.isMissingItem(language),
      isChanged: this.isChangedItem(language),
    };
  }

  private isNewItem = (language: string) =>
    this.getFromLanguage(this.folder, language) !== undefined &&
    this.getFromLanguage(this.originalFolder, language) === undefined;

  private isChangedItem = (language: string) => {
    const current = this.getFromLanguage(this.folder, language);
    const original = this.getFromLanguage(this.originalFolder, language);
    return current && current !== original;
  };

  private isMissingItem = (language: string) =>
    !this.getFromLanguage(this.folder, language);

  private getFromLanguage(folder: ParsedFile[], language: string) {
    return _.get(folder.find(i => i.language === language).data, this.path);
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

  async translateEmptyFields(language: string) {
    this.isTranslating = true;
    this.translateErrors = [];

    const errors = [];
    const text = this.getFromLanguage(this.folder, language);

    for (const folderItem of this.folder) {
      const currentItemText = this.getFromLanguage(this.folder, folderItem.language);

      if (folderItem.language === language ||
        (currentItemText && currentItemText.length > 0)) {
        continue;
      }

      try {
        const result = await this.translationService
          .translate(language, text, folderItem.language)
          .toPromise();

        _.set(folderItem.data, this.path, result);
        this.updateLanguageStatus(folderItem.language);
      } catch (e) {
        if (e.status === 400) {
          errors.push(
            `Google Translate can't translate from "${this.getLanguageLabel(language)}" to "${this.getLanguageLabel(folderItem.language)}"`
          );
        } else {
          errors.push(e.message);
        }
      }
    }

    this.translateErrors = _.sortedUniq(errors);

    this.change.emit();
    this.isTranslating = false;

    if (this.translateErrors.length > 0) {
      setTimeout(() => alert(this.translateErrors.join('\n')), 500);
    }
  }
}
