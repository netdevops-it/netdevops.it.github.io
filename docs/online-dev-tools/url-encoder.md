---
title: "URL Encoder/Decoder"
description: "Encode and decode URLs with support for various encoding schemes"
tags: ["tools", "url", "encoding", "decoding", "percent-encoding"]
---

# URL Encoder/Decoder

A comprehensive URL encoding and decoding tool. Convert special characters to URL-safe format and vice versa.

## How to Use

1. **Encode**: Enter text to convert special characters to URL encoding
2. **Decode**: Enter encoded URL to convert back to readable text
3. **Multiple Formats**: Choose between different encoding schemes

---

<div class="url-encoder-container">
    <div class="input-section">
        <label for="url-input"><strong>Input:</strong></label>
        <textarea id="url-input" rows="6" placeholder="Enter text to encode or URL to decode...&#10;&#10;Examples:&#10;Text: Hello World!&#10;URL: https://example.com/path?param=value"></textarea>
        
        <div class="encoding-options">
            <label><strong>Encoding Type:</strong></label>
            <div class="radio-group">
                <label><input type="radio" name="encoding" value="standard" checked> Standard URL Encoding</label>
                <label><input type="radio" name="encoding" value="component"> Component Encoding</label>
                <label><input type="radio" name="encoding" value="full"> Full Encoding</label>
            </div>
        </div>
        
        <div class="button-group">
            <button id="encode-btn" class="action-btn">Encode URL</button>
            <button id="decode-btn" class="action-btn">Decode URL</button>
            <button id="clear-btn" class="action-btn secondary">Clear</button>
        </div>
    </div>
    
    <div class="output-section">
        <label for="url-output"><strong>Output:</strong></label>
        <textarea id="url-output" rows="6" readonly placeholder="Encoded/decoded result will appear here..."></textarea>
        
        <div class="info-panel">
            <div id="status" class="status">Ready</div>
            <div id="encoding-info" class="encoding-info"></div>
        </div>
    </div>
</div>

<script>
onPageReady(function() {
console.log('URL encoder DOM loaded');
const input = document.getElementById("url-input");
const output = document.getElementById("url-output");
const encodeBtn = document.getElementById("encode-btn");
const decodeBtn = document.getElementById("decode-btn");
const clearBtn = document.getElementById("clear-btn");
const status = document.getElementById("status");
const encodingInfo = document.getElementById("encoding-info");
const encodingRadios = document.querySelectorAll('input[name="encoding"]');

console.log('URL elements found:', {
    input: !!input,
    output: !!output,
    encodeBtn: !!encodeBtn,
    decodeBtn: !!decodeBtn,
    clearBtn: !!clearBtn,
    status: !!status,
    encodingInfo: !!encodingInfo,
    encodingRadios: encodingRadios.length
});

function updateStatus(message, type = "info") {
    status.textContent = message;
    status.className = `status ${type}`;
}

function getEncodingType() {
    return document.querySelector('input[name="encoding"]:checked').value;
}

function updateEncodingInfo() {
    const type = getEncodingType();
    let info = "";
    
    switch(type) {
        case "standard":
            info = "Standard: Encodes spaces as %20, special chars as %XX";
            break;
        case "component":
            info = "Component: Encodes / ? = & # as %XX (for URL components)";
            break;
        case "full":
            info = "Full: Encodes all non-alphanumeric chars as %XX";
            break;
    }
    
    encodingInfo.textContent = info;
}

function encodeURL(text, type) {
    switch(type) {
        case "standard":
            return encodeURI(text);
        case "component":
            return encodeURIComponent(text);
        case "full":
            return text.replace(/[^A-Za-z0-9]/g, (char) => {
                return '%' + char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase();
            });
        default:
            return encodeURI(text);
    }
}

function decodeURL(text, type) {
    try {
        switch(type) {
            case "standard":
                return decodeURI(text);
            case "component":
                return decodeURIComponent(text);
            case "full":
                return text.replace(/%[0-9A-Fa-f]{2}/g, (match) => {
                    return String.fromCharCode(parseInt(match.slice(1), 16));
                });
            default:
                return decodeURI(text);
        }
    } catch (e) {
        throw new Error("Invalid encoded URL");
    }
}

function encode() {
    const text = input.value.trim();
    if (!text) {
        updateStatus("Please enter text to encode", "warning");
        return;
    }
    
    try {
        const type = getEncodingType();
        const encoded = encodeURL(text, type);
        output.value = encoded;
        updateStatus(`Successfully encoded using ${type} encoding`, "success");
    } catch (e) {
        updateStatus("Error encoding: " + e.message, "error");
    }
}

function decode() {
    const text = input.value.trim();
    if (!text) {
        updateStatus("Please enter URL to decode", "warning");
        return;
    }
    
    try {
        const type = getEncodingType();
        const decoded = decodeURL(text, type);
        output.value = decoded;
        updateStatus(`Successfully decoded using ${type} decoding`, "success");
    } catch (e) {
        updateStatus("Error decoding: " + e.message, "error");
    }
}

function clear() {
    input.value = "";
    output.value = "";
    updateStatus("Ready", "info");
}

function autoDetect() {
    const text = input.value.trim();
    if (!text) {
        output.value = "";
        updateStatus("Ready", "info");
        return;
    }
    
    // Try to detect if it's already encoded
    if (text.includes('%') && /%[0-9A-Fa-f]{2}/.test(text)) {
        decode();
    } else {
        encode();
    }
}

// Event listeners
encodeBtn.addEventListener("click", encode);
decodeBtn.addEventListener("click", decode);
clearBtn.addEventListener("click", clear);

input.addEventListener("input", () => {
    if (input.value.trim()) {
        autoDetect();
    } else {
        output.value = "";
        updateStatus("Ready", "info");
    }
});

encodingRadios.forEach(radio => {
    radio.addEventListener("change", updateEncodingInfo);
});

// Initial setup
updateEncodingInfo();
});
</script>

