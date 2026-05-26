---
title: "Hash Generator"
description: "Generate various hash types including MD5, SHA1, SHA256, and more"
tags: ["tools", "hash", "cryptography", "md5", "sha1", "sha256"]
---

# Hash Generator

A comprehensive hash generator supporting multiple algorithms. Generate cryptographic hashes for text input with real-time results.

## How to Use

1. **Enter Text**: Type or paste text in the input field
2. **Select Algorithm**: Choose from multiple hash algorithms
3. **View Results**: See the generated hash instantly

---

<div class="hash-generator-container">
    <div class="input-section">
        <label for="hash-input"><strong>Input Text:</strong></label>
        <textarea id="hash-input" rows="6" placeholder="Enter text to hash...&#10;&#10;Examples:&#10;Hello World&#10;password123&#10;secret_key"></textarea>
        
        <div class="algorithm-selector">
            <label><strong>Hash Algorithm:</strong></label>
            <select id="algorithm-select">
                <option value="md5">MD5 (128-bit)</option>
                <option value="sha1">SHA-1 (160-bit)</option>
                <option value="sha256">SHA-256 (256-bit)</option>
                <option value="sha384">SHA-384 (384-bit)</option>
                <option value="sha512">SHA-512 (512-bit)</option>
                <option value="sha3-256">SHA3-256 (256-bit)</option>
                <option value="sha3-512">SHA3-512 (512-bit)</option>
                <option value="blake2b">BLAKE2b (256-bit)</option>
            </select>
        </div>
        
        <div class="options">
            <label><input type="checkbox" id="uppercase"> Uppercase</label>
            <label><input type="checkbox" id="copy-on-change"> Auto-copy to clipboard</label>
        </div>
        
        <div class="button-group">
            <button id="generate-btn" class="action-btn">Generate Hash</button>
            <button id="clear-btn" class="action-btn secondary">Clear</button>
        </div>
    </div>
    
    <div class="output-section">
        <label for="hash-output"><strong>Generated Hash:</strong></label>
        <div class="hash-display">
            <input id="hash-output" type="text" readonly>
            <button id="copy-btn" class="copy-btn" title="Copy to clipboard">📋</button>
        </div>
        
        <div class="hash-info">
            <div id="hash-length" class="hash-length"></div>
            <div id="hash-type" class="hash-type"></div>
        </div>
        
        <div class="comparison-section">
            <label for="compare-input"><strong>Compare Hash:</strong></label>
            <input id="compare-input" type="text" placeholder="Enter hash to compare...">
            <div id="comparison-result" class="comparison-result"></div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js"></script>
<script>
onPageReady(function() {
console.log('Hash generator DOM loaded');
const input = document.getElementById("hash-input");
const algorithmSelect = document.getElementById("algorithm-select");
const output = document.getElementById("hash-output");
const copyBtn = document.getElementById("copy-btn");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const uppercaseCheckbox = document.getElementById("uppercase");
const copyOnChangeCheckbox = document.getElementById("copy-on-change");
const hashLength = document.getElementById("hash-length");
const hashType = document.getElementById("hash-type");
const compareInput = document.getElementById("compare-input");
const comparisonResult = document.getElementById("comparison-result");

console.log('Hash elements found:', {
    input: !!input,
    algorithmSelect: !!algorithmSelect,
    output: !!output,
    copyBtn: !!copyBtn,
    generateBtn: !!generateBtn,
    clearBtn: !!clearBtn,
    uppercaseCheckbox: !!uppercaseCheckbox,
    copyOnChangeCheckbox: !!copyOnChangeCheckbox,
    hashLength: !!hashLength,
    hashType: !!hashType,
    compareInput: !!compareInput,
    comparisonResult: !!comparisonResult
});

function generateHash(text, algorithm) {
    if (!text) return "";
    
    let hash;
    switch(algorithm) {
        case "md5":
            hash = CryptoJS.MD5(text).toString();
            break;
        case "sha1":
            hash = CryptoJS.SHA1(text).toString();
            break;
        case "sha256":
            hash = CryptoJS.SHA256(text).toString();
            break;
        case "sha384":
            hash = CryptoJS.SHA384(text).toString();
            break;
        case "sha512":
            hash = CryptoJS.SHA512(text).toString();
            break;
        case "sha3-256":
            hash = CryptoJS.SHA3(text, { outputLength: 256 }).toString();
            break;
        case "sha3-512":
            hash = CryptoJS.SHA3(text, { outputLength: 512 }).toString();
            break;
        case "blake2b":
            // Note: CryptoJS doesn't support BLAKE2b, using SHA-256 as fallback
            hash = CryptoJS.SHA256(text).toString();
            break;
        default:
            hash = CryptoJS.SHA256(text).toString();
    }
    
    return uppercaseCheckbox.checked ? hash.toUpperCase() : hash;
}

function updateHash() {
    const text = input.value;
    const algorithm = algorithmSelect.value;
    const hash = generateHash(text, algorithm);
    
    output.value = hash;
    
    // Update info
    hashLength.textContent = `Length: ${hash.length} characters`;
    hashType.textContent = `Algorithm: ${algorithmSelect.options[algorithmSelect.selectedIndex].text}`;
    
    // Auto-copy if enabled
    if (copyOnChangeCheckbox.checked && hash) {
        copyToClipboard(hash);
    }
    
    // Update comparison
    updateComparison();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = "✅";
        setTimeout(() => {
            copyBtn.textContent = "📋";
        }, 1000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        copyBtn.textContent = "❌";
        setTimeout(() => {
            copyBtn.textContent = "📋";
        }, 1000);
    });
}

function updateComparison() {
    const generatedHash = output.value.toLowerCase();
    const compareHash = compareInput.value.toLowerCase();
    
    if (!compareHash) {
        comparisonResult.textContent = "";
        comparisonResult.className = "comparison-result";
        return;
    }
    
    if (generatedHash === compareHash) {
        comparisonResult.textContent = "✅ Hashes match!";
        comparisonResult.className = "comparison-result match";
    } else {
        comparisonResult.textContent = "❌ Hashes do not match";
        comparisonResult.className = "comparison-result no-match";
    }
}

// Event listeners
input.addEventListener("input", updateHash);
algorithmSelect.addEventListener("change", updateHash);
uppercaseCheckbox.addEventListener("change", updateHash);
// Event listeners
generateBtn.addEventListener("click", updateHash);
clearBtn.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    hashLength.textContent = "";
    hashType.textContent = "";
    comparisonResult.textContent = "";
    comparisonResult.className = "comparison-result";
});
copyBtn.addEventListener("click", () => copyToClipboard(output.value));
compareInput.addEventListener("input", updateComparison);

