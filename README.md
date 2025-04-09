<!-- action button -->
<div class="save-form-btn ml-5 flex-col">
    <div>
        <div class="mt-4">
            <!-- <input type="text" [(ngModel)]="formLinkInput" placeholder="Enter the form link" class="w-full rounded border p-2" /> -->

            @for (link of formslinks; track link; let idx = $index) {
                <div>
                    <a
                        class="cursor-pointer text-xl text-blue-900"
                        (click)="showforms(link.row_id)"
                        >Form- {{ idx + 1 }}
                    </a>
                </div>
            }
        </div>

        <div class="mt-4">
            <button (click)="loadForm()">Load Form</button>
        </div>
    </div>

    <div class="mt-4">
        <button (click)="newForm()">New Form</button>
    </div>
</div>

<!-- Form Preview Section -->
<app-form-preview
    [formItems]="formItems"
    [forms_row_id]="forms_row_id"
></app-form-preview>

<div>
    <h1>Total response : {{ forms_response_numbers }}</h1>

    <!-- @for(data of formdata;track data; let idx = $index){
        <div>
            <a class="text-blue-900 text-xl cursor-pointer" > {{data.form_data | json}} </a>
        </div>
        } -->

    <table
        mat-table
        [dataSource]="formSubdata"
        class="mat-elevation-z8 w-full min-w-[600px]"
    >
        <!-- Dynamic Column Definitions -->
        <ng-container
            *ngFor="let column of displayedColumns"
            [matColumnDef]="column"
        >
            <th mat-header-cell *matHeaderCellDef class="text-left capitalize">
                {{ column }}
            </th>

            <td mat-cell *matCellDef="let row">
                <!-- Special case for ID (index based) -->
                <ng-container *ngIf="column === 'form_row_id'; else otherField">
                    {{ formSubdata.indexOf(row) + 1 }}
                </ng-container>

                <!-- Other dynamic fields -->
                <ng-template #otherField>
                    {{ row.form_data[column] }}
                </ng-template>
            </td>
        </ng-container>

        <!-- Table Header & Rows -->
        <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns"
            class="bg-gray-200 text-sm font-bold md:text-lg"
        ></tr>

        <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="cursor-pointer transition hover:bg-blue-100"
        ></tr>
    </table>
</div>
import { Component, inject } from '@angular/core';
import { FormPreviewComponent } from '../../components/form-preview/form-preview.component';
import { ApicontrollerService } from 'app/controller/apicontroller.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, NgFor } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilderAreaComponent } from '../../components/form-builder-area/form-builder-area.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';


interface FormElement {
  type: string;
  label: string;
  placeholder?: string;
  rows?: any;
  cols?: any
  min?: any
  max?: any
  optionsdropdown?: Array<{ label: string, value: string }>;// Dropdown options,
  optionsradio?: Array<{ label: string, value: string }>;
  optionscheckbox?: Array<{ label: string, value: string }>
  layout?: 'vertical' | 'horizontal';
  required?: boolean;
  address?:any[];
  accept?:string;
  key?:any;
  searchText?:any;
  filteredOptions?:any;
    


}


interface formdata{
  form_data:any
}


interface FormsSchemaData {
  // forms_row_id:any;
  form_link: any;
}

@Component({
  selector: 'app-form-priview',
  imports: [
    DragDropModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    FormPreviewComponent,
    MatTableModule

  ],
  templateUrl: './form-priview.component.html',
  styleUrl: './form-priview.component.scss'
})
export class FormPriviewComponent {

    private _snackBar = inject(MatSnackBar);
  

   // Dropped elements in the form builder
   formItems: FormElement[] = [];

   formslinks: FormsSchemaData[];
  //  forms_row_id: FormsSchemaData[];


   formLinkInput: string;

   forms_row_id:string;

   forms_response_numbers:string;

  formSubdata:formdata[] =[]; // Use MatTableDataSource for pagination
   

   constructor(
       private Apicontroller: ApicontrollerService
     ) {
     }

    //  displayedColumns: any[] = [
    //   'form_row_id',
    //   'form_sub_data',   
    //   'phone',
    //   'username',
    //   'textField',
    //   // 'emailField',
    //   'phoneNumber',
    //   // 'description'


     
    // ];

    displayedColumns:any[];


    async formsdatasub(){
      const formsubresponse = await this.Apicontroller.showFormresponse(this.forms_row_id)
      console.log("formsubresponse -->",formsubresponse)
      console.log("response form_data",formsubresponse)
      this.formSubdata = formsubresponse
      
      console.log("form res data of header",Object.keys(this.formSubdata[0].form_data))

      this.displayedColumns = Object.keys(this.formSubdata[0].form_data)

      console.log("disp",this.displayedColumns)
  
      console.log("forms data ",this.formSubdata)
    }

  /**
     * load forms (backend side).
     */

  async loadForm() {

    const resp = await this.Apicontroller.loadallForms();
    this.formslinks = resp as FormsSchemaData[]; // Type assert to Doctor[]
    // this.forms_row_id = resp as FormsSchemaData[]; // Type assert to Doctor[]

    console.log("resp---", resp)
//    console.log("formslinks ---", this.forms_row_id)

  }


  /**
   * new design window
   */

  newForm() {
    this.formItems = [];
  }


  formdata =[]


  async showforms(link: any) {
    console.log("row id ", link)

    this.forms_row_id = link

    const formsubresponseCount = await this.Apicontroller.showFormresponseCount(this.forms_row_id)
    console.log("formsubresponse count -->",formsubresponseCount)
    this.forms_response_numbers = formsubresponseCount


    // const formsubresponse = await this.Apicontroller.showFormresponse(this.forms_row_id)
    // console.log("formsubresponse -->",formsubresponse)
    // console.log("response form_data",formsubresponse)
    // this.formdata = formsubresponse

    // console.log("forms data ",this.formdata)

    this.formsdatasub()






    const resp = await this.Apicontroller.loadForms(link);
    console.log("resp", resp[0].form_data)
    this.formItems = resp[0].form_data;
  }



  



}
