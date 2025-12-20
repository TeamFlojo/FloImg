import { describe, it, expect } from 'vitest';
import quickchart from '../src/index.js';

describe('imgflo-quickchart', () => {
  it('should create a generator with default config', () => {
    const generator = quickchart();
    expect(generator.name).toBe('quickchart');
    expect(generator.generate).toBeTypeOf('function');
  });

  it('should generate a bar chart', async () => {
    const generator = quickchart();

    const result = await generator.generate({
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Revenue',
          data: [12, 19, 3, 5]
        }]
      }
    });

    expect(result.bytes).toBeInstanceOf(Buffer);
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.mime).toBe('image/png');
    expect(result.width).toBe(500); // default width
    expect(result.height).toBe(300); // default height
    expect(result.source).toBe('quickchart');
  });

  it('should generate a line chart', async () => {
    const generator = quickchart();

    const result = await generator.generate({
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Sales',
          data: [10, 15, 13]
        }]
      }
    });

    expect(result.bytes).toBeInstanceOf(Buffer);
    expect(result.mime).toBe('image/png');
  });

  it('should respect custom dimensions', async () => {
    const generator = quickchart();

    const result = await generator.generate({
      type: 'pie',
      data: {
        labels: ['A', 'B', 'C'],
        datasets: [{ data: [10, 20, 30] }]
      },
      width: 800,
      height: 600
    });

    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it('should accept default config', async () => {
    const generator = quickchart({
      width: 1000,
      height: 800,
      backgroundColor: 'white'
    });

    const result = await generator.generate({
      type: 'bar',
      data: {
        labels: ['A'],
        datasets: [{ data: [1] }]
      }
    });

    expect(result.width).toBe(1000);
    expect(result.height).toBe(800);
  });

  it('should handle Chart.js options pass-through', async () => {
    const generator = quickchart();

    const result = await generator.generate({
      type: 'bar',
      data: {
        labels: ['A', 'B'],
        datasets: [{ data: [1, 2] }]
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
            text: 'Test Chart'
          }
        }
      }
    });

    expect(result.bytes.length).toBeGreaterThan(0);
  });

  it('should support WebP format', async () => {
    const generator = quickchart({ format: 'webp' });

    const result = await generator.generate({
      type: 'bar',
      data: {
        labels: ['A'],
        datasets: [{ data: [1] }]
      }
    });

    expect(result.mime).toBe('image/webp');
  });
});
