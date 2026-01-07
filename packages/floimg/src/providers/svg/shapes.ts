import type { SvgProvider, ImageBlob, GeneratorSchema } from "../../core/types.js";
import { GenerationError } from "../../core/errors.js";

/**
 * Schema for the shapes generator
 *
 * Separates shape type (geometry) from fill type (how it's colored).
 * This matches users' mental model from design tools like Figma/Sketch.
 */
export const shapesSchema: GeneratorSchema = {
  name: "shapes",
  description: "Generate SVG shapes with customizable fills and strokes",
  category: "Basic",
  parameters: {
    // === Geometry ===
    shapeType: {
      type: "string",
      title: "Shape",
      description: "Geometric shape to generate",
      enum: ["rectangle", "circle", "ellipse", "triangle", "polygon", "star"],
      default: "rectangle",
    },
    width: {
      type: "number",
      title: "Width",
      description: "Canvas width in pixels",
      default: 1200,
      minimum: 1,
      maximum: 4096,
    },
    height: {
      type: "number",
      title: "Height",
      description: "Canvas height in pixels",
      default: 630,
      minimum: 1,
      maximum: 4096,
    },

    // === Shape-specific parameters ===
    sides: {
      type: "number",
      title: "Sides",
      description: "Number of sides (polygon only)",
      default: 6,
      minimum: 3,
      maximum: 20,
    },
    points: {
      type: "number",
      title: "Points",
      description: "Number of points (star only)",
      default: 5,
      minimum: 3,
      maximum: 20,
    },
    innerRadius: {
      type: "number",
      title: "Inner Radius",
      description: "Inner radius ratio for star (0-1)",
      default: 0.5,
      minimum: 0.1,
      maximum: 0.9,
    },
    cornerRadius: {
      type: "number",
      title: "Corner Radius",
      description: "Corner radius for rectangle",
      default: 0,
      minimum: 0,
    },

    // === Fill ===
    fillType: {
      type: "string",
      title: "Fill",
      description: "How to fill the shape",
      enum: ["solid", "gradient", "pattern", "none"],
      default: "solid",
    },
    fillColor: {
      type: "string",
      title: "Fill Color",
      description: "Fill color (solid fill)",
      default: "#0D9488", // FloImg brand teal
    },

    // === Gradient options ===
    gradientType: {
      type: "string",
      title: "Gradient Type",
      description: "Type of gradient",
      enum: ["linear", "radial"],
      default: "linear",
    },
    gradientColor1: {
      type: "string",
      title: "Gradient Start",
      description: "Gradient start color",
      default: "#0D9488",
    },
    gradientColor2: {
      type: "string",
      title: "Gradient End",
      description: "Gradient end color",
      default: "#14B8A6",
    },
    gradientAngle: {
      type: "number",
      title: "Gradient Angle",
      description: "Gradient angle in degrees (linear only)",
      default: 135,
      minimum: 0,
      maximum: 360,
    },

    // === Pattern options ===
    patternType: {
      type: "string",
      title: "Pattern Type",
      description: "Type of pattern",
      enum: ["dots", "stripes", "grid", "checkerboard"],
      default: "dots",
    },
    patternColor: {
      type: "string",
      title: "Pattern Color",
      description: "Pattern foreground color",
      default: "#0D9488",
    },
    patternBackground: {
      type: "string",
      title: "Pattern Background",
      description: "Pattern background color",
      default: "#FAFAFA",
    },
    patternScale: {
      type: "number",
      title: "Pattern Scale",
      description: "Pattern repeat size in pixels",
      default: 40,
      minimum: 5,
      maximum: 200,
    },

    // === Stroke ===
    strokeColor: {
      type: "string",
      title: "Stroke Color",
      description: "Border color",
      default: "#000000",
    },
    strokeWidth: {
      type: "number",
      title: "Stroke Width",
      description: "Border width (0 = no stroke)",
      default: 0,
      minimum: 0,
      maximum: 100,
    },

    // === Transform ===
    rotation: {
      type: "number",
      title: "Rotation",
      description: "Rotation angle in degrees",
      default: 0,
      minimum: 0,
      maximum: 360,
    },
  },
  requiredParameters: [],
};

