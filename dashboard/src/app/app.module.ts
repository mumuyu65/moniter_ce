import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app';

import { DashboardComponent } from 'app/dashboard/dashboard';

import { TimelineComponent } from 'app/timeline/timeline';

import { Ng2Echarts } from 'ng2-echarts';

import {TooltipModule} from "ng2-tooltip";

import { CookieService } from 'angular2-cookie/services/cookies.service';

@NgModule({
  declarations: [AppComponent,Ng2Echarts,DashboardComponent,TimelineComponent],// 注入模块
  imports: [BrowserModule,
    FormsModule,
    HttpModule,
    TooltipModule
  ],
  providers: [CookieService],//注入服务
  bootstrap: [AppComponent]
})

export class AppModule { }
