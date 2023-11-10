import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPetDialogComponent } from './new-pet-dialog.component';

describe('NewPetDialogComponent', () => {
  let component: NewPetDialogComponent;
  let fixture: ComponentFixture<NewPetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPetDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
