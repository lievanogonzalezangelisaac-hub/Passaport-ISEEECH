# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Architecture & Threat Model

This application is designed as a **Privacy-First, Client-Side Only** interactive passport and digital stamp system. It has been hardened against common web application vulnerabilities:

### 1. Zero External Data Exfiltration (Privacy by Design)
- **Local Isolation:** All traveler biodata, passport numbers, and collected stamps reside strictly inside the user's browser device (`localStorage`).
- **No Remote Telemetry or Tracking:** The application does not transmit names, identifiers, or location data to any third-party analytics or external servers.
- **Data Purge Control:** Users have full control to securely erase all stored passport biodata and custom presets directly from the interface or via the application reset flow.

### 2. QR Code & Input Sanitization
- **Strict Payload Validation:** Scanned QR payloads and manual inputs are parsed using schema validation (`src/utils/security.ts`) that strictly enforces maximum lengths, alphanumeric constraints, and whitelisted categories.
- **Prototype Pollution Prevention:** Object keys such as `__proto__`, `constructor`, and `prototype` are stripped to prevent prototype pollution attacks.
- **Length Caps:** QR payloads are restricted to a maximum of 4 KB to prevent Denial of Service (DoS) and memory exhaustion.

### 3. Image Upload Security
- **Raster-Only Verification:** File uploads for QR decoding strictly require raster image formats (`PNG`, `JPEG`, `WebP`).
- **Vector/SVG Injection Defense:** Vector formats (`SVG`, `XML`, `HTML`) are rejected to prevent Cross-Site Scripting (XSS), script execution, and Billion Laughs XML entity attacks.
- **Memory-Safe Object URLs:** Images are processed via temporary Object URLs (`URL.createObjectURL`) that are immediately revoked to prevent memory leaks and memory spikes.

### 4. Content Security Policy (CSP) & Permissions
- Strict Content Security Policy configured in `index.html`:
  - `default-src 'self'`
  - `img-src 'self' data: blob:` (eliminates image beacon tracking and data exfiltration)
  - `frame-src 'none'` (prevents clickjacking and unauthorized iframe embeddings)
  - `object-src 'none'`
  - Restrictive `Permissions-Policy` disabling microphone, payment, geolocation, and device sensors.

## Reporting a Vulnerability

If you discover a potential security vulnerability within this project, please report it responsibly:

1. **Do not create a public GitHub issue.**
2. Send an email with a detailed explanation and reproduction steps to the repository maintainer.
3. Allow reasonable time for the maintainer to address and verify the fix before public disclosure.
