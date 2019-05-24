import { Component, Input, OnInit } from '@angular/core';


let shell: any = null;
if (window.require) {
  shell = window.require('electron').shell;
}

@Component({
  selector: 'app-remote-link',
  templateUrl: './remote-link.component.html',
  styleUrls: ['./remote-link.component.scss']
})
export class RemoteLinkComponent implements OnInit {
  @Input() href: string;

  constructor() { }

  ngOnInit() {
  }

  onClick(event) {
    event.preventDefault();
    if (shell) {
      shell.openExternal(this.href);
    }
  }
}
