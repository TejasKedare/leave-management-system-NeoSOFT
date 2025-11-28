import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffLeaves } from './staff-leaves';

describe('StaffLeaves', () => {
  let component: StaffLeaves;
  let fixture: ComponentFixture<StaffLeaves>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffLeaves]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffLeaves);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
