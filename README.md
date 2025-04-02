<div class="container flex gap-5 p-5">
    <!-- Sidebar with draggable form elements -->
    <div class="sidebar w-1/4 rounded-lg bg-gray-200 p-4 shadow-md">
        <h3 class="mb-3 text-lg font-semibold">Available Elements</h3>
        <div
            cdkDropList
            #availableList="cdkDropList"
            [cdkDropListData]="availableElements"
            [cdkDropListConnectedTo]="[formBuilderDropArea]"
            class="rounded-lg bg-gray-100 p-2"
        >
            <div
                *ngFor="let element of availableElements"
                class="draggable-item mb-2 cursor-move rounded bg-white p-2 shadow-md"
                cdkDrag
            >
                {{ element.label }}
            </div>
        </div>
    </div>

    <!-- Form Builder Drop Area -->
    <div
        cdkDropList
        #formBuilderDropArea="cdkDropList"
        [cdkDropListData]="formItems"
        [cdkDropListConnectedTo]="[availableList]"
        (cdkDropListDropped)="onDrop($event)"
        class="form-builder w-200 rounded-lg bg-gray-100 p-4 shadow-md"
    >
        <h3 class="text-lg font-semibold">Build Your Form</h3>

        <div
            *ngIf="formItems.length === 0"
            class="placeholder p-4 text-gray-500"
        >
            Drag elements here to build your form
        </div>

        <div
            *ngFor="let item of formItems; let i = index"
            class="form-item mb-2 flex cursor-pointer items-center justify-between rounded shadow-sm"
            cdkDrag
            (click)="selectElement(i)"
            [ngStyle]="{
                'font-size': item.fontSize,
                color: item.fontColor,
                'font-family': item.fontFamily,
                'font-weight': item.fontWeight,
                'border-style': item.borderStyle,
                padding: item.padding,
                'background-color': item.bgColor,
                'border-width': item.borderWidth,
                margin: item.margin,
            }"
        >
            <ng-container [ngSwitch]="item.type">
                <!-- Text Input -->
                <div *ngSwitchCase="'text'">
                    <label>{{ item.label }}</label>
                    <input type="text" [placeholder]="item.placeholder" />
                </div>

                <!-- Button -->
                <div *ngSwitchCase="'button'">
                    <button
                        [style.background-color]="item.bgColor"
                        [style.color]="item.fontColor"
                        [style.font-size]="item.fontSize"
                        [style.font-weight]="item.fontWeight"
                    >
                        {{ item.label }}
                    </button>
                </div>

                <!-- Dropdown -->
                <div *ngSwitchCase="'dropdown'">
                    <label>{{ item.label }}</label>
                    <select>
                        <option *ngFor="let option of item.options">
                            {{ option }}
                        </option>
                    </select>
                </div>
            </ng-container>

            <!-- Remove Button -->
            <button
                (click)="removeElement(i)"
                class="rounded p-1 text-white hover:bg-red-700"
            >
                <mat-icon>delete</mat-icon>
            </button>
        </div>
    </div>

    <div class="save-form-btn ml-5 flex-col">
        <div>
            <button (click)="saveForm()">Save Form</button>
        </div>

        <div>
            <div class="mt-4">
                <input
                    type="text"
                    placeholder="Enter the form link"
                    class="w-full rounded border p-2"
                />
            </div>

            <div class="mt-4">
                <!-- <button (click)="loadForm()">Load Form</button> -->
            </div>
        </div>

        <div class="mt-4">
            <!-- <button (click)="newForm()">New Form</button> -->
        </div>
    </div>

    <!-- Right Panel for Editing Form Element -->
    @if (isTextClicked === true) {
        <div
            *ngIf="selectedElementIndex !== null"
            class="right-panel w-1/4 rounded-lg bg-gray-200 p-4 shadow-md"
        >
            <h3 class="text-lg font-semibold">Edit Element</h3>
            <div>
                <label for="label">Label:</label>
                <input
                    id="label"
                    [(ngModel)]="formItems[selectedElementIndex].label"
                    class="w-full rounded border p-2"
                    placeholder="Edit label"
                    [ngClass]="{ 'border-red-500': isLabelInvalid() }"
                    (blur)="validateLabel()"
                />
                <div *ngIf="isLabelInvalid()" class="text-sm text-red-500">
                    Label is required!
                </div>
            </div>

            <div class="mt-3">
                <label for="placeholder">Placeholder:</label>
                <input
                    id="placeholder"
                    [(ngModel)]="formItems[selectedElementIndex].placeholder"
                    class="w-full rounded border p-2"
                    placeholder="Edit placeholder"
                    [ngClass]="{ 'border-red-500': isPlaceholderInvalid() }"
                    (blur)="validatePlaceholder()"
                />
                <!-- Focusing: focus/blur -->
                <div
                    *ngIf="isPlaceholderInvalid()"
                    class="text-sm text-red-500"
                >
                    Placeholder is required!
                </div>
            </div>

            <div class="mt-3">
                <label for="fontSize">Font Size:</label>
                <input
                    id="fontSize"
                    type="text"
                    [(ngModel)]="fontSize"
                    class="w-full rounded border p-2"
                    placeholder="Enter font size"
                    (input)="updateStyles()"
                />
            </div>

            <div class="mt-3">
                <label for="fontColor">Font Color:</label>
                <input
                    id="fontColor"
                    type="color"
                    [(ngModel)]="fontColor"
                    class="w-full"
                    (input)="updateStyles()"
                />
            </div>

            <div class="mt-3">
                <label for="fontFamily">Font Family:</label>
                <select
                    id="fontFamily"
                    [(ngModel)]="fontFamily"
                    class="w-full rounded border p-2"
                    (change)="updateStyles()"
                >
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                </select>
            </div>

            <div class="mt-3">
                <label for="fontWeight">Font Weight:</label>
                <select
                    id="fontWeight"
                    [(ngModel)]="fontWeight"
                    class="w-full rounded border p-2"
                    (change)="updateStyles()"
                >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="bolder">Bolder</option>
                    <option value="lighter">Lighter</option>
                </select>
            </div>

            <div class="mt-3">
                <label for="borderStyle">Border Style:</label>
                <select
                    id="borderStyle"
                    [(ngModel)]="borderStyle"
                    class="w-full rounded border p-2"
                    (change)="updateStyles()"
                >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                </select>
            </div>

            <div class="mt-3">
                <label for="borderWidth">Border Width:</label>
                <input
                    id="borderWidth"
                    type="text"
                    [(ngModel)]="borderWidth"
                    class="w-full rounded border p-2"
                    placeholder="Enter border width (e.g., 2px)"
                    (input)="updateStyles()"
                />
            </div>

            <div class="mt-3">
                <label for="padding">Padding:</label>
                <input
                    id="padding"
                    type="text"
                    [(ngModel)]="padding"
                    class="w-full rounded border p-2"
                    (input)="updateStyles()"
                />
            </div>

            <div class="mt-3">
                <label for="margin">Margin:</label>
                <input
                    id="margin"
                    type="text"
                    [(ngModel)]="margin"
                    class="w-full rounded border p-2"
                    placeholder="Enter margin (e.g., 10px)"
                    (input)="updateStyles()"
                />
            </div>

            <div class="mt-3">
                <label for="bgColor">Background Color:</label>
                <input
                    id="bgColor"
                    type="color"
                    [(ngModel)]="bgColor"
                    class="w-full"
                    (input)="updateStyles()"
                />
            </div>
        </div>
    }

    @if (isButton === true) {
        <div
            *ngIf="selectedElementIndex !== null"
            class="right-panel w-1/4 rounded-lg bg-gray-200 p-4 shadow-md"
        >
            <h3 class="text-lg font-semibold">Edit Button</h3>

            <label>Button Label:</label>
            <input
                [(ngModel)]="formItems[selectedElementIndex].label"
                class="w-full rounded border p-2"
            />

            <label>Background Color:</label>
            <input
                type="color"
                [(ngModel)]="formItems[selectedElementIndex].bgColor"
                class="w-full"
            />

            <label>Font Color:</label>
            <input
                type="color"
                [(ngModel)]="formItems[selectedElementIndex].fontColor"
                class="w-full"
            />

            <label>Font Size:</label>
            <input
                type="number"
                [(ngModel)]="formItems[selectedElementIndex].fontSize"
                class="w-full rounded border p-2"
            />

            <label>Button Width:</label>
            <input
                type="text"
                [(ngModel)]="formItems[selectedElementIndex].width"
                class="w-full rounded border p-2"
                placeholder="e.g., 120px or 50%"
            />

            <label>Button Height:</label>
            <input
                type="text"
                [(ngModel)]="formItems[selectedElementIndex].height"
                class="w-full rounded border p-2"
                placeholder="e.g., 40px"
            />
        </div>
    }

    @if (isDropdown === true) {
        <div
            *ngIf="selectedElementIndex !== null"
            class="right-panel w-1/4 rounded-lg bg-gray-200 p-4 shadow-md"
        >
            <h3 class="text-lg font-semibold">Edit Dropdown</h3>

            <label>Dropdown Label:</label>
            <input
                [(ngModel)]="formItems[selectedElementIndex].label"
                class="w-full rounded border p-2"
                (focus)="(true)"
            />

            <label>Options:</label>
            <div
                *ngFor="
                    let option of formItems[selectedElementIndex]?.options;
                    let j = index;
                    trackBy: trackByIndex
                "
            >
                <input
                    type="text"
                    class="dropdown-option-input"
                    [(ngModel)]="formItems[selectedElementIndex].options[j]"
                    (blur)="
                        updateOption(
                            j,
                            formItems[selectedElementIndex].options[j]
                        )
                    "
                    #optionInput
                    [autofocus]="j === focusedOptionIndex"
                />
                <button mat-icon-button color="warn" (click)="removeOption(j)">
                    <mat-icon>remove_circle</mat-icon>
                </button>
            </div>
            <button mat-button (click)="addOption()">Add Option</button>
        </div>
    }
