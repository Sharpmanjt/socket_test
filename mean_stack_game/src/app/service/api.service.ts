import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUri:string = 'http://localhost:3000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

  addHistoryEntry(data): Observable<any> {
    let url = `${this.baseUri}/addhistory`;
    return this.http.post(url, data).pipe(catchError(this.errorMgmt))
  }

  addEventEntry(data): Observable<any> {
    let url = `${this.baseUri}/addevent`;
    return this.http.post(url, data).pipe(catchError(this.errorMgmt))
  }

  getHistory() {
    return this.http.get(`${this.baseUri}/history`);
  }

  getHistoryByRoom() {
    return this.http.get(`${this.baseUri}/roomhistory`);
  }

  getEventLog() {
    return this.http.get(`${this.baseUri}/eventlog`);
  }

  // Error handling 
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
