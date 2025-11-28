import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HodLayout } from './hod-layout';

describe('HodLayout', () => {
  let component: HodLayout;
  let fixture: ComponentFixture<HodLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HodLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HodLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
