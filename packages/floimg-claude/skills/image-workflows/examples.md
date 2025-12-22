# Image Workflows Examples

## Data Visualization

### Sales Dashboard Chart

```
User: "Create a bar chart showing our quarterly revenue: Q1 $125K, Q2 $150K, Q3 $175K, Q4 $200K"

generate_image({
  intent: "bar chart",
  params: {
    type: "bar",
    data: {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [{
        label: "Revenue ($K)",
        data: [125, 150, 175, 200],
        backgroundColor: ["#4ade80", "#22d3ee", "#a78bfa", "#f472b6"]
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: "2024 Quarterly Revenue" }
      }
    }
  }
})
```

### Pie Chart with Percentages

```
User: "Pie chart of market share: Us 45%, Competitor A 30%, Others 25%"

generate_image({
  intent: "pie chart",
  params: {
    type: "pie",
    data: {
      labels: ["Us", "Competitor A", "Others"],
      datasets: [{
        data: [45, 30, 25],
        backgroundColor: ["#22c55e", "#3b82f6", "#94a3b8"]
      }]
    }
  }
})
```

---

## Technical Diagrams

### User Authentication Flow

```
User: "Flowchart showing user login: enter credentials -> validate -> success or show error"

generate_image({
  intent: "flowchart",
  params: {
    code: `graph TD
    A[Enter Credentials] --> B{Valid?}
    B -->|Yes| C[Generate Token]
    C --> D[Redirect to Dashboard]
    B -->|No| E[Show Error]
    E --> A`
  }
})
```

### API Sequence Diagram

```
User: "Sequence diagram of checkout flow: user -> cart -> payment -> confirmation"

generate_image({
  intent: "sequence diagram",
  params: {
    code: `sequenceDiagram
    participant U as User
    participant C as Cart API
    participant P as Payment API
    participant O as Order API

    U->>C: Add items
    C-->>U: Cart updated
    U->>P: Submit payment
    P->>P: Process
    P-->>U: Payment confirmed
    U->>O: Create order
    O-->>U: Order confirmation`
  }
})
```

### Microservices Architecture

```
User: "Architecture diagram showing frontend, API gateway, and three microservices"

generate_image({
  intent: "architecture diagram",
  params: {
    code: `graph LR
    subgraph Frontend
        Web[React App]
        Mobile[Mobile App]
    end

    subgraph Gateway
        API[API Gateway]
    end

    subgraph Services
        Auth[Auth Service]
        Users[User Service]
        Orders[Order Service]
    end

    subgraph Data
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end

    Web --> API
    Mobile --> API
    API --> Auth
    API --> Users
    API --> Orders
    Auth --> Cache
    Users --> DB
    Orders --> DB`
  }
})
```

---

## Social Media Assets

### Open Graph Image Pipeline

```
User: "Create a hero image for my AI blog post, sized for Twitter/LinkedIn"

run_pipeline({
  steps: [
    {
      generate: {
        intent: "futuristic AI neural network visualization, blue and purple gradient, tech aesthetic",
        params: { size: "1792x1024", quality: "hd" }
      }
    },
    {
      transform: {
        operation: "resize",
        params: { width: 1200, height: 630 }
      }
    },
    {
      transform: {
        operation: "addCaption",
        params: {
          text: "The Future of AI Development",
          position: "bottom",
          background: "rgba(0,0,0,0.8)"
        }
      }
    },
    {
      save: { destination: "s3://blog-assets/og/ai-future.png" }
    }
  ]
})
```

### Instagram Square Post

```
User: "Create an inspirational quote image for Instagram"

run_pipeline({
  steps: [
    {
      generate: {
        intent: "abstract gradient background, soft pastels, minimal",
        params: { size: "1024x1024" }
      }
    },
    {
      transform: {
        operation: "addText",
        params: {
          text: "Build something\npeople love.",
          x: 100,
          y: 400,
          size: 72,
          color: "#1a1a1a"
        }
      }
    },
    {
      save: { destination: "./social/instagram-quote.png" }
    }
  ]
})
```

---

## Product & Marketing

### QR Code for Marketing Campaign

```
User: "Create a high-quality QR code for our campaign landing page"

generate_image({
  intent: "QR code for https://campaign.example.com/summer2024",
  params: {
    width: 500,
    errorCorrectionLevel: "H",
    margin: 2
  },
  saveTo: "./marketing/campaign-qr.png"
})
```

### Product Thumbnail Set

```
User: "Generate a product photo and create thumbnails at 100, 200, and 400px"

// First generate the product image
generate_image({
  intent: "minimal product photography, white sneaker on white background, studio lighting"
})

// Then create size variants (using returned imageId)
transform_image({ imageId: "img_xxx", operation: "resize", params: { width: 400 } })
save_image({ imageId: "current", destination: "./products/shoe-400.png" })

transform_image({ imageId: "img_xxx", operation: "resize", params: { width: 200 } })
save_image({ imageId: "current", destination: "./products/shoe-200.png" })

transform_image({ imageId: "img_xxx", operation: "resize", params: { width: 100 } })
save_image({ imageId: "current", destination: "./products/shoe-100.png" })
```

---

## Documentation & Screenshots

### Capture Competitor Landing Page

```
User: "Screenshot the homepage of stripe.com, full page"

generate_image({
  intent: "screenshot",
  params: {
    url: "https://stripe.com",
    fullPage: true,
    width: 1440,
    deviceScaleFactor: 2
  },
  saveTo: "./research/stripe-homepage.png"
})
```

### Mobile App Screenshot

```
User: "Capture our app's mobile view at iPhone 14 size"

generate_image({
  intent: "screenshot",
  params: {
    url: "https://app.example.com",
    width: 393,
    height: 852,
    deviceScaleFactor: 3
  }
})
```

---

## Image Analysis

### Analyze Existing Image

```
User: "What's in this chart image?"

analyze_image({
  imageId: "img_xxx",  // or imagePath: "./chart.png"
  prompt: "Describe what data this chart is showing. What are the key insights?"
})
```

### Competitive Analysis

```
User: "Screenshot competitor's pricing page and summarize their tiers"

// First capture
generate_image({
  intent: "screenshot",
  params: { url: "https://competitor.com/pricing", fullPage: true }
})

// Then analyze
analyze_image({
  imageId: "current",
  prompt: "List all pricing tiers shown, their prices, and key features of each tier."
})
```

---

## Tips for Best Results

1. **Charts**: Always structure data properly with labels and datasets
2. **Diagrams**: Use Mermaid syntax reference for complex diagrams
3. **AI Images**: Be specific with style, lighting, and composition
4. **Screenshots**: Use fullPage for documentation, viewport for previews
5. **Pipelines**: Order transforms logically (resize last for quality)
6. **Cloud saves**: Ensure environment variables are configured