/**
 * SVG shapes provider for generating geometric shapes with various fills
 */
export class ShapesProvider implements SvgProvider {
  name = "shapes";
  schema = shapesSchema;

  async generate(params: Record<string, unknown>): Promise<ImageBlob> {
    const {
      shapeType = "rectangle",
      width = 1200,
      height = 630,
      fillType = "solid",
      fillColor = "#0D9488",
      gradientType = "linear",
      gradientColor1 = "#0D9488",
      gradientColor2 = "#14B8A6",
      gradientAngle = 135,
      patternType = "dots",
      patternColor = "#0D9488",
      patternBackground = "#FAFAFA",
      patternScale = 40,
      strokeColor = "#000000",
      strokeWidth = 0,
      cornerRadius = 0,
      sides = 6,
      points = 5,
      innerRadius = 0.5,
      rotation = 0,
    } = params;

    const w = width as number;
    const h = height as number;

    // Generate fill definition
    const { fillDef, fillUrl } = this.generateFill(
      fillType as string,
      fillColor as string,
      gradientType as string,
      gradientColor1 as string,
      gradientColor2 as string,
      gradientAngle as number,
      patternType as string,
      patternColor as string,
      patternBackground as string,
      patternScale as number,
      w,
      h
    );

    // Generate shape path/element
    const shapeElement = this.generateShape(
      shapeType as string,
      w,
      h,
      fillUrl,
      strokeColor as string,
      strokeWidth as number,
      cornerRadius as number,
      sides as number,
      points as number,
      innerRadius as number,
      rotation as number
    );

    const svgContent = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
${fillDef}${shapeElement}
</svg>`;

    return {
      bytes: Buffer.from(svgContent, "utf-8"),
      mime: "image/svg+xml",
      width: w,
      height: h,
      source: `svg:shapes:${shapeType}:${fillType}`,
    };
  }

  private generateFill(
    fillType: string,
    fillColor: string,
    gradientType: string,
    gradientColor1: string,
    gradientColor2: string,
    gradientAngle: number,
    patternType: string,
    patternColor: string,
    patternBackground: string,
    patternScale: number,
    width: number,
    height: number
  ): { fillDef: string; fillUrl: string } {
    switch (fillType) {
      case "none":
        return { fillDef: "", fillUrl: "none" };

      case "solid":
        return { fillDef: "", fillUrl: fillColor };

      case "gradient":
        return this.generateGradientDef(
          gradientType,
          gradientColor1,
          gradientColor2,
          gradientAngle
        );

      case "pattern":
        return this.generatePatternDef(
          patternType,
          patternColor,
          patternBackground,
          patternScale,
          width,
          height
        );

      default:
        throw new GenerationError(`Unknown fill type: ${fillType}`);
    }
  }

  private generateGradientDef(
    gradientType: string,
    color1: string,
    color2: string,
    angle: number
  ): { fillDef: string; fillUrl: string } {
    if (gradientType === "radial") {
      return {
        fillDef: `  <defs>
    <radialGradient id="fill">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </radialGradient>
  </defs>
`,
        fillUrl: "url(#fill)",
      };
    }

    // Linear gradient with angle
    const rad = (angle * Math.PI) / 180;
    const x1 = Math.round(50 - 50 * Math.cos(rad));
    const y1 = Math.round(50 - 50 * Math.sin(rad));
    const x2 = Math.round(50 + 50 * Math.cos(rad));
    const y2 = Math.round(50 + 50 * Math.sin(rad));

    return {
      fillDef: `  <defs>
    <linearGradient id="fill" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
`,
      fillUrl: "url(#fill)",
    };
  }

  private generatePatternDef(
    patternType: string,
    color: string,
    background: string,
    scale: number,
    width: number,
    height: number
  ): { fillDef: string; fillUrl: string } {
    let patternContent: string;

    switch (patternType) {
      case "dots":
        patternContent = `<circle cx="${scale / 2}" cy="${scale / 2}" r="${Math.max(2, scale / 10)}" fill="${color}" />`;
        break;

      case "stripes":
        patternContent = `<rect width="${scale / 2}" height="${scale}" fill="${color}" />`;
        break;

      case "grid":
        patternContent = `<path d="M ${scale} 0 L 0 0 0 ${scale}" fill="none" stroke="${color}" stroke-width="1"/>`;
        break;

      case "checkerboard": {
        const half = scale / 2;
        patternContent = `<rect width="${half}" height="${half}" fill="${color}" /><rect x="${half}" y="${half}" width="${half}" height="${half}" fill="${color}" />`;
        break;
      }

      default:
        throw new GenerationError(`Unknown pattern type: ${patternType}`);
    }

    return {
      fillDef: `  <defs>
    <pattern id="fill" x="0" y="0" width="${scale}" height="${scale}" patternUnits="userSpaceOnUse">
      ${patternContent}
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="${background}" />
`,
      fillUrl: "url(#fill)",
    };
  }

  private generateShape(
    shapeType: string,
    width: number,
    height: number,
    fill: string,
    strokeColor: string,
    strokeWidth: number,
    cornerRadius: number,
    sides: number,
    points: number,
    innerRadius: number,
    rotation: number
  ): string {
    const stroke = strokeWidth > 0 ? ` stroke="${strokeColor}" stroke-width="${strokeWidth}"` : "";
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - Math.max(10, strokeWidth);

    // Apply rotation transform if needed
    const transform = rotation !== 0 ? ` transform="rotate(${rotation} ${cx} ${cy})"` : "";

    switch (shapeType) {
      case "rectangle":
        return `  <rect width="${width}" height="${height}" fill="${fill}" rx="${cornerRadius}"${stroke}${transform} />`;

      case "circle":
        return `  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}"${stroke}${transform} />`;

