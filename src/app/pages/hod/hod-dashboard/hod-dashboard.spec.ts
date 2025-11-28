import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HodDashboard } from './hod-dashboard';

describe('HodDashboard', () => {
  let component: HodDashboard;
  let fixture: ComponentFixture<HodDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HodDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HodDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
