---
description: Capture a screenshot of a webpage using Playwright
allowed-tools: mcp__floimg__generate_image, mcp__floimg__save_image
---

# Webpage Screenshot

Capture a screenshot of: "$ARGUMENTS"

## Instructions

1. **Parse the URL** and any options:
   - Full URL (add https:// if missing)
   - Viewport size preferences
   - Full page vs viewport only
   - Device emulation

2. **Call `generate_image`** with:
   - `intent`: "screenshot of [url]"
   - `params`:
     - `url`: The webpage URL (required)
     - `fullPage`: Capture entire page (default false)
     - `width`: Viewport width (default 1280)
     - `height`: Viewport height (default 720)
     - `deviceScaleFactor`: Retina scale (default 1)

3. **Report the result**:
   - Screenshot file path
   - Captured dimensions
   - Options for cropping or resizing

## Parameters

| Param               | Description                    | Default |
| ------------------- | ------------------------------ | ------- |
| `url`               | Webpage URL (required)         | -       |
| `fullPage`          | Capture entire scrollable page | false   |
| `width`             | Viewport width in pixels       | 1280    |
| `height`            | Viewport height in pixels      | 720     |
| `deviceScaleFactor` | Pixel density (2 for Retina)   | 1       |

## Example Calls

**Basic screenshot**:

```json
{
  "intent": "screenshot of https://github.com"
}
```

**Full page capture**:

```json
{
  "intent": "screenshot",
  "params": {
    "url": "https://docs.floimg.com",
    "fullPage": true
  }
}
```

**Mobile viewport**:

```json
{
  "intent": "screenshot",
  "params": {
    "url": "https://example.com",
    "width": 375,
    "height": 812,
    "deviceScaleFactor": 2
  }
}
```

**Desktop HD**:

```json
{
  "intent": "screenshot",
  "params": {
    "url": "https://example.com",
    "width": 1920,
    "height": 1080,
    "deviceScaleFactor": 1
  }
}
```

## Common Viewport Sizes

| Device        | Width | Height | Scale |
| ------------- | ----- | ------ | ----- |
| Desktop HD    | 1920  | 1080   | 1     |
| Desktop       | 1280  | 720    | 1     |
| Laptop        | 1366  | 768    | 1     |
| iPad Pro      | 1024  | 1366   | 2     |
| iPad          | 768   | 1024   | 2     |
| iPhone 14 Pro | 393   | 852    | 3     |
| iPhone SE     | 375   | 667    | 2     |

## Notes

- Requires `@teamflojo/floimg-screenshot` plugin
- First screenshot may take longer (browser launch)
- Some sites may block automated screenshots
- JavaScript executes before capture
