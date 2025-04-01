.container {
    display: flex;
    gap: 1.25rem;
    padding: 1.25rem;
}

/* Sidebar Styling */
.sidebar {
    width: 25%;
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Form Builder Area */
.form-builder {
    width: 50%;
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    min-height: 300px;
}

/* Form Items */
.form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    border: 1px solid #ddd;
    padding: 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
}

.form-item:hover {
    background: #f3f4f6;
}

/* Right Panel */
.right-panel {
    width: 25%;
    background: #e5e7eb;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
}

.right-panel h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
}

/* Input Fields */
.right-panel input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
}

/* Input Focus */
.right-panel input:focus {
    border-color: #2563eb;
    outline: none;
    box-shadow: 0 0 4px rgba(37, 99, 235, 0.5);
}

/* Save Form Button */
.save-form-btn {
    text-align: center;
    margin-top: 1rem;
}

.save-form-btn button {
    background: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
}

.save-form-btn button:hover {
    background: #2563eb;
}


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
            class="form-item mb-2 flex cursor-pointer items-center justify-between rounded border bg-white p-2 shadow-sm"
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
            }"
        >
            <div>
                <label class="font-medium">{{ item.label }}</label>
                <input
                    type="{{ item.type }}"
                    class="ml-2 rounded border p-1"
                    [placeholder]="item.placeholder"
                    [ngClass]="{ 'border-red-500': item.invalid }"
                />
            </div>

            <!-- Remove Button -->
            <button
                (click)="removeElement(i)"
                class="rounded bg-red-500 p-1 text-white hover:bg-red-700"
            >
                Delete
            </button>
        </div>
    </div>

    <!-- Right Panel for Editing Form Element -->
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
            <div *ngIf="isPlaceholderInvalid()" class="text-sm text-red-500">
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
            <label for="padding">Padding:</label>
            <input
                id="padding"
                type="text"
                [(ngModel)]="padding"
                class="w-full rounded border p-2"
                placeholder="Enter padding (e.g., 10px)"
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
</div>

<!-- Form Preview Section -->
<div class="form-preview mt-5 w-200 p-5">
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
</div>



import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

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
  invalid?: boolean; // Added to indicate validation state
}

@Component({
  selector: 'app-test',
  standalone: true,
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
  imports: [NgFor, NgIf, DragDropModule, CommonModule, FormsModule],
})
export class TestComponent {
  // Available form elements to drag
  availableElements: FormElement[] = [
    { type: 'text', label: 'Text Field', placeholder: 'Enter text' },
    { type: 'email', label: 'Email Field', placeholder: 'Enter email' },
    { type: 'password', label: 'Password Field', placeholder: 'Enter password' },
  ];

  // Dropped elements in the form builder
  formItems: FormElement[] = [];

  // Index of selected element for editing
  selectedElementIndex: number | null = null;

  // Dynamic styles for selected element
  fontSize: string = '16px';
  fontColor: string = '#000000';
  fontFamily: string = 'Arial';
  fontWeight: string = 'normal';
  borderStyle: string = 'solid';
  padding: string = '10px';
  bgColor: string = '#ffffff';

  /**
   * Handles the drag & drop event.
   */
  onDrop(event: CdkDragDrop<FormElement[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.formItems, event.previousIndex, event.currentIndex);
    } else {
      // Clone the dragged item so the original remains in the available list
      const clonedItem = { ...event.previousContainer.data[event.previousIndex] };
      this.formItems.splice(event.currentIndex, 0, clonedItem);
    }
  }

  /**
   * Select an element for editing.
   */
  selectElement(index: number) {
    this.selectedElementIndex = index;
    const selectedElement = this.formItems[index];
    this.fontSize = selectedElement.fontSize || '16px';
    this.fontColor = selectedElement.fontColor || '#000000';
    this.fontFamily = selectedElement.fontFamily || 'Arial';
    this.fontWeight = selectedElement.fontWeight || 'normal';
    this.borderStyle = selectedElement.borderStyle || 'solid';
    this.padding = selectedElement.padding || '10px';
    this.bgColor = selectedElement.bgColor || '#ffffff';
  }

  /**
   * Remove an element from the form.
   */
  removeElement(index: number) {
    this.formItems.splice(index, 1);
    if (this.selectedElementIndex === index) {
      this.selectedElementIndex = null;
    }
  }

  /**
   * Save the form (send data to backend).
   */
  saveForm() {
    console.log('Saved Form:', this.formItems);
    alert('Form saved successfully!');
  }

  /**
   * Validate label (required field)
   */
  isLabelInvalid(): boolean {
    return this.selectedElementIndex !== null &&
      !this.formItems[this.selectedElementIndex].label.trim();
  }

  /**
   * Validate placeholder (required field)
   */
  isPlaceholderInvalid(): boolean {
    return this.selectedElementIndex !== null &&
      !this.formItems[this.selectedElementIndex].placeholder?.trim();
  }

  /**
   * Validate all fields and mark as invalid if needed
   */
  validateLabel() {
    const label = this.formItems[this.selectedElementIndex!].label;
    if (!label || label.trim().length === 0) {
      this.formItems[this.selectedElementIndex!].invalid = true;
    } else {
      this.formItems[this.selectedElementIndex!].invalid = false;
    }
  }

  validatePlaceholder() {
    const placeholder = this.formItems[this.selectedElementIndex!].placeholder;
    if (!placeholder || placeholder.trim().length === 0) {
      this.formItems[this.selectedElementIndex!].invalid = true;
    } else {
      this.formItems[this.selectedElementIndex!].invalid = false;
    }
  }

  /**
   * Update the selected element's styles.
   */
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
    }
  }
}