      case "ellipse": {
        const rx = width / 2 - Math.max(10, strokeWidth);
        const ry = height / 2 - Math.max(10, strokeWidth);
        return `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${stroke}${transform} />`;
      }

      case "triangle":
        return this.generatePolygon(cx, cy, radius, 3, fill, stroke, rotation - 90); // -90 to point up

      case "polygon":
        return this.generatePolygon(cx, cy, radius, sides, fill, stroke, rotation - 90);

      case "star":
        return this.generateStar(cx, cy, radius, points, innerRadius, fill, stroke, rotation - 90);

      default:
        throw new GenerationError(`Unknown shape type: ${shapeType}`);
    }
  }

  private generatePolygon(
    cx: number,
    cy: number,
    radius: number,
    sides: number,
    fill: string,
    stroke: string,
    rotation: number
  ): string {
    const points: string[] = [];
    const angleStep = (2 * Math.PI) / sides;
    const rotationRad = (rotation * Math.PI) / 180;

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep + rotationRad;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }

    return `  <polygon points="${points.join(" ")}" fill="${fill}"${stroke} />`;
  }

  private generateStar(
    cx: number,
    cy: number,
    outerRadius: number,
    pointCount: number,
    innerRadiusRatio: number,
    fill: string,
    stroke: string,
    rotation: number
  ): string {
    const points: string[] = [];
    const innerRadius = outerRadius * innerRadiusRatio;
    const angleStep = Math.PI / pointCount;
    const rotationRad = (rotation * Math.PI) / 180;

    for (let i = 0; i < pointCount * 2; i++) {
      const angle = i * angleStep + rotationRad;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }

    return `  <polygon points="${points.join(" ")}" fill="${fill}"${stroke} />`;
  }
}