</div>

<!-- Form Preview Section -->
<!-- <div class="form-preview mt-5 w-200 p-5">
    <h3 class="mb-4 text-lg font-semibold">Form Preview</h3>
    <div class="preview-form mt-4 rounded-lg border bg-gray-100 p-4 shadow-lg">
        <form>
            <div *ngFor="let item of formItems">
                <div class="form-group mb-3">
                    <label class="block text-gray-700">{{ item.label }}</label>
                    <input
                        [type]="item.type"
                        [placeholder]="item.placeholder"
                        [ngStyle]="{
                            'font-size': item.fontSize,
                            color: item.fontColor,
                            'font-family': item.fontFamily,
                            'font-weight': item.fontWeight,
                            'border-style': item.borderStyle,
                            padding: item.padding,
                            'background-color': item.bgColor,
                        }"
                        class="form-control mt-2 w-full rounded-lg border border-gray-300 p-3 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </form>
    </div>
</div> -->




import { Component, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ApicontrollerService } from 'app/controller/apicontroller.service';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

interface FormElement {
  type: string;
  label: string;
  placeholder?: string;
  fontSize?: string;
  fontColor?: string;
  fontFamily?: string;
  fontWeight?: string;
  borderStyle?: string;
  padding?: string;
  bgColor?: string;
  invalid?: boolean;
  borderWidth?: string;
  margin?: string;
  options?: string[];  // Dropdown options
  width?: string;
  height?: string;
  
}

