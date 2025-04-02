<div class="mt-3">
    <label for="textAlign">Text Alignment:</label>
    <select id="textAlign" [(ngModel)]="textAlign" class="w-full rounded border p-2" (change)="updateStyles()">
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
    </select>
</div>

<div class="mt-3">
    <label for="borderWidth">Border Width:</label>
    <input id="borderWidth" type="text" [(ngModel)]="borderWidth" class="w-full rounded border p-2" 
        placeholder="Enter border width (e.g., 2px)" (input)="updateStyles()" />
</div>

<div class="mt-3">
    <label for="borderRadius">Border Radius:</label>
    <input id="borderRadius" type="text" [(ngModel)]="borderRadius" class="w-full rounded border p-2" 
        placeholder="Enter border radius (e.g., 10px)" (input)="updateStyles()" />
</div>

<div class="mt-3">
    <label for="margin">Margin:</label>
    <input id="margin" type="text" [(ngModel)]="margin" class="w-full rounded border p-2" 
        placeholder="Enter margin (e.g., 10px)" (input)="updateStyles()" />
</div>

<div class="mt-3">
    <label for="width">Width:</label>
    <input id="width" type="text" [(ngModel)]="width" class="w-full rounded border p-2" 
        placeholder="Enter width (e.g., 100px or 100%)" (input)="updateStyles()" />
</div>

<div class="mt-3">
    <label for="height">Height:</label>
    <input id="height" type="text" [(ngModel)]="height" class="w-full rounded border p-2" 
        placeholder="Enter height (e.g., 50px)" (input)="updateStyles()" />
</div>

<div class="mt-3">
    <label for="boxShadow">Box Shadow:</label>
    <input id="boxShadow" type="text" [(ngModel)]="boxShadow" class="w-full rounded border p-2" 
        placeholder="Enter box shadow (e.g., 2px 2px 10px gray)" (input)="updateStyles()" />
</div>

<div class="mt-3">
    <label for="opacity">Opacity:</label>
    <input id="opacity" type="range" min="0" max="1" step="0.1" [(ngModel)]="opacity" 
        class="w-full" (input)="updateStyles()" />
</div>




updateStyles() {
    if (this.selectedElementIndex !== null) {
        this.formItems[this.selectedElementIndex] = {
            ...this.formItems[this.selectedElementIndex],
            fontSize: this.fontSize,
            fontColor: this.fontColor,
            fontFamily: this.fontFamily,
            fontWeight: this.fontWeight,
            borderStyle: this.borderStyle,
            borderWidth: this.borderWidth + 'px',
            borderRadius: this.borderRadius + 'px',
            padding: this.padding + 'px',
            margin: this.margin + 'px',
            bgColor: this.bgColor,
            textAlign: this.textAlign,
            width: this.width,
            height: this.height,
            boxShadow: this.boxShadow,
            opacity: this.opacity
        };
    }
}


<input
    [type]="item.type"
    [placeholder]="item.placeholder"
    [ngStyle]="{
        'font-size': item.fontSize,
        'color': item.fontColor,
        'font-family': item.fontFamily,
        'font-weight': item.fontWeight,
        'border-style': item.borderStyle,
        'border-width': item.borderWidth,
        'border-radius': item.borderRadius,
        'padding': item.padding,
        'margin': item.margin,
        'background-color': item.bgColor,
        'text-align': item.textAlign,
        'width': item.width,
        'height': item.height,
        'box-shadow': item.boxShadow,
        'opacity': item.opacity
    }"
    class="form-control mt-2 w-full rounded-lg border border-gray-300 p-3 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>


formItems = [
    {
        type: 'text',
        label: 'Sample Input',
        placeholder: 'Enter text',
        fontSize: '14px',
        fontColor: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'normal',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: '5px',
        padding: '10px',
        margin: '5px',
        bgColor: '#ffffff',
        textAlign: 'left',
        width: '100%',
        height: '40px',
        boxShadow: 'none',
        opacity: '1'
    }
];

