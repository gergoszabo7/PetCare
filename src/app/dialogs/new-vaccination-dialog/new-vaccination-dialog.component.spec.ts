import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVaccinationDialogComponent } from './new-vaccination-dialog.component';

describe('NewVaccinationDialogComponent', () => {
  let component: NewVaccinationDialogComponent;
  let fixture: ComponentFixture<NewVaccinationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewVaccinationDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewVaccinationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
