import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatScreenPageRoutingModule } from './chat-screen-routing.module';

import { ChatScreenPage } from './chat-screen.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatScreenPageRoutingModule
  ],
  // declarations: [ChatScreenPage]
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatScreenPageModule {}
