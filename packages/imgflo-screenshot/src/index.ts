import type { ImageGenerator, ImageBlob } from "imgflo";
import { chromium, type Browser, type BrowserContext } from "playwright";

/**
 * Screenshot generator using Playwright headless browser
 *
 * Supports:
 * - Website screenshots (by URL)
 * - HTML rendering (raw HTML)
 * - Element screenshots (by selector)
 * - Custom viewport sizes
 * - Full page or viewport-only
 *
 * @example
 * ```typescript
 * import createClient from 'imgflo';
 * import screenshot from 'imgflo-screenshot';
 *
 * const imgflo = createClient();
 * imgflo.registerGenerator(screenshot());
 *
 * // Screenshot a website
 * const site = await imgflo.generate({
 *   generator: 'screenshot',
 *   params: {
 *     url: 'https://example.com',
 *     width: 1920,
 *     height: 1080
 *   }
 * });
 *
 * // Render HTML
 * const html = await imgflo.generate({
 *   generator: 'screenshot',
 *   params: {
 *     html: '<h1>Hello World</h1>',
 *     width: 800,
 *     height: 600
 *   }
 * });
 * ```
 */
export interface ScreenshotConfig {
  /** Reuse browser instance across screenshots (default: false) */
  persistent?: boolean;
  /** Browser launch options */
  launchOptions?: {
    headless?: boolean;
    args?: string[];
  };
  /** Default viewport width (default: 1280) */
  defaultWidth?: number;
  /** Default viewport height (default: 720) */
  defaultHeight?: number;
}

export interface ScreenshotParams extends Record<string, unknown> {
  /** URL to screenshot */
  url?: string;
  /** Raw HTML to render */
  html?: string;
  /** CSS selector to screenshot (instead of full page) */
  selector?: string;
  /** Viewport width */
  width?: number;
  /** Viewport height */
  height?: number;
  /** Take full page screenshot (default: false) */
  fullPage?: boolean;
  /** Wait for selector before taking screenshot */
  waitFor?: string;
  /** Wait time in milliseconds before screenshot */
  delay?: number;
  /** Device scale factor (default: 1) */
  deviceScaleFactor?: number;
  /** Output format: 'png' | 'jpeg' (default: 'png') */
  format?: 'png' | 'jpeg';
  /** JPEG quality 0-100 (only for jpeg format) */
  quality?: number;
}

/**
 * Create a screenshot generator instance
 */
export default function screenshot(config: ScreenshotConfig = {}): ImageGenerator {
  const {
    persistent = false,
    launchOptions = { headless: true },
    defaultWidth = 1280,
    defaultHeight = 720,
  } = config;

  let browser: Browser | null = null;
  let cachedContext: BrowserContext | null = null;

  const getBrowser = async (): Promise<Browser> => {
    if (persistent && browser) {
      return browser;
    }
    browser = await chromium.launch(launchOptions);
    return browser;
  };

  const getContext = async (width: number, height: number, deviceScaleFactor: number): Promise<BrowserContext> => {
    // For persistent mode, reuse context if viewport size matches
    // Otherwise, create new context each time
    if (!persistent || !cachedContext) {
      const browserInstance = await getBrowser();
      cachedContext = await browserInstance.newContext({
        viewport: { width, height },
        deviceScaleFactor,
      });
    }
    return cachedContext;
  };

  return {
    name: "screenshot",

    async generate(params: Record<string, unknown>): Promise<ImageBlob> {
      const {
        url,
        html,
        selector,
        width = defaultWidth,
        height = defaultHeight,
        fullPage = false,
        waitFor,
        delay,
        deviceScaleFactor = 1,
        format = 'png',
        quality = 90,
      } = params as ScreenshotParams;

      if (!url && !html) {
        throw new Error("Either 'url' or 'html' parameter is required");
      }

      const context = await getContext(
        width as number,
        height as number,
        deviceScaleFactor as number
      );

      const page = await context.newPage();

      try {
        // Load URL or HTML
        if (url) {
          await page.goto(url, { waitUntil: "networkidle" });
        } else if (html) {
          await page.setContent(html, { waitUntil: "networkidle" });
        }

        // Wait for selector if specified
        if (waitFor) {
          await page.waitForSelector(waitFor, { timeout: 30000 });
        }

        // Additional delay if specified
        if (delay) {
          await page.waitForTimeout(delay);
        }

        // Take screenshot
        let screenshotBytes: Buffer;

        if (selector) {
          // Screenshot specific element
          const element = await page.locator(selector).first();
          const bytes = await element.screenshot({
            type: format,
            ...(format === 'jpeg' && { quality }),
          });
          screenshotBytes = Buffer.from(bytes);
        } else {
          // Screenshot page
          const bytes = await page.screenshot({
            type: format,
            fullPage,
            ...(format === 'jpeg' && { quality }),
          });
          screenshotBytes = Buffer.from(bytes);
        }

        // Get actual dimensions
        const viewport = page.viewportSize() || { width: width as number, height: height as number };

        return {
          bytes: screenshotBytes,
          mime: format === 'jpeg' ? 'image/jpeg' : 'image/png',
          width: viewport.width,
          height: viewport.height,
          source: "screenshot:playwright",
          metadata: {
            url: url || undefined,
            selector: selector || undefined,
            fullPage,
            format,
          },
        };
      } finally {
        await page.close();

        // Close browser if not persistent
        if (!persistent && browser) {
          await browser.close();
          browser = null;
          cachedContext = null;
        }
      }
    },
  };
}

// Also export as named export for convenience
export { screenshot };