<style>
.url-encoder-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin: 2rem 0;
}

.input-section, .output-section {
    display: flex;
    flex-direction: column;
}

.input-section label, .output-section label {
    margin-bottom: 0.5rem;
    font-weight: bold;
}

#url-input, #url-output {
    width: 100%;
    min-height: 150px;
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    resize: vertical;
}

#url-output {
    background-color: #f8f9fa;
    color: #495057;
}

.encoding-options {
    margin: 1rem 0;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
}

.radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.radio-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal;
    cursor: pointer;
}

.button-group {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
}

.action-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
}

.action-btn:not(.secondary) {
    background-color: #007bff;
    color: white;
}

.action-btn:not(.secondary):hover {
    background-color: #0056b3;
}

.action-btn.secondary {
    background-color: #6c757d;
    color: white;
}

.action-btn.secondary:hover {
    background-color: #545b62;
}

.info-panel {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
}

.status {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.status.success {
    color: #28a745;
}

.status.error {
    color: #dc3545;
}

.status.warning {
    color: #ffc107;
}

.status.info {
    color: #17a2b8;
}

.encoding-info {
    font-size: 0.9em;
    color: #6c757d;
}

@media (max-width: 768px) {
    .url-encoder-container {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .button-group {
        justify-content: center;
    }
    
    .radio-group {
        flex-direction: column;
    }
}
</style>

---

## Features

- **Multiple Encoding Types**: Standard, Component, and Full encoding
- **Real-time Information**: Shows current encoding scheme details
- **Error Handling**: Clear error messages for invalid URLs
- **Responsive Design**: Works on all devices

## Privacy & Security

🔒 **100% Client-side**: All processing happens in your browser. No data is sent to any server or saved anywhere.

## Encoding Types

### Standard URL Encoding
- **Use case**: Full URLs
- **Encodes**: Spaces as `%20`, special characters as `%XX`
- **Preserves**: `/ ? = & #` (URL structure characters)

### Component Encoding
- **Use case**: URL parameters, query strings
- **Encodes**: All special characters including `/ ? = & #`
- **Example**: `param=value&next=path` → `param%3Dvalue%26next%3Dpath`

### Full Encoding
- **Use case**: Maximum compatibility
- **Encodes**: All non-alphanumeric characters
- **Example**: `Hello World!` → `Hello%20World%21`

## Common Use Cases

### API Parameters
Encode query parameters for API requests.

### File Paths
Encode file paths for web applications.

### Form Data
Encode form data for submission.

### Log Analysis
Decode encoded URLs in log files.

## Examples

### Standard Encoding
```
Input:  https://example.com/path with spaces
Output: https://example.com/path%20with%20spaces
```

### Component Encoding
```
Input:  param=value&next=path
Output: param%3Dvalue%26next%3Dpath
```

### Full Encoding
```
Input:  Hello World! @#$%
Output: Hello%20World%21%20%40%23%24%25
```

## Special Characters Reference

| Character | Standard | Component | Full |
|-----------|----------|-----------|------|
| Space | `%20` | `%20` | `%20` |
| ! | `!` | `%21` | `%21` |
| " | `%22` | `%22` | `%22` |
| # | `#` | `%23` | `%23` |
| $ | `$` | `%24` | `%24` |
| % | `%25` | `%25` | `%25` |
| & | `&` | `%26` | `%26` |
| ' | `'` | `%27` | `%27` |
| ( | `(` | `%28` | `%28` |
| ) | `)` | `%29` | `%29` |
| * | `*` | `%2A` | `%2A` |
| + | `+` | `%2B` | `%2B` |
| , | `,` | `%2C` | `%2C` |
| / | `/` | `%2F` | `%2F` |
| : | `:` | `%3A` | `%3A` |
| ; | `;` | `%3B` | `%3B` |
| = | `=` | `%3D` | `%3D` |
| ? | `?` | `%3F` | `%3F` |
| @ | `@` | `%40` | `%40` |
| [ | `%5B` | `%5B` | `%5B` |
| ] | `%5D` | `%5D` | `%5D` | 