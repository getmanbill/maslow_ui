# Maslow Web Interface Customization Guide

## Easy Customizations (CSS Only)

### 1. Change Colors
```css
/* Main navigation bar */
.navbar-default {
    background-color: #your-color !important;
}

/* Button colors */
.btn-primary {
    background-color: #your-color !important;
    border-color: #your-border-color !important;
}

/* Tab colors */
.nav-tabs > li.active > a {
    background-color: #your-color !important;
}
```

### 2. Add Custom Header
```css
.custom-header {
    background: linear-gradient(135deg, #color1 0%, #color2 100%);
    color: white;
    padding: 15px;
    text-align: center;
    margin-bottom: 15px;
    border-radius: 8px;
}
```

### 3. Change Fonts
```css
body {
    font-family: 'Your-Font', Arial, sans-serif !important;
}
```

## Advanced Customizations

### 1. Modify Tab Names
Find and replace in the HTML:
- `<span translate>Camera</span>` → `<span translate>Your Tab Name</span>`
- `<span translate>FluidNC</span>` → `<span translate>Your Settings</span>`

### 2. Add Custom JavaScript
Add your own functions at the end of the file:
```javascript
// Custom initialization
function customInit() {
    console.log("Custom Maslow interface loaded!");
    // Your custom code here
}
```

### 3. Replace Logos/Icons
- Find SVG elements in the HTML
- Replace with your own SVG code or images

## How to Apply Changes

### Method 1: Direct File Replacement
1. Extract `index.html.gz` → `gunzip index.html-3.gz`
2. Edit the HTML file
3. Compress back → `gzip index.html`
4. Upload to Maslow via web interface

### Method 2: Via Serial Commands
Use the serial connection to upload files directly to the filesystem

## Color Schemes

### Dark Theme
```css
body { background-color: #2c3e50 !important; color: #ecf0f1 !important; }
.panel { background-color: #34495e !important; color: #ecf0f1 !important; }
```

### Maslow Blue Theme  
```css
.navbar-default { background-color: #1e3a8a !important; }
.btn-primary { background-color: #3b82f6 !important; }
```

### Industrial Orange Theme
```css
.navbar-default { background-color: #ea580c !important; }
.btn-primary { background-color: #f97316 !important; }
``` 