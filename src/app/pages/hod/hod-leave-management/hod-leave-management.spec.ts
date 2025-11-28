import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HodLeaveManagement } from './hod-leave-management';

describe('HodLeaveManagement', () => {
  let component: HodLeaveManagement;
  let fixture: ComponentFixture<HodLeaveManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HodLeaveManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HodLeaveManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
