import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatScreenPage } from './chat-screen.page';

describe('ChatScreenPage', () => {
  let component: ChatScreenPage;
  let fixture: ComponentFixture<ChatScreenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatScreenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
