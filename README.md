@if(role == 0) {
  <div class="flex min-w-0 flex-auto flex-col">
    <!-- Main -->
    <div class="flex-auto p-6 sm:p-10">
      <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <!-- Button Group -->
        <div class="flex gap-3">
          <!-- Search Field -->
          <mat-form-field class="w-full sm:w-72" appearance="outline">
            <mat-icon matPrefix [svgIcon]="'heroicons_solid:magnifying-glass'"></mat-icon>
            <input
              matInput
              #query
              (keyup)="applyFilter(query.value)"
              placeholder="Search patient"
            />
          </mat-form-field>

          <!-- Export Button -->
          <button mat-flat-button color="primary" (click)="exportToExcel()">
            <mat-icon [svgIcon]="'heroicons_solid:arrow-up-tray'"></mat-icon>
            <span class="ml-2">Export</span>
          </button>

          <!-- Refresh Button -->
          <button mat-icon-button (click)="refresh()">
            <mat-icon>refresh</mat-icon>
          </button>

          <!-- Add Patient Button -->
          <button mat-icon-button (click)="addpatientdialog()">
            <mat-icon>control_point</mat-icon>
          </button>
        </div>
      </div>

      <div class="bg-white shadow-lg rounded-2xl border border-gray-300 p-4" style="width: 1500px;">
        <h2 class="text-lg sm:text-2xl font-bold text-gray-700 mb-4">All Patients</h2>

        <div class="overflow-auto rounded-lg">
          <table mat-table [dataSource]="patient" class="mat-elevation-z8 w-full min-w-[600px]" matSort>

            <!-- Columns -->
            <ng-container matColumnDef="user_row_id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">ID</th>
              <td mat-cell *matCellDef="let row; let i = index;">{{ i + 1 }}</td>
            </ng-container>

            <ng-container matColumnDef="patient_name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">Patient Name</th>
              <td mat-cell *matCellDef="let row">{{ row.patient_name }}</td>
            </ng-container>

            <ng-container matColumnDef="patient_email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">Patient Email</th>
              <td mat-cell *matCellDef="let row">{{ row.patient_email }}</td>
            </ng-container>

            <ng-container matColumnDef="patient_contact">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">Contact</th>
              <td mat-cell *matCellDef="let row">{{ row.patient_contact }}</td>
            </ng-container>

            <ng-container matColumnDef="patient_gender">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">Gender</th>
              <td mat-cell *matCellDef="let row">{{ row.patient_gender }}</td>
            </ng-container>

            <ng-container matColumnDef="patient_age">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">Age</th>
              <td mat-cell *matCellDef="let row">{{ row.patient_age }}</td>
            </ng-container>

            <ng-container matColumnDef="doctor_name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">Doctor Name</th>
              <td mat-cell *matCellDef="let row">{{ row.doctor_name }}</td>
            </ng-container>

            <ng-container matColumnDef="doctor_type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">Doctor Type</th>
              <td mat-cell *matCellDef="let row">{{ row.doctor_type }}</td>
            </ng-container>

            <ng-container matColumnDef="doctor_email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">Doctor Email</th>
              <td mat-cell *matCellDef="let row">{{ row.doctor_email }}</td>
            </ng-container>

            <ng-container matColumnDef="doctor_gender">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-left">Doctor Gender</th>
              <td mat-cell *matCellDef="let row">{{ row.doctor_gender }}</td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions" stickyEnd>
              <th mat-header-cell *matHeaderCellDef class="sticky-column">Actions</th>
              <td mat-cell *matCellDef="let row" class="sticky-column">
                <div class="action-buttons">
                  <button mat-icon-button color="primary" (click)="viewpatientDetails(row.user_row_id)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deletebtn(row.user_row_id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <!-- Table Header & Rows -->
            <tr mat-header-row *matHeaderRowDef="displayedColumns" class="text-sm md:text-lg font-bold bg-gray-200"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-blue-100 transition cursor-pointer"></tr>
          </table>
        </div>

        <!-- Paginator -->
        @if(!isSearchActive) {
          <div class="flex flex-col sm:flex-row justify-between items-center mt-4 border-t pt-4 gap-2">
            <span class="text-xs sm:text-sm text-gray-500">Showing {{ patient.data.length }} patients</span>
            <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 20, 30, 40]" showFirstLastButtons>
            </mat-paginator>
          </div>
        }
      </div>
    </div>
  </div>
}




import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ViewChild, AfterViewInit } from '@angular/core';

export class YourComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'user_row_id', 'patient_name', 'patient_email', 'patient_contact',
    'patient_gender', 'patient_age', 'doctor_name', 'doctor_type',
    'doctor_email', 'doctor_gender', 'actions'
  ];
  patient = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.patient.paginator = this.paginator;
    this.patient.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.patient.filter = filterValue.trim().toLowerCase();
  }
}


<!-- Actions -->
<ng-container matColumnDef="actions" stickyEnd>
  <th mat-header-cell *matHeaderCellDef class="sticky-column border-l border-gray-300">Actions</th>
  <td mat-cell *matCellDef="let row" class="sticky-column border-l border-gray-200">
    <div class="action-buttons flex gap-2">
      <button mat-icon-button color="primary" (click)="viewpatientDetails(row.user_row_id)">
        <mat-icon>visibility</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="deletebtn(row.user_row_id)">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  </td>
</ng-container>
