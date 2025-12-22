import { readFile, writeFile } from "fs/promises";
import { Command } from "commander";
import createClient from "../../index.js";
import { loadConfig } from "../../config/loader.js";
import { loadPlugin, showNpxTip } from "../utils/plugin-loader.js";

/**
 * Shorthand command for generating charts
 *
 * This command auto-installs @teamflojo/floimg-quickchart if not present.
 *
 * @example
 * ```bash
 * # Bar chart with inline data
 * floimg chart bar --labels "Q1,Q2,Q3,Q4" --values "10,20,30,40" -o chart.png
 *
 * # Chart from JSON file
 * floimg chart line --data sales.json -o sales-chart.png
 *
 * # Pie chart with title
 * floimg chart pie --labels "A,B,C" --values "30,50,20" --title "Distribution"
 * ```
 */
export const chartCommand = new Command("chart")
  .description("Generate a chart (auto-installs @teamflojo/floimg-quickchart if needed)")
  .argument("<type>", "Chart type: bar, line, pie, doughnut, radar, polarArea, scatter")
  .option("-o, --out <path>", "Output file path (default: chart.png)", "chart.png")
  .option("-d, --data <file>", "JSON file with Chart.js data configuration")
  .option("-l, --labels <items>", "Comma-separated labels (e.g., 'Q1,Q2,Q3,Q4')")
  .option("-v, --values <items>", "Comma-separated values (e.g., '10,20,30,40')")
  .option("--title <text>", "Chart title")
  .option("-w, --width <pixels>", "Width in pixels", "500")
  .option("-h, --height <pixels>", "Height in pixels", "300")
  .option("--background <color>", "Background color", "transparent")
  .option("-f, --format <format>", "Output format: png, svg, webp", "png")
  .option("--no-auto-install", "Don't prompt to install missing plugins")
  .option("--config <path>", "Path to config file")
  .action(async (type, options) => {
    try {
      const config = await loadConfig(options.config);
      const client = createClient(config);

      // Load the QuickChart plugin (auto-installs if needed)
      const quickchartPlugin = await loadPlugin<{ default: () => unknown }>(
        "quickchart",
        options.autoInstall !== false
      );

      if (!quickchartPlugin) {
        process.exit(1);
      }

      client.registerGenerator(
        quickchartPlugin.default() as Parameters<typeof client.registerGenerator>[0]
      );

      // Build chart data
      let chartData: Record<string, unknown>;

      if (options.data) {
        // Load from JSON file
        const fileContent = await readFile(options.data, "utf-8");
        chartData = JSON.parse(fileContent);
      } else if (options.labels && options.values) {
        // Build from command line options
        const labels = options.labels.split(",").map((s: string) => s.trim());
        const values = options.values.split(",").map((s: string) => parseFloat(s.trim()));

        chartData = {
          labels,
          datasets: [
            {
              label: options.title || "Data",
              data: values,
            },
          ],
        };
      } else {
        console.error("Error: Provide --data <file> or both --labels and --values");
        console.error("");
        console.error("Examples:");
        console.error('  floimg chart bar --labels "A,B,C" --values "10,20,30" -o chart.png');
        console.error("  floimg chart line --data sales.json -o chart.png");
        process.exit(1);
      }

      // Build chart options
      const chartOptions: Record<string, unknown> = {};
      if (options.title) {
        chartOptions.plugins = {
          title: {
            display: true,
            text: options.title,
          },
        };
      }

      const blob = await client.generate({
        generator: "quickchart",
        params: {
          type,
          data: chartData,
          options: chartOptions,
          width: parseInt(options.width, 10),
          height: parseInt(options.height, 10),
          backgroundColor: options.background,
          format: options.format,
        },
      });

      // Determine output path with correct extension
      let outPath = options.out;
      const extMap: Record<string, string> = {
        png: ".png",
        svg: ".svg",
        webp: ".webp",
      };
      if (outPath === "chart.png" && options.format !== "png") {
        outPath = `chart${extMap[options.format] || ".png"}`;
      }

      if (outPath.includes("://")) {
        // Cloud storage
        const result = await client.save(blob, outPath);
        console.log(`✅ Chart saved to: ${result.location}`);
      } else {
        // Local file
        await writeFile(outPath, blob.bytes);
        console.log(`✅ Chart saved to: ${outPath}`);
      }

      // Show tip for npx users
      showNpxTip();
    } catch (error) {
      console.error("Error generating chart:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
