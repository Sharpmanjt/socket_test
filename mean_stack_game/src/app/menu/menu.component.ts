import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../service/api.service';
import { History } from '../../model/history';
import { Event } from '../../model/event';
import { MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  providers: [ApiService]
})
export class MenuComponent implements OnInit {
  historyColumns: string[] = ['player', 'opponent', 'date', 'time', 'message'];
  historyEntries: History[];
  historyDataSource: MatTableDataSource<History>;
  showHistory: boolean;
  @ViewChild('historyPaginator', {static: true}) historyPaginator: MatPaginator;

  eventColumns: string[] = ['type', 'date', 'time', 'user'];
  eventLogs: Event[];
  eventDataSource: MatTableDataSource<Event>;
  showEvents: boolean;
  @ViewChild('eventPaginator', {read: MatPaginator, static: true}) eventPaginator: MatPaginator;

  showDashboard: boolean;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.showDashboard = true;
  }

  openDashboard(){
    this.showDashboard = true;
    this.showHistory = false;
    this.showEvents = false;
  }

  getChatHistory() {
    this.showHistory = true;
    this.showEvents = false;
    this.showDashboard = false;
    this.apiService
    .getHistory()
    .then((historyEntries: History[]) => {
      this.historyEntries = historyEntries.map((historyEntry) => {
        return historyEntry;
      })
      this.historyDataSource = new MatTableDataSource(historyEntries);
      this.historyDataSource.paginator = this.historyPaginator;
    })
    return this.historyEntries;
  }

  getEventLog() {
    this.showHistory = false;
    this.showEvents = true;
    this.showDashboard = false;
    this.apiService
    .getEventLog()
    .then((eventLogs: Event[]) => {
      this.eventLogs = eventLogs.map((eventLog) => {
        return eventLog;
      })
      this.eventDataSource = new MatTableDataSource(eventLogs);
      this.eventDataSource.paginator = this.eventPaginator;
    })
    return this.eventLogs;
  }
}
