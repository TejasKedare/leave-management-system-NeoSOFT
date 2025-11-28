import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataLoaderService {
  constructor(private http: HttpClient) {}

  loadJSON<T>(relativePath: string): Observable<T> {
    return this.http.get<T>(`/assets/data/${relativePath}`);
  }
}
