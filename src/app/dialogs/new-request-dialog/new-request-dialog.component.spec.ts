import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRequestDialogComponent } from './new-request-dialog.component';

describe('NewRequestDialogComponent', () => {
  let component: NewRequestDialogComponent;
  let fixture: ComponentFixture<NewRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewRequestDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
