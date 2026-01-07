import { describe, it, expect } from "vitest";
import { ShapesProvider } from "../src/providers/svg/shapes.js";

describe("ShapesProvider", () => {
  const provider = new ShapesProvider();

  describe("new schema - shape types", () => {
    it("should generate rectangle with solid fill by default", async () => {
      const result = await provider.generate({});

      expect(result.mime).toBe("image/svg+xml");
      expect(result.width).toBe(1200);
      expect(result.height).toBe(630);
      expect(result.source).toBe("svg:shapes:rectangle:solid");

      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<rect");
      expect(svg).toContain('fill="#0D9488"'); // FloImg brand teal
    });

    it("should generate circle", async () => {
      const result = await provider.generate({ shapeType: "circle" });

      expect(result.source).toBe("svg:shapes:circle:solid");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<circle");
    });

    it("should generate ellipse", async () => {
      const result = await provider.generate({ shapeType: "ellipse" });

      expect(result.source).toBe("svg:shapes:ellipse:solid");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<ellipse");
    });

    it("should generate triangle", async () => {
      const result = await provider.generate({ shapeType: "triangle" });

      expect(result.source).toBe("svg:shapes:triangle:solid");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<polygon");
      // Triangle has 3 points
      const points = svg.match(/points="([^"]+)"/)?.[1].split(" ");
      expect(points).toHaveLength(3);
    });

    it("should generate polygon with custom sides", async () => {
      const result = await provider.generate({ shapeType: "polygon", sides: 8 });

      expect(result.source).toBe("svg:shapes:polygon:solid");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<polygon");
      // Octagon has 8 points
      const points = svg.match(/points="([^"]+)"/)?.[1].split(" ");
      expect(points).toHaveLength(8);
    });

    it("should generate star with custom points", async () => {
      const result = await provider.generate({ shapeType: "star", points: 6 });

      expect(result.source).toBe("svg:shapes:star:solid");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<polygon");
      // 6-point star has 12 vertices (outer and inner alternating)
      const svgPoints = svg.match(/points="([^"]+)"/)?.[1].split(" ");
      expect(svgPoints).toHaveLength(12);
    });
  });

  describe("new schema - fill types", () => {
    it("should generate solid fill with custom color", async () => {
      const result = await provider.generate({
        shapeType: "rectangle",
        fillType: "solid",
        fillColor: "#FF0000",
      });

      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain('fill="#FF0000"');
    });

    it("should generate linear gradient fill", async () => {
      const result = await provider.generate({
        shapeType: "circle",
        fillType: "gradient",
        gradientColor1: "#FF0000",
        gradientColor2: "#0000FF",
      });

      expect(result.source).toBe("svg:shapes:circle:gradient");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<linearGradient");
      expect(svg).toContain("#FF0000");
      expect(svg).toContain("#0000FF");
    });

    it("should generate radial gradient fill", async () => {
      const result = await provider.generate({
        shapeType: "circle",
        fillType: "gradient",
        gradientType: "radial",
      });

      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<radialGradient");
    });

    it("should generate pattern fill", async () => {
      const result = await provider.generate({
        shapeType: "rectangle",
        fillType: "pattern",
        patternType: "dots",
      });

      expect(result.source).toBe("svg:shapes:rectangle:pattern");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<pattern");
    });

    it("should generate checkerboard pattern", async () => {
      const result = await provider.generate({
        shapeType: "rectangle",
        fillType: "pattern",
        patternType: "checkerboard",
      });

      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<pattern");
    });

    it("should generate no fill", async () => {
      const result = await provider.generate({
        shapeType: "circle",
        fillType: "none",
        strokeWidth: 2,
      });

      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain('fill="none"');
    });
  });

  describe("new schema - stroke", () => {
    it("should add stroke when strokeWidth > 0", async () => {
      const result = await provider.generate({
        shapeType: "circle",
        strokeColor: "#000000",
        strokeWidth: 3,
      });

      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain('stroke="#000000"');
      expect(svg).toContain('stroke-width="3"');
    });

    it("should not add stroke when strokeWidth = 0", async () => {
      const result = await provider.generate({
        shapeType: "circle",
        strokeWidth: 0,
      });

      const svg = result.bytes.toString("utf-8");
      expect(svg).not.toContain("stroke=");
    });
  });

  describe("new schema - transforms", () => {
    it("should apply rotation", async () => {
      const result = await provider.generate({
        shapeType: "rectangle",
        rotation: 45,
      });

      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("transform=");
      expect(svg).toContain("rotate(45");
    });

    it("should not add transform when rotation = 0", async () => {
      const result = await provider.generate({
        shapeType: "rectangle",
        rotation: 0,
      });

      const svg = result.bytes.toString("utf-8");
      expect(svg).not.toContain("transform=");
    });
  });

  describe("legacy parameter migration", () => {
    it("should migrate legacy gradient type", async () => {
      const result = await provider.generate({
        type: "gradient",
        color1: "#FF0000",
        color2: "#0000FF",
      });

      expect(result.source).toBe("svg:shapes:rectangle:gradient");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("#FF0000");
      expect(svg).toContain("#0000FF");
    });

    it("should migrate legacy circle type", async () => {
      const result = await provider.generate({
        type: "circle",
        fill: "#00FF00",
      });

      expect(result.source).toBe("svg:shapes:circle:solid");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<circle");
      expect(svg).toContain("#00FF00");
    });

    it("should migrate legacy rectangle type", async () => {
      const result = await provider.generate({
        type: "rectangle",
        fill: "#0000FF",
        rx: 10,
      });

      expect(result.source).toBe("svg:shapes:rectangle:solid");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<rect");
      expect(svg).toContain("#0000FF");
      expect(svg).toContain('rx="10"');
    });

    it("should migrate legacy pattern type", async () => {
      const result = await provider.generate({
        type: "pattern",
        patternType: "stripes",
      });

      expect(result.source).toBe("svg:shapes:rectangle:pattern");
      const svg = result.bytes.toString("utf-8");
      expect(svg).toContain("<pattern");
    });
  });

  describe("error handling", () => {
    it("should throw for unknown shape type", async () => {
      await expect(provider.generate({ shapeType: "unknown" })).rejects.toThrow(
        "Unknown shape type: unknown"
      );
    });

    it("should throw for unknown fill type", async () => {
      await expect(provider.generate({ fillType: "unknown" })).rejects.toThrow(
        "Unknown fill type: unknown"
      );
    });

    it("should throw for unknown pattern type", async () => {
      await expect(
        provider.generate({ fillType: "pattern", patternType: "unknown" })
      ).rejects.toThrow("Unknown pattern type: unknown");
    });
  });
});
