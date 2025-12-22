---
description: Generate a chart or graph using QuickChart (bar, line, pie, doughnut, radar, etc.)
allowed-tools: mcp__floimg__generate_image, mcp__floimg__save_image
---

# Chart Generation

Generate a chart based on: "$ARGUMENTS"

## Instructions

1. **Parse the chart request**:
   - Identify chart type (bar, line, pie, doughnut, radar, scatter, bubble, polarArea)
   - Extract data points (labels and values)
   - Determine styling preferences (colors, title, legend)

2. **Structure the params** for QuickChart:

   ```json
   {
     "type": "bar",
     "data": {
       "labels": ["Q1", "Q2", "Q3", "Q4"],
       "datasets": [
         {
           "label": "Sales",
           "data": [65, 59, 80, 81],
           "backgroundColor": ["#4ade80", "#22d3ee", "#a78bfa", "#f472b6"]
         }
       ]
     },
     "options": {
       "plugins": {
         "title": { "display": true, "text": "Quarterly Sales" }
       }
     }
   }
   ```

3. **Call `generate_image`** with:
   - `intent`: "chart" (routes to QuickChart)
   - `params`: The structured chart configuration above

4. **Report and offer options**:
   - Different chart types for the same data
   - Color scheme adjustments
   - Export to different sizes

## Chart Types

| Type                | Best For                  |
| ------------------- | ------------------------- |
| bar / horizontalBar | Categorical comparisons   |
| line                | Trends over time          |
| pie / doughnut      | Parts of a whole          |
| radar               | Multi-variable comparison |
| scatter / bubble    | Correlation analysis      |
| polarArea           | Radial data display       |

## Example Params

**Bar Chart**:

```json
{
  "type": "bar",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [{ "label": "Revenue", "data": [1000, 1500, 1200] }]
  }
}
```

**Pie Chart**:

```json
{
  "type": "pie",
  "data": {
    "labels": ["Desktop", "Mobile", "Tablet"],
    "datasets": [{ "data": [60, 30, 10] }]
  }
}
```

**Line Chart with Multiple Series**:

```json
{
  "type": "line",
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "datasets": [
      { "label": "This Week", "data": [10, 20, 15, 25, 30] },
      { "label": "Last Week", "data": [8, 15, 12, 20, 25] }
    ]
  }
}
```