@Component({
  selector: 'app-test',
  standalone: true,
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
  imports: [
    NgFor, NgIf, DragDropModule, CommonModule, FormsModule, MatIcon, MatInputModule, MatIconModule
  ],
})
export class TestComponent {
  availableElements: FormElement[] = [
    { type: 'text', label: 'Text Field', placeholder: 'Enter text' },
    { type: 'button', label: 'Button', bgColor: '#007bff', fontColor: '#ffffff', fontSize: '16px', fontWeight: 'bold', width: '100px', height: '40px' },
    { type: 'dropdown', label: 'Dropdown', options: ['Option 1', 'Option 2', 'Option 3'] }
  ];

  formItems: FormElement[] = [];
  selectedElementIndex: number | null = null;
  selectedElementType: string | null = null;

  fontSize = '16px';
  fontColor = '#000000';
  fontFamily = 'Arial';
  fontWeight = 'normal';
  borderStyle = 'solid';
  padding = '1px';
  bgColor = '#ffffff';
  borderWidth = '1px';
  margin = '1px';
  height = '40px';
  width = '100px';

  private _snackBar = inject(MatSnackBar);
  isTextClicked = false;
  isButton = false;
  isDropdown = false;
  focusedOptionIndex: number | null = null;

  constructor(private Apicontroller: ApicontrollerService) {}

