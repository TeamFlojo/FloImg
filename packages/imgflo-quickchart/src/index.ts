import type { ImageGenerator, ImageBlob } from "imgflo";

/**
 * QuickChart generator - creates charts using Chart.js via QuickChart.io API
 *
 * This generator accepts Chart.js configuration directly (pass-through pattern).
 * No imgflo abstraction - you get full Chart.js capabilities.
 *
 * @see https://www.chartjs.org/docs/ - Chart.js documentation
 * @see https://quickchart.io/documentation/ - QuickChart API docs
 *
 * @example
 * ```typescript
 * import createClient from 'imgflo';
 * import quickchart from 'imgflo-quickchart';
 *
 * const imgflo = createClient();
 * imgflo.registerGenerator(quickchart());
 *
 * const chart = await imgflo.generate({
 *   generator: 'quickchart',
 *   params: {
 *     type: 'bar',
 *     data: {
 *       labels: ['Q1', 'Q2', 'Q3', 'Q4'],
 *       datasets: [{
 *         label: 'Revenue',
 *         data: [12, 19, 3, 5]
 *       }]
 *     }
 *   }
 * });
 * ```
 */
export interface QuickChartConfig {
  /** QuickChart API endpoint (defaults to https://quickchart.io) */
  apiUrl?: string;
  /** Image width in pixels (default: 500) */
  width?: number;
  /** Image height in pixels (default: 300) */
  height?: number;
  /** Background color (default: transparent) */
  backgroundColor?: string;
  /** Device pixel ratio for high DPI (default: 1.0) */
  devicePixelRatio?: number;
  /** Output format: 'png' | 'svg' | 'webp' (default: 'png') */
  format?: 'png' | 'svg' | 'webp';
}

export interface QuickChartParams extends Record<string, unknown> {
  /** Chart.js chart type */
  type?: string;
  /** Chart.js data object */
  data?: Record<string, unknown>;
  /** Chart.js options object */
  options?: Record<string, unknown>;
  /** Override width for this chart */
  width?: number;
  /** Override height for this chart */
  height?: number;
  /** Override background color */
  backgroundColor?: string;
  /** Override format */
  format?: 'png' | 'svg' | 'webp';
}

/**
 * Create a QuickChart generator instance
 */
export default function quickchart(config: QuickChartConfig = {}): ImageGenerator {
  const {
    apiUrl = "https://quickchart.io",
    width: defaultWidth = 500,
    height: defaultHeight = 300,
    backgroundColor: defaultBgColor = "transparent",
    devicePixelRatio = 1.0,
    format: defaultFormat = "png",
  } = config;

  return {
    name: "quickchart",

    async generate(params: Record<string, unknown>): Promise<ImageBlob> {
      const {
        width = defaultWidth,
        height = defaultHeight,
        backgroundColor = defaultBgColor,
        format = defaultFormat,
        ...chartConfig
      } = params as QuickChartParams;

      // Build Chart.js config (pass-through)
      const chart = {
        type: chartConfig.type || "bar",
        data: chartConfig.data || {},
        options: chartConfig.options || {},
      };

      // Build QuickChart URL
      const url = new URL(`${apiUrl}/chart`);
      url.searchParams.set("c", JSON.stringify(chart));
      url.searchParams.set("w", String(width));
      url.searchParams.set("h", String(height));
      url.searchParams.set("bkg", backgroundColor);
      url.searchParams.set("devicePixelRatio", String(devicePixelRatio));
      url.searchParams.set("f", format);

      // Fetch chart image
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(
          `QuickChart API error: ${response.status} ${response.statusText}`
        );
      }

      const bytes = Buffer.from(await response.arrayBuffer());

      // Determine MIME type
      const mimeMap = {
        png: "image/png" as const,
        svg: "image/svg+xml" as const,
        webp: "image/webp" as const,
      };

      return {
        bytes,
        mime: mimeMap[format] || mimeMap.png,
        width: width as number,
        height: height as number,
        source: "quickchart",
        metadata: {
          chartType: chart.type,
          format,
        },
      };
    },
  };
}

// Also export as named export for convenience
export { quickchart };
