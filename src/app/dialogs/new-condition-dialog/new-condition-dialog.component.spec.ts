import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewConditionDialogComponent } from './new-condition-dialog.component';

describe('NewConditionDialogComponent', () => {
  let component: NewConditionDialogComponent;
  let fixture: ComponentFixture<NewConditionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewConditionDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewConditionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
