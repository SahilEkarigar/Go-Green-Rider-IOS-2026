import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http'; // Import this
import { IonicStorageModule } from '@ionic/storage-angular';
import { OrderAcceptedComponent } from './components/order-accepted/order-accepted.component';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { SignInWithApple } from '@ionic-native/sign-in-with-apple/ngx';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,OrderAcceptedComponent, IonicModule.forRoot(), AppRoutingModule,HttpClientModule,  IonicStorageModule.forRoot(),IonicModule, FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },Diagnostic,   GooglePlus, SignInWithApple],
  bootstrap: [AppComponent],
})
export class AppModule {}
