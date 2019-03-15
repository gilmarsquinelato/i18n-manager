import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './views/home/home.component';
import { FolderComponent } from './views/folder/folder.component';
import { TreeComponent } from './components/tree/tree.component';
import { ContentComponent } from './components/content/content.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './views/settings/settings.component';
import { RemoteLinkComponent } from './components/remote-link/remote-link.component';
import { TranslateButtonComponent } from './components/translate-button/translate-button.component';
import { HttpClientModule } from '@angular/common/http';
import {
  MatButtonModule, MatCheckboxModule,
  MatChipsModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatMenuModule,
  MatOptionModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatToolbarModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FolderComponent,
    TreeComponent,
    ContentComponent,
    SettingsComponent,
    RemoteLinkComponent,
    TranslateButtonComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    ScrollingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