  onDrop(event: CdkDragDrop<FormElement[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.formItems, event.previousIndex, event.currentIndex);
    } else {
      const clonedItem = { ...event.previousContainer.data[event.previousIndex] };
      this.formItems.splice(event.currentIndex, 0, clonedItem);
    }
  }

  selectElement(index: number) {
    this.selectedElementIndex = index;
    const selectedElement = this.formItems[index];

    this.selectedElementType = selectedElement.type;

    this.isTextClicked = selectedElement.type === 'text';
    this.isButton = selectedElement.type === 'button';
    this.isDropdown = selectedElement.type === 'dropdown';

    this.fontSize = selectedElement.fontSize || '16px';
    this.fontColor = selectedElement.fontColor || '#000000';
    this.bgColor = selectedElement.bgColor || '#ffffff';
    this.width = selectedElement.width || '100px';
    this.height = selectedElement.height || '40px';

    if (selectedElement.type === 'dropdown' && !selectedElement.options) {
      selectedElement.options = ['Option 1', 'Option 2'];
    }
  }

  removeElement(index: number) {
    this.formItems.splice(index, 1);
    if (this.selectedElementIndex === index) {
      this.selectedElementIndex = null;
    }
  }

  async saveForm() {
    console.log('Saved Form:', this.formItems);
  }

  validateLabel() {
    if (this.selectedElementIndex !== null) {
      const label = this.formItems[this.selectedElementIndex].label;
      this.formItems[this.selectedElementIndex].invalid = !label || label.trim().length === 0;
    }
  }

  validatePlaceholder() {
    if (this.selectedElementIndex !== null) {
      const placeholder = this.formItems[this.selectedElementIndex].placeholder;
      this.formItems[this.selectedElementIndex].invalid = !placeholder || placeholder.trim().length === 0;
    }
  }

  updateStyles() {
    if (this.selectedElementIndex !== null) {
      const selectedElement = this.formItems[this.selectedElementIndex];
      selectedElement.fontSize = this.fontSize;
      selectedElement.fontColor = this.fontColor;
      selectedElement.fontFamily = this.fontFamily;
      selectedElement.fontWeight = this.fontWeight;
      selectedElement.borderStyle = this.borderStyle;
      selectedElement.padding = this.padding;
      selectedElement.bgColor = this.bgColor;
      selectedElement.borderWidth = this.borderWidth;
      selectedElement.margin = this.margin;
    }
  }

  newForm() {
    this.formItems = [];
  }

  addOption() {
    if (this.selectedElementIndex !== null) {
      const selectedElement = this.formItems[this.selectedElementIndex];
      selectedElement.options.push(`Option ${selectedElement.options.length + 1}`);
  
      // Set focus on the newly added input
      this.focusedOptionIndex = selectedElement.options.length - 1;
    }
  }
  
  

  removeOption(index: number) {
    if (this.selectedElementIndex !== null) {
      this.formItems[this.selectedElementIndex].options?.splice(index, 1);
    }
  }

  updateOption(index: number, newValue: string) {
    if (this.selectedElementIndex !== null) {
      const selectedElement = this.formItems[this.selectedElementIndex];
  
      // Prevent empty or duplicate values
      if (!newValue.trim()) {
        selectedElement.options.splice(index, 1);
        return;
      }
  
      if (selectedElement.options.includes(newValue) && selectedElement.options.indexOf(newValue) !== index) {
        this._snackBar.open('Duplicate option not allowed', 'Close', { duration: 2000 });
        return;
      }
  
      // Maintain focus on the current input field
      this.focusedOptionIndex = index;
    }
  }
  

  trackByIndex(index: number, item: any) {
    return index;
  }
  
  
  
}
