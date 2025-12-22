---
description: Generate a QR code for a URL, text, or data
allowed-tools: mcp__floimg__generate_image, mcp__floimg__save_image
---

# QR Code Generation

Generate a QR code for: "$ARGUMENTS"

## Instructions

1. **Extract the content** to encode:
   - URL (https://...)
   - Plain text
   - Contact info (vCard)
   - WiFi credentials

2. **Call `generate_image`** with:
   - `intent`: "QR code for [content]"
   - `params` (optional):
     - `text`: Content to encode (if not in intent)
     - `width`: Size in pixels (default 300)
     - `errorCorrectionLevel`: L, M, Q, H (default M)
     - `margin`: Quiet zone modules (default 4)

3. **Report the result**:
   - Image path
   - What content is encoded
   - Options for resizing or cloud upload

## Parameters

| Param                  | Description                       | Default       |
| ---------------------- | --------------------------------- | ------------- |
| `text`                 | Content to encode                 | (from intent) |
| `width`                | Size in pixels                    | 300           |
| `errorCorrectionLevel` | L (7%), M (15%), Q (25%), H (30%) | M             |
| `margin`               | Quiet zone size                   | 4             |

## Error Correction Levels

| Level | Recovery | Use When                     |
| ----- | -------- | ---------------------------- |
| L     | 7%       | Clean environments, max data |
| M     | 15%      | General use (recommended)    |
| Q     | 25%      | Some expected damage         |
| H     | 30%      | Logos/images will overlay    |

## Example Calls

**Simple URL**:

```json
{
  "intent": "QR code for https://floimg.com"
}
```

**High resolution with max error correction**:

```json
{
  "intent": "QR code",
  "params": {
    "text": "https://floimg.com/getting-started",
    "width": 500,
    "errorCorrectionLevel": "H"
  }
}
```

**WiFi credentials**:

```json
{
  "intent": "QR code",
  "params": {
    "text": "WIFI:T:WPA;S:MyNetwork;P:MyPassword;;",
    "width": 400
  }
}
```

## Content Types

| Type       | Format                                  |
| ---------- | --------------------------------------- |
| URL        | `https://example.com`                   |
| Plain text | Any text string                         |
| WiFi       | `WIFI:T:WPA;S:NetworkName;P:Password;;` |
| vCard      | `BEGIN:VCARD...END:VCARD`               |
| Email      | `mailto:user@example.com`               |
| Phone      | `tel:+1234567890`                       |
| SMS        | `sms:+1234567890?body=Hello`            |
