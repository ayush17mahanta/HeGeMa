'use client';

import React, { useEffect, useRef } from 'react';

interface FloorPlanCanvasProps {
  gridMatrix: number[][];
  currentZone: string;
}

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({ gridMatrix, currentZone }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const rows = gridMatrix.length || 15;
    const cols = gridMatrix[0]?.length || 20;

    const cellW = width / cols;
    const cellH = height / rows;

    // Clear canvas
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, width, height);

    // Draw Floor Plan Grid Lines & Room Boundaries
    ctx.strokeStyle = '#1F293D';
    ctx.lineWidth = 1;

    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(width, r * cellH);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, height);
      ctx.stroke();
    }

    // Draw Walls Outline
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    // Outer building envelope
    ctx.strokeRect(cellW * 1, cellH * 1, cellW * 18, cellH * 13);
    // Inner wall dividers
    ctx.beginPath();
    ctx.moveTo(cellW * 1, cellH * 7);
    ctx.lineTo(cellW * 19, cellH * 7); // Main corridor top
    ctx.moveTo(cellW * 1, cellH * 9);
    ctx.lineTo(cellW * 19, cellH * 9); // Main corridor bottom
    ctx.stroke();

    // Render Occupancy Heatmap Gradients
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = gridMatrix[r]?.[c] || 0;
        if (val > 0.05) {
          ctx.beginPath();
          // Color ramp: Low (Cyan) -> Med (Amber) -> High (Red Glow)
          if (val > 0.7) {
            ctx.fillStyle = `rgba(255, 40, 80, ${val * 0.85})`;
          } else if (val > 0.35) {
            ctx.fillStyle = `rgba(255, 200, 0, ${val * 0.75})`;
          } else {
            ctx.fillStyle = `rgba(0, 229, 255, ${val * 0.6})`;
          }
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }

    // Room Label Annotations
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText('ROOM 101', cellW * 2, cellH * 3);
    ctx.fillText('MAIN CORRIDOR A', cellW * 8, cellH * 8.2);
    ctx.fillText('ROOM 105 (OCCUPIED)', cellW * 11, cellH * 12);

    // Current Zone Target Beacon Ring
    if (currentZone) {
      ctx.fillStyle = '#00E5FF';
      ctx.fillText(`ACTIVE ZONE: ${currentZone.toUpperCase()}`, cellW * 1.5, cellH * 14.5);
    }
  }, [gridMatrix, currentZone]);

  return (
    <div className="relative border border-[#1F293D] rounded-xl overflow-hidden shadow-2xl bg-[#090D16]">
      <div className="absolute top-4 left-4 bg-[#121826]/90 border border-[#1F293D] px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-400 flex items-center gap-2 z-10 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        TACTICAL CANVAS — 2D OCCUPANCY HEATMAP LAYER
      </div>
      <canvas ref={canvasRef} width={800} height={500} className="w-full h-auto block" />
    </div>
  );
};
