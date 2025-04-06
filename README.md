<div *ngFor="let item of formItems" class="form-group mb-3" [ngSwitch]="item.type">

  <!-- Text Field -->
  <ng-container *ngSwitchCase="'text'">
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
        'background-color': item.bgColor
      }"
      class="form-control mt-2 w-full rounded-lg border border-gray-300 p-3 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </ng-container>

  <!-- Button -->
  <ng-container *ngSwitchCase="'button'">
    <button
      type="button"
      [ngStyle]="{
        'font-size': item.fontSize,
        color: item.fontColor,
        'font-weight': item.fontWeight,
        'background-color': item.bgColor,
        width: item.width,
        height: item.height
      }"
      class="mt-2 rounded-lg shadow-md focus:outline-none"
    >
      {{ item.label }}
    </button>
  </ng-container>

  <!-- Unsupported fallback -->
  <ng-container *ngSwitchDefault>
    <p class="text-red-500">Unsupported element type: {{ item.type }}</p>
  </ng-container>
</div>

























<div *ngFor="let item of formItems" class="form-group mb-4" [ngSwitch]="item.type">

  <!-- Label for all (except button) -->
  <label *ngIf="item.type !== 'button'" class="block mb-1 text-gray-700">
    {{ item.label }}
  </label>

  <!-- Text Input -->
  <input
    *ngSwitchCase="'text'"
    type="text"
    [placeholder]="item.placeholder"
    [ngStyle]="getStyles(item)"
    class="form-control w-full rounded-lg border border-gray-300 p-3 shadow-sm"
  />

  <!-- Email -->
  <input
    *ngSwitchCase="'email'"
    type="email"
    [placeholder]="item.placeholder"
    [ngStyle]="getStyles(item)"
    class="form-control w-full rounded-lg border border-gray-300 p-3 shadow-sm"
  />

  <!-- Password -->
  <input
    *ngSwitchCase="'password'"
    type="password"
    [placeholder]="item.placeholder"
    [ngStyle]="getStyles(item)"
    class="form-control w-full rounded-lg border border-gray-300 p-3 shadow-sm"
  />

  <!-- Textarea -->
  <textarea
    *ngSwitchCase="'textarea'"
    [placeholder]="item.placeholder"
    [ngStyle]="getStyles(item)"
    class="w-full rounded-lg border border-gray-300 p-3 shadow-sm"
  ></textarea>

  <!-- Select -->
  <select
    *ngSwitchCase="'select'"
    [ngStyle]="getStyles(item)"
    class="w-full rounded-lg border border-gray-300 p-3 shadow-sm"
  >
    <option *ngFor="let opt of item.options">{{ opt }}</option>
  </select>

  <!-- Radio Group -->
  <div *ngSwitchCase="'radio'" [ngStyle]="getStyles(item)">
    <label
      *ngFor="let opt of item.options"
      class="mr-4 inline-flex items-center"
    >
      <input type="radio" name="{{ item.label }}" class="mr-2" /> {{ opt }}
    </label>
  </div>

  <!-- Checkbox Group -->
  <div *ngSwitchCase="'checkbox-group'" [ngStyle]="getStyles(item)">
    <label
      *ngFor="let opt of item.options"
      class="mr-4 inline-flex items-center"
    >
      <input type="checkbox" class="mr-2" /> {{ opt }}
    </label>
  </div>

  <!-- Single Checkbox -->
  <label *ngSwitchCase="'checkbox'" class="inline-flex items-center space-x-2">
    <input
      type="checkbox"
      [ngStyle]="getStyles(item)"
      class="form-checkbox h-5 w-5 text-blue-600"
    />
    <span [ngStyle]="getStyles(item)">{{ item.label }}</span>
  </label>

  <!-- Date -->
  <input
    *ngSwitchCase="'date'"
    type="date"
    [ngStyle]="getStyles(item)"
    class="form-control w-full rounded-lg border border-gray-300 p-3 shadow-sm"
  />

  <!-- File -->
  <input
    *ngSwitchCase="'file'"
    type="file"
    [ngStyle]="getStyles(item)"
    class="w-full border p-2"
  />

  <!-- Button -->
  <button
    *ngSwitchCase="'button'"
    type="button"
    [ngStyle]="{
      'font-size': item.fontSize,
      color: item.fontColor,
      'font-weight': item.fontWeight,
      'background-color': item.bgColor,
      width: item.width,
      height: item.height
    }"
    class="rounded-lg px-4 py-2 shadow-md"
  >
    {{ item.label }}
  </button>

  <!-- Fallback -->
  <p *ngSwitchDefault class="text-red-500">
    Unsupported element type: {{ item.type }}
  </p>
</div>







availableElements: FormElement[] = [
  {
    type: 'text',
    label: 'Text Field',
    placeholder: 'Enter text',
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'email',
    label: 'Email Address',
    placeholder: 'example@mail.com',
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter password',
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'textarea',
    label: 'Message',
    placeholder: 'Write something...',
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'select',
    label: 'Select Option',
    options: ['Option 1', 'Option 2', 'Option 3'],
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'radio',
    label: 'Choose Gender',
    options: ['Male', 'Female', 'Other'],
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'checkbox',
    label: 'I agree to the terms',
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'checkbox-group',
    label: 'Skills',
    options: ['Angular', 'Node.js', 'PostgreSQL'],
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'date',
    label: 'Pick a Date',
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'file',
    label: 'Upload Resume',
    fontSize: '14px',
    fontColor: '#000000'
  },
  {
    type: 'button',
    label: 'Submit',
    bgColor: '#007bff',
    fontColor: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    width: '120px',
    height: '45px'
  }
];

