/**
 * Comprehensive example showing all imgflo plugins working together
 *
 * This demonstrates:
 * 1. Shapes (built-in)
 * 2. OpenAI DALL-E (built-in)
 * 3. QuickChart (plugin)
 * 4. Mermaid (plugin)
 * 5. Screenshot (plugin)
 *
 * Each generator uses pass-through pattern - native library formats with no abstraction.
 */

import createClient from '../packages/imgflo/src/index.js';
import quickchart from '../packages/imgflo-quickchart/src/index.js';
import mermaid from '../packages/imgflo-mermaid/src/index.js';
import screenshot from '../packages/imgflo-screenshot/src/index.js';

async function main() {
  // Create client with filesystem storage for testing
  const imgflo = createClient({
    verbose: true,
    store: {
      default: 'fs',
      fs: {
        basePath: './output',
        baseUrl: 'file://./output'
      }
    }
  });

  // Register all plugins
  imgflo.registerGenerator(quickchart());
  imgflo.registerGenerator(mermaid());
  imgflo.registerGenerator(screenshot());

  console.log('🎨 imgflo - All Plugins Demo\n');

  // ====================================================================
  // 1. SHAPES (Built-in, zero dependencies)
  // ====================================================================
  console.log('1️⃣  Generating SVG gradient with built-in shapes generator...');
  const gradient = await imgflo.generate({
    generator: 'shapes',
    params: {
      type: 'gradient',
      width: 1200,
      height: 630,
      color1: '#667eea',
      color2: '#764ba2'
    }
  });

  const gradientPng = await imgflo.transform({
    blob: gradient,
    op: 'convert',
    to: 'image/png'
  });

  await imgflo.upload({
    blob: gradientPng,
    key: 'shapes-gradient.png'
  });

  console.log('   ✓ Saved shapes-gradient.png\n');

  // ====================================================================
  // 2. QUICKCHART (Plugin, Chart.js pass-through)
  // ====================================================================
  console.log('2️⃣  Generating bar chart with QuickChart (Chart.js)...');
  const barChart = await imgflo.generate({
    generator: 'quickchart',
    params: {
      // Pure Chart.js configuration - no imgflo abstraction
      type: 'bar',
      data: {
        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
        datasets: [{
          label: 'Revenue ($M)',
          data: [12, 19, 15, 22],
          backgroundColor: 'rgba(102, 126, 234, 0.6)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Quarterly Revenue 2024'
          }
        }
      }
    }
  });

  await imgflo.upload({
    blob: barChart,
    key: 'quickchart-revenue.png'
  });

  console.log('   ✓ Saved quickchart-revenue.png\n');

  // ====================================================================
  // 3. QUICKCHART - Line Chart
  // ====================================================================
  console.log('3️⃣  Generating line chart with QuickChart...');
  const lineChart = await imgflo.generate({
    generator: 'quickchart',
    params: {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: '2023',
            data: [65, 59, 80, 81, 56, 55],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: '2024',
            data: [28, 48, 40, 19, 86, 27],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      }
    }
  });

  await imgflo.upload({
    blob: lineChart,
    key: 'quickchart-line.png'
  });

  console.log('   ✓ Saved quickchart-line.png\n');

  // ====================================================================
  // 4. MERMAID (Plugin, Mermaid syntax pass-through)
  // ====================================================================
  console.log('4️⃣  Generating flowchart with Mermaid...');
  const flowchart = await imgflo.generate({
    generator: 'mermaid',
    params: {
      // Pure Mermaid syntax - no imgflo abstraction
      code: `
        graph TD
          A[User Request] --> B{Valid?}
          B -->|Yes| C[Generate Image]
          B -->|No| D[Return Error]
          C --> E[Transform]
          E --> F[Upload to S3]
          F --> G[Return URL]
      `,
      theme: 'dark',
      backgroundColor: 'transparent'
    }
  });

  await imgflo.upload({
    blob: flowchart,
    key: 'mermaid-flow.svg'
  });

  console.log('   ✓ Saved mermaid-flow.svg\n');

  // ====================================================================
  // 5. MERMAID - Sequence Diagram
  // ====================================================================
  console.log('5️⃣  Generating sequence diagram with Mermaid...');
  const sequence = await imgflo.generate({
    generator: 'mermaid',
    params: {
      code: `
        sequenceDiagram
          participant User
          participant imgflo
          participant QuickChart
          participant S3

          User->>imgflo: generate({ generator: 'quickchart', ... })
          imgflo->>QuickChart: POST chart config
          QuickChart-->>imgflo: PNG bytes
          imgflo->>imgflo: transform to desired format
          imgflo->>S3: upload(blob, key)
          S3-->>imgflo: URL
          imgflo-->>User: { url: 'https://...' }
      `,
      theme: 'neutral'
    }
  });

  await imgflo.upload({
    blob: sequence,
    key: 'mermaid-sequence.svg'
  });

  console.log('   ✓ Saved mermaid-sequence.svg\n');

  // ====================================================================
  // 6. SCREENSHOT (Plugin, HTML rendering)
  // ====================================================================
  console.log('6️⃣  Generating OG image with Screenshot (HTML)...');
  const ogImage = await imgflo.generate({
    generator: 'screenshot',
    params: {
      html: `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                width: 1200px;
                height: 630px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
              }
              h1 {
                font-size: 72px;
                margin: 0 0 20px 0;
                font-weight: 800;
              }
              p {
                font-size: 32px;
                opacity: 0.9;
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div>
              <h1>imgflo</h1>
              <p>Image generation for AI agents</p>
            </div>
          </body>
        </html>
      `,
      width: 1200,
      height: 630
    }
  });

  await imgflo.upload({
    blob: ogImage,
    key: 'screenshot-og.png'
  });

  console.log('   ✓ Saved screenshot-og.png\n');

  // ====================================================================
  // 7. SCREENSHOT - Website capture
  // ====================================================================
  console.log('7️⃣  Capturing website screenshot...');
  const website = await imgflo.generate({
    generator: 'screenshot',
    params: {
      url: 'https://example.com',
      width: 1280,
      height: 800,
      waitFor: 'body' // Wait for body to load
    }
  });

  await imgflo.upload({
    blob: website,
    key: 'screenshot-example.png'
  });

  console.log('   ✓ Saved screenshot-example.png\n');

  // ====================================================================
  // Summary
  // ====================================================================
  console.log('✨ All generators tested successfully!\n');
  console.log('📁 Output directory: ./output/\n');
  console.log('Generated files:');
  console.log('  • shapes-gradient.png      - SVG shapes (built-in)');
  console.log('  • quickchart-revenue.png   - Bar chart (Chart.js)');
  console.log('  • quickchart-line.png      - Line chart (Chart.js)');
  console.log('  • mermaid-flow.svg         - Flowchart (Mermaid)');
  console.log('  • mermaid-sequence.svg     - Sequence diagram (Mermaid)');
  console.log('  • screenshot-og.png        - HTML render (Playwright)');
  console.log('  • screenshot-example.png   - Website capture (Playwright)\n');

  console.log('🎯 Key Takeaway:');
  console.log('   Each generator uses native library formats with ZERO imgflo abstraction.');
  console.log('   - QuickChart: Pure Chart.js config');
  console.log('   - Mermaid: Pure Mermaid syntax');
  console.log('   - Screenshot: Standard HTML/CSS');
  console.log('   This is the "glue, not the engine" philosophy in action! 🚀\n');
}

main().catch(console.error);