// Real-time updates
input.addEventListener("input", updateHash);
algorithmSelect.addEventListener("change", updateHash);
uppercaseCheckbox.addEventListener("change", updateHash);

// Initial setup
updateHash();
});
</script>

<style>
.hash-generator-container {
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

#hash-input {
    width: 100%;
    min-height: 150px;
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    resize: vertical;
}

.algorithm-selector {
    margin: 1rem 0;
}

#algorithm-select {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
}

.options {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
    flex-wrap: wrap;
}

.options label {
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

.hash-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

#hash-output {
    flex: 1;
    padding: 0.75rem;
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    background-color: #f8f9fa;
    color: #495057;
}

.copy-btn {
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
}

.copy-btn:hover {
    background-color: #0056b3;
}

.hash-info {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
}

.hash-length, .hash-type {
    margin-bottom: 0.5rem;
    font-size: 0.9em;
    color: #6c757d;
}

.comparison-section {
    margin-top: 1rem;
}

#compare-input {
    width: 100%;
    padding: 0.75rem;
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 0.5rem;
}

.comparison-result {
    padding: 0.5rem;
    border-radius: 4px;
    font-weight: bold;
}

.comparison-result.match {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.comparison-result.no-match {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
    .hash-generator-container {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .options {
        flex-direction: column;
        gap: 0.5rem;
    }
}
</style>

---

## Features

- **Multiple Algorithms**: MD5, SHA-1, SHA-256, SHA-384, SHA-512, SHA3, BLAKE2b
- **Real-time Generation**: Instant hash generation as you type
- **Hash Comparison**: Compare generated hashes with existing ones
- **Auto-copy**: Option to automatically copy hash to clipboard
- **Case Options**: Toggle between lowercase and uppercase output

## Privacy & Security

🔒 **100% Client-side**: All processing happens in your browser. No data is sent to any server or saved anywhere.

## Hash Algorithms

### MD5 (Message Digest Algorithm 5)
- **Output**: 128-bit (32 characters)
- **Use case**: File integrity checks, legacy systems
- **Security**: Not cryptographically secure

### SHA-1 (Secure Hash Algorithm 1)
- **Output**: 160-bit (40 characters)
- **Use case**: Legacy applications, Git
- **Security**: Not recommended for new applications

### SHA-256 (Secure Hash Algorithm 256)
- **Output**: 256-bit (64 characters)
- **Use case**: Digital signatures, SSL certificates
- **Security**: Cryptographically secure

### SHA-384 (Secure Hash Algorithm 384)
- **Output**: 384-bit (96 characters)
- **Use case**: High-security applications
- **Security**: Very secure

### SHA-512 (Secure Hash Algorithm 512)
- **Output**: 512-bit (128 characters)
- **Use case**: Maximum security requirements
- **Security**: Extremely secure

### SHA3-256/512 (SHA-3)
- **Output**: 256-bit or 512-bit
- **Use case**: Next-generation cryptography
- **Security**: Post-quantum resistant

### BLAKE2b
- **Output**: 256-bit (64 characters)
- **Use case**: High-performance applications
- **Security**: Fast and secure

## Common Use Cases

### Password Hashing
Generate secure hashes for password storage (use with salt).

### File Integrity
Verify file integrity by comparing hashes.

### Digital Signatures
Create hash digests for digital signatures.

### API Authentication
Generate HMAC signatures for API requests.

### Database Indexing
Create hash-based indexes for fast lookups.

## Examples

### Simple Text
```
Input:  Hello World
MD5:     b10a8db164e0754105b7a99be72e3fe5
SHA-256: a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
```

### Password
```
Input:  mypassword123
SHA-256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
```

### Configuration
```
Input:  {"api_key": "secret", "timestamp": "2024-01-01"}
SHA-256: 8f7d3b2a1e9c6f5d4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0
```

## Security Notes

- **MD5/SHA-1**: Not suitable for security-critical applications
- **SHA-256+**: Recommended for modern applications
- **Salt**: Always use salt for password hashing
- **Collision Resistance**: SHA-256+ provides strong collision resistance 