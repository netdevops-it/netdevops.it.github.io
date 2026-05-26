---
title: "Base64 Converter"
description: "Encode and decode Base64 strings with real-time conversion"
tags: ["tools", "base64", "encoding", "decoding", "converter"]
---

# Base64 Converter

A real-time Base64 encoder and decoder. Convert text to Base64 and vice versa with instant feedback.

## How to Use

1. **Encode**: Enter text in the input field to convert to Base64
2. **Decode**: Enter Base64 in the input field to convert back to text
3. **Auto-detect**: The tool automatically detects if you're encoding or decoding

---

<div class="base64-converter-container">
    <div class="input-section">
        <label for="base64-input"><strong>Input:</strong></label>
        <textarea id="base64-input" rows="8" placeholder="Enter text to encode or Base64 to decode...&#10;&#10;Examples:&#10;Text: Hello World&#10;Base64: SGVsbG8gV29ybGQ="></textarea>
        
        <div class="button-group">
            <button id="encode-btn" class="action-btn">Encode to Base64</button>
            <button id="decode-btn" class="action-btn">Decode from Base64</button>
            <button id="clear-btn" class="action-btn secondary">Clear</button>
        </div>
    </div>
    
    <div class="output-section">
        <label for="base64-output"><strong>Output:</strong></label>
        <textarea id="base64-output" rows="8" readonly placeholder="Converted result will appear here..."></textarea>
        
        <div class="info-panel">
            <div id="status" class="status">Ready</div>
            <div id="length-info" class="length-info"></div>
        </div>
    </div>
</div>

<script>
onPageReady(function() {
console.log('Base64 converter DOM loaded');
const input = document.getElementById("base64-input");
const output = document.getElementById("base64-output");
const encodeBtn = document.getElementById("encode-btn");
const decodeBtn = document.getElementById("decode-btn");
const clearBtn = document.getElementById("clear-btn");
const status = document.getElementById("status");
const lengthInfo = document.getElementById("length-info");

console.log('Elements found:', {
    input: !!input,
    output: !!output,
    encodeBtn: !!encodeBtn,
    decodeBtn: !!decodeBtn,
    clearBtn: !!clearBtn,
    status: !!status,
    lengthInfo: !!lengthInfo
});

function updateStatus(message, type = "info") {
    status.textContent = message;
    status.className = `status ${type}`;
}

function updateLengthInfo() {
    const inputLength = input.value.length;
    const outputLength = output.value.length;
    lengthInfo.textContent = `Input: ${inputLength} chars | Output: ${outputLength} chars`;
}

function isBase64(str) {
    // Check if string looks like Base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(str) && str.length % 4 === 0;
}

function encode() {
    const text = input.value.trim();
    if (!text) {
        updateStatus("Please enter text to encode", "warning");
        return;
    }
    
    try {
        // Handle Unicode characters properly
        const encoded = btoa(unescape(encodeURIComponent(text)));
        output.value = encoded;
        updateStatus("Successfully encoded to Base64", "success");
        updateLengthInfo();
    } catch (e) {
        updateStatus("Error encoding: " + e.message, "error");
    }
}

function decode() {
    const text = input.value.trim();
    if (!text) {
        updateStatus("Please enter Base64 to decode", "warning");
        return;
    }
    
    try {
        // Handle Unicode characters properly
        const decoded = decodeURIComponent(escape(atob(text)));
        output.value = decoded;
        updateStatus("Successfully decoded from Base64", "success");
        updateLengthInfo();
    } catch (e) {
        updateStatus("Error decoding: " + e.message, "error");
    }
}

function autoDetect() {
    const text = input.value.trim();
    if (!text) {
        output.value = "";
        updateStatus("Ready", "info");
        updateLengthInfo();
        return;
    }
    
    if (isBase64(text)) {
        decode();
    } else {
        encode();
    }
}

function clear() {
    input.value = "";
    output.value = "";
    updateStatus("Ready", "info");
    updateLengthInfo();
}

// Event listeners
encodeBtn.addEventListener("click", encode);
decodeBtn.addEventListener("click", decode);
clearBtn.addEventListener("click", clear);

input.addEventListener("input", () => {
    updateLengthInfo();
    if (input.value.trim()) {
        autoDetect();
    }
});

// Initial setup
updateLengthInfo();
});
</script>

<style>
.base64-converter-container {
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

#base64-input, #base64-output {
    width: 100%;
    min-height: 200px;
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    resize: vertical;
}

#base64-output {
    background-color: #f8f9fa;
    color: #495057;
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

.length-info {
    font-size: 0.9em;
    color: #6c757d;
}

@media (max-width: 768px) {
    .base64-converter-container {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .button-group {
        justify-content: center;
    }
}
</style>

---

## Features

- **Real-time Conversion**: Auto-detect and convert as you type
- **Manual Controls**: Encode/Decode buttons for explicit control
- **Error Handling**: Clear error messages for invalid input
- **Length Information**: Track input and output character counts
- **Responsive Design**: Works on all devices

## Privacy & Security

🔒 **100% Client-side**: All processing happens in your browser. No data is sent to any server or saved anywhere.

## Common Use Cases

### Configuration Files
Encode sensitive configuration data for storage or transmission.

### API Authentication
Generate Base64 encoded credentials for API requests.

### Data Transmission
Encode binary data as text for safe transmission.

### Log Analysis
Decode Base64 encoded log entries for analysis.

## Examples

### Text to Base64
```
Input:  Hello World
Output: SGVsbG8gV29ybGQ=
```

### Base64 to Text
```
Input:  SGVsbG8gV29ybGQ=
Output: Hello World
```

### JSON Configuration
```
Input:  {"api_key": "secret123", "endpoint": "https://api.example.com"}
Output: eyJhcGlfa2V5IjogInNlY3JldDEyMyIsICJlbmRwb2ludCI6ICJodHRwczovL2FwaS5leGFtcGxlLmNvbSJ9
```

## Technical Notes

- **Encoding**: Uses `btoa()` for text to Base64 conversion
- **Decoding**: Uses `atob()` for Base64 to text conversion
- **Auto-detection**: Attempts to detect if input is valid Base64
- **Character Support**: Handles UTF-8 encoded text
- **Error Recovery**: Graceful handling of invalid Base64 strings 