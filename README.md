<div class="flex min-w-0 flex-auto flex-col">
    <div class="flex-auto p-6 sm:p-10">
        <div class="h-400 max-h-400 min-h-400 rounded-2xl border-2 border-dashed border-gray-300">
            <div class="space-y-5 bg-white w-100 shadow-lg ml-10 p-6">

                <mat-card class="upload-container">
                    <mat-card-title>File Upload</mat-card-title>
                    <input type="file" (change)="onFileSelected($event)" #fileInput hidden multiple />
                    <button mat-raised-button color="primary" (click)="fileInput.click()">
                        Choose Files
                    </button>
                </mat-card>

                <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Format</mat-label>
                    <mat-select [(ngModel)]="Formate">
                        <mat-option *ngFor="let time of availableFormate" [value]="time">{{ time }}</mat-option>
                    </mat-select>
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="fetchFiles()">
                    Fetch Files
                </button>

                <!-- Display Uploaded Files -->
                <div *ngFor="let file of uploadedFiles" class="uploaded-media">
                    <!-- Image Preview -->
                    <img *ngIf="file.mediaType.startsWith('image')" 
                         [src]="config + '/' + file.filePath" 
                         alt="Uploaded Image"
                         style="width:100px; height:100px; object-fit:cover; border-radius:10px; margin:5px;"/>

                    <!-- Video Preview -->
                    <video *ngIf="file.mediaType.startsWith('video')" controls width="300">
                        <source [src]="config + '/' + file.filePath" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    <!-- Audio Preview -->
                    <audio *ngIf="file.mediaType.startsWith('audio')" controls>
                        <source [src]="config + '/' + file.filePath" type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>

                    <!-- Delete Button -->
                    <button mat-icon-button color="warn" (click)="deleteFile(file)">
                        <mat-icon>delete</mat-icon>
                    </button>
                </div>

            </div>
        </div>
    </div>
</div>



import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ApicontrollerService } from 'app/controller/apicontroller.service';
import { AuthService } from 'app/Services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../../../config';

interface Patient { 
  patient_age: string;
  patient_email: string;
  patient_gender: string;
  patient_name: string;
  user_contact_number: string;
  user_password: string;
  row_id: string;
}

interface Doctor {
  doctor_email: string;
  doctor_gender: string;
  doctor_name: string;
  user_contact_number: string;
  user_password: string;
  row_id: string;
}

@Component({
  selector: 'app-uploadmedia',
  imports: [ MatFormFieldModule, MatSelectModule, FormsModule, MatButtonModule, MatCardModule ],
  templateUrl: './uploadmedia.component.html'
})
export class UploadmediaComponent {
  role: string;
  errorMessage: string = '';
  successMessage: string = '';
  config: any = config.apiBaseURL;
  
  userDetails: Doctor = {
    doctor_email: '',
    doctor_gender: '',
    doctor_name: '',
    user_contact_number: '',
    user_password: '',
    row_id: ''
  };

  patientDetails: Patient = {
    patient_age: '',
    patient_email: '',
    patient_gender: '',
    patient_name: '',
    user_contact_number: '',
    user_password: '',
    row_id: ''
  };

  uploadedFiles: { filePath: string; mediaType: string }[] = [];
  Formate: string = '';
  availableFormate: string[] = [ 'video/mp4', 'audio/mpeg', 'image/png' ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiController: ApicontrollerService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  /** Handle File Selection and Upload */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    files.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);

      this.http.post(config.apiBaseURL + '/common/upload', formData).subscribe({
        next: async (response: any) => {
          if (!response) {
            this.errorMessage = 'Invalid server response.';
            return;
          }

          this.uploadedFiles.push({
            filePath: response.data.filePath, 
            mediaType: response.data.mimetype,
          });

          console.log('Uploaded Files:', this.uploadedFiles);
        },
        error: (error) => {
          console.error('Upload failed:', error);
          this.errorMessage = 'File upload failed. Please try again.';
        },
      });
    });
  }

  /** Fetch Media from Server */
  async fetchFiles() {
    if (!this.patientDetails.row_id) {
      this.errorMessage = 'Patient ID missing.';
      return;
    }

    if (!this.Formate) {
      this.errorMessage = 'Please select a format.';
      return;
    }

    const data = {
      pat_row_id: this.patientDetails.row_id,
      media_type: this.Formate,
    };

    try {
      const resp = await this.apiController.fetchmedia(data);
      
      this.uploadedFiles = resp.data.map(file => ({
        filePath: file.file_path,
        mediaType: file.media_type,
      }));

      console.log("Fetched media:", this.uploadedFiles);
    } catch (error) {
      console.error("Fetch error:", error);
      this.errorMessage = "Failed to fetch media.";
    }
  }

  /** Delete File */
  async deleteFile(file: { filePath: string; mediaType: string }) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await this.apiController.deleteMedia({ filePath: file.filePath });
      console.log("Deleted file response:", response);
      
      this.uploadedFiles = this.uploadedFiles.filter(f => f.filePath !== file.filePath);
    } catch (error) {
      console.error("Delete error:", error);
      this.errorMessage = "Failed to delete media.";
    }
  }
}
