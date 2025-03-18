<div class="flex min-w-0 flex-auto flex-col">
    <div class="flex-auto p-6 sm:p-10">
        <div class="h-400 max-h-400 min-h-400 rounded-2xl border-2 border-dashed border-gray-300">
            <div class="space-y-5 bg-white w-full shadow-lg p-6 rounded-xl">

                <!-- File Upload Card -->
                <mat-card class="upload-container mat-elevation-z3">
                    <mat-card-title class="text-lg font-semibold">File Upload</mat-card-title>
                    <mat-card-content class="flex flex-col items-center space-y-3">
                        <input type="file" (change)="onFileSelected($event)" #fileInput hidden multiple />
                        <button mat-raised-button color="primary" (click)="fileInput.click()">
                            Choose Files
                        </button>
                    </mat-card-content>
                </mat-card>

                <!-- Format Selection -->
                <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Format</mat-label>
                    <mat-select [(ngModel)]="Formate">
                        @for(time of availableFormate; track time){
                            <mat-option [value]="time">{{ time }}</mat-option>
                        }
                    </mat-select>
                </mat-form-field>

                <!-- Fetch Files Button -->
                <button mat-raised-button color="primary" class="w-full" (click)="fetchFiles()">
                    Fetch Files
                </button>

                <!-- Scrollable File Previews -->
                <div class="max-h-[500px] overflow-y-auto p-2 border rounded-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                    <mat-grid-list cols="2" rowHeight="320px" gutterSize="15px">
                        @for(file of uploadedFiles; track file){
                            <mat-grid-tile>
                                <mat-card class="uploaded-media mat-elevation-z3 p-3 rounded-xl">
                                    <mat-card-content class="flex flex-col items-center justify-center">
                                        
                                        <!-- Video Preview with Controls -->
                                        @if(file){
                                            <div class="relative w-full">
                                                <video #videoPlayer controls class="media-preview rounded-lg shadow-md w-full h-64 object-cover">
                                                    <source [src]="config + '/assets/' + file.filePath" type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            </div>
                                        }

                                        <!-- Image Preview -->
                                        @if(file.mediaType === 'image/png'){
                                            <img class="media-preview rounded-lg shadow-md w-full h-64 object-cover"
                                                [src]="config + '/assets/' + file.filePath" alt="Uploaded Image"/>
                                        }

                                        <!-- Audio Preview -->
                                        @if(file.mediaType === 'audio/mpeg'){
                                            <audio controls class="media-preview w-full mt-2">
                                                <source [src]="config + '/assets/' + file.filePath" type="audio/mpeg" />
                                            </audio>
                                        }
                                    </mat-card-content>
                                </mat-card>
                            </mat-grid-tile>
                        }
                    </mat-grid-list>
                </div>                
            </div>
        </div>
    </div>
</div>
