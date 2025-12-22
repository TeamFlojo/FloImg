# Image Workflows API Reference

## Generators

### OpenAI / DALL-E

**Route trigger**: photo, picture, illustration, scene, painting, artwork, creative

**Parameters**:
| Param | Type | Description | Default |
|-------|------|-------------|---------|
| `prompt` | string | Image description (auto-filled from intent) | - |
| `size` | string | "1024x1024", "1792x1024", "1024x1792" | "1024x1024" |
| `quality` | string | "standard" or "hd" | "standard" |
| `style` | string | "natural" or "vivid" | "vivid" |

**Example**:

```json
{
  "intent": "a futuristic city at sunset with flying cars",
  "params": { "size": "1792x1024", "quality": "hd" }
}
```

---

### QuickChart

**Route trigger**: chart, graph, plot, visualization, bar, line, pie

**Parameters** (required):
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | bar, line, pie, doughnut, radar, scatter, bubble, polarArea |
| `data` | object | { labels: [], datasets: [{ label, data, backgroundColor }] } |

**Optional**:
| Param | Type | Description |
|-------|------|-------------|
| `options` | object | Chart.js options for title, legend, scales |

**Example**:

```json
{
  "intent": "chart",
  "params": {
    "type": "bar",
    "data": {
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "datasets": [
        {
          "label": "Revenue",
          "data": [125000, 150000, 175000, 200000],
          "backgroundColor": ["#4ade80", "#22d3ee", "#a78bfa", "#f472b6"]
        }
      ]
    },
    "options": {
      "plugins": {
        "title": { "display": true, "text": "2024 Revenue by Quarter" }
      }
    }
  }
}
```

---

### Mermaid

**Route trigger**: flowchart, diagram, sequence, gantt, class diagram, state, ER

**Parameters** (required):
| Param | Type | Description |
|-------|------|-------------|
| `code` | string | Valid Mermaid diagram code |

**Example**:

```json
{
  "intent": "diagram",
  "params": {
    "code": "graph TD\n    A[User] --> B{Auth?}\n    B -->|Yes| C[Dashboard]\n    B -->|No| D[Login]"
  }
}
```

---

### QR

**Route trigger**: qr, qr code, barcode

**Parameters**:
| Param | Type | Description | Default |
|-------|------|-------------|---------|
| `text` | string | Content to encode | (from intent) |
| `width` | number | Size in pixels | 300 |
| `errorCorrectionLevel` | string | L, M, Q, H | M |
| `margin` | number | Quiet zone modules | 4 |

**Example**:

```json
{
  "intent": "QR code for https://floimg.com",
  "params": { "width": 400, "errorCorrectionLevel": "H" }
}
```

---

### Screenshot

**Route trigger**: screenshot, capture, webpage

**Parameters**:
| Param | Type | Description | Default |
|-------|------|-------------|---------|
| `url` | string | Webpage URL (required) | - |
| `fullPage` | boolean | Capture entire page | false |
| `width` | number | Viewport width | 1280 |
| `height` | number | Viewport height | 720 |
| `deviceScaleFactor` | number | Pixel density | 1 |

**Example**:

```json
{
  "intent": "screenshot",
  "params": {
    "url": "https://github.com",
    "fullPage": true,
    "width": 1440
  }
}
```

---

## Transform Operations

### resize

Scale image dimensions.

| Param    | Type   | Description                           | Default |
| -------- | ------ | ------------------------------------- | ------- |
| `width`  | number | Target width                          | -       |
| `height` | number | Target height                         | -       |
| `fit`    | string | cover, contain, fill, inside, outside | cover   |

### convert

Change image format.

| Param | Type   | Description                                          |
| ----- | ------ | ---------------------------------------------------- |
| `to`  | string | Target MIME type (image/png, image/jpeg, image/webp) |

### blur

Apply Gaussian blur.

| Param   | Type   | Description    | Range      |
| ------- | ------ | -------------- | ---------- |
| `sigma` | number | Blur intensity | 0.3 - 1000 |

### sharpen

Sharpen image edges.

| Param   | Type   | Description       | Default |
| ------- | ------ | ----------------- | ------- |
| `sigma` | number | Sharpen intensity | 1       |

### grayscale

Convert to grayscale. No parameters required.

### modulate

Adjust brightness, saturation, hue.

| Param        | Type   | Description                | Default |
| ------------ | ------ | -------------------------- | ------- |
| `brightness` | number | Multiplier (1 = no change) | 1       |
| `saturation` | number | Multiplier (1 = no change) | 1       |
| `hue`        | number | Rotation in degrees        | 0       |

### roundCorners

Add rounded corners.

| Param    | Type   | Description             |
| -------- | ------ | ----------------------- |
| `radius` | number | Corner radius in pixels |

### addText

Overlay text on image.

| Param   | Type   | Description  | Default    |
| ------- | ------ | ------------ | ---------- |
| `text`  | string | Text content | -          |
| `x`     | number | X position   | 10         |
| `y`     | number | Y position   | 10         |
| `size`  | number | Font size    | 24         |
| `color` | string | Text color   | #000000    |
| `font`  | string | Font family  | sans-serif |

### addCaption

Add a caption bar to image.

| Param        | Type   | Description      | Default         |
| ------------ | ------ | ---------------- | --------------- |
| `text`       | string | Caption text     | -               |
| `position`   | string | top or bottom    | bottom          |
| `background` | string | Background color | rgba(0,0,0,0.7) |
| `color`      | string | Text color       | #ffffff         |

### preset

Apply a filter preset.

| Param  | Type   | Description                      |
| ------ | ------ | -------------------------------- |
| `name` | string | vintage, vibrant, dramatic, soft |

---

## Save Destinations

| Type   | Format                    | Example                            |
| ------ | ------------------------- | ---------------------------------- |
| Local  | Relative or absolute path | `./output/image.png`               |
| S3     | s3://bucket/key           | `s3://my-bucket/images/hero.png`   |
| R2     | r2://bucket/key           | `r2://cdn-bucket/assets/logo.png`  |
| Tigris | tigris://bucket/key       | `tigris://media/uploads/photo.jpg` |

Cloud destinations require appropriate environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET` (optional default)
