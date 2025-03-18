<mat-card class="upload-container">
  <mat-card-title>File Upload</mat-card-title>
  <input type="file" (change)="onFileSelected($event)" #fileInput hidden />
  <button mat-raised-button color="primary" (click)="fileInput.click()">
    Choose File
  </button>
  <span *ngIf="selectedFile">{{ selectedFile.name }}</span>
  <button mat-raised-button color="accent" (click)="uploadFile()" [disabled]="!selectedFile">
    Upload
  </button>
</mat-card>
