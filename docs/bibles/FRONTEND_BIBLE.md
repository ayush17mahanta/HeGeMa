# Frontend Bible — HEGEMA
**Next.js 14 Dashboard Architecture, Canvas Renderer & UI Design**

---

## 1. Tech Stack
- **Framework**: Next.js 14 App Router (React 18, TypeScript).
- **Styling**: Tailwind CSS + Custom Tactical Dark Theme variables.
- **State**: Zustand (Local Telemetry Store) + TanStack React Query (REST API).
- **Canvas Rendering**: Custom HTML5 2D Canvas Engine with smooth interpolation.

## 2. Page & Component Tree
```text
frontend/src/app/
├── layout.tsx                # Tactical Dark Theme Root Wrapper
├── page.tsx                  # Live Mission Control Dashboard
├── simulation/page.tsx       # Earthquake Simulator Control Panel
└── xai/page.tsx              # Model Zoo & Feature Importance Explorer

frontend/src/components/
├── canvas/
│   ├── FloorPlanCanvas.tsx   # Base Wall Vectors & Heatmap Overlay
│   └── HeatmapLayer.ts       # Gaussian Blur Gradient Cell Renderer
├── dashboard/
│   ├── TacticalHeader.tsx
│   ├── ConfidenceCard.tsx
│   ├── XAIDrawer.tsx
│   └── TimelinePlayer.tsx
└── ui/
    └── Button.tsx, Card.tsx
```

## 3. Real-Time Canvas Heatmap Rendering Algorithm
The floor plan canvas draws a smoothed 2D grid matrix of float values $[0.0, 1.0]$ received over WebSocket:
```typescript
function drawHeatmap(ctx: CanvasRenderingContext2D, grid: number[][], bounds: GridBounds) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const val = grid[r][c];
      if (val > 0.05) {
        ctx.fillStyle = getHeatmapColor(val); // HSL gradient from blue -> cyan -> yellow -> red
        ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
      }
    }
  }
}
```
