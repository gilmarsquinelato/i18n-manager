import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-translate-button',
  templateUrl: './translate-button.component.html',
  styleUrls: ['./translate-button.component.styl']
})
export class TranslateButtonComponent implements OnInit {
  @Input() isTranslating: boolean;
  @Input() isTranslationEnabled: boolean;
  @Output() translate = new EventEmitter(true);

  constructor() { }

  ngOnInit() {
  }


  onClick(event) {
    event.stopPropagation();
    this.translate.emit();
  }
}
