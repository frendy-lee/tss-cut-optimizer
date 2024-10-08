"use client"

import React, { useRef, useEffect } from 'react';

interface Cut {
  width: number;
  height: number;
  quantity: number;
}

interface PlacedCut extends Cut {
  x: number;
  y: number;
}

interface Space {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CutVisualizerProps {
  stockWidth: number;
  stockHeight: number;
  cuts: Cut[];
  bladeWidth: number;
  onCutsPlaced: (placedCuts: PlacedCut[], unplacedCuts: Cut[]) => void;
}

const CutVisualizer: React.FC<CutVisualizerProps> = ({ stockWidth, stockHeight, cuts, bladeWidth, onCutsPlaced }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const findBestCut = (space: Space, cuts: Cut[]): Cut | null => {
    let bestCut: Cut | null = null;
    let bestScore = -Infinity;

    for (const cut of cuts) {
      if (cut.width <= space.width && cut.height <= space.height) {
        const score = cut.width * cut.height; // Prioritize larger cuts
        if (score > bestScore) {
          bestScore = score;
          bestCut = cut;
        }
      }
    }

    return bestCut;
  };

  const guillotineCut = (space: Space, cuts: Cut[], placedCuts: PlacedCut[], bladeWidth: number): void => {
    const bestCut = findBestCut(space, cuts);

    if (!bestCut) return;

    const newCut: PlacedCut = { ...bestCut, x: space.x, y: space.y };
    placedCuts.push(newCut);
    cuts.splice(cuts.indexOf(bestCut), 1);

    const rightSpace: Space = {
      x: space.x + bestCut.width + bladeWidth,
      y: space.y,
      width: space.width - bestCut.width - bladeWidth,
      height: bestCut.height
    };

    const bottomSpace: Space = {
      x: space.x,
      y: space.y + bestCut.height + bladeWidth,
      width: space.width,
      height: space.height - bestCut.height - bladeWidth
    };

    if (rightSpace.width > 0 && rightSpace.height > 0) {
      guillotineCut(rightSpace, cuts, placedCuts, bladeWidth);
    }

    if (bottomSpace.width > 0 && bottomSpace.height > 0) {
      guillotineCut(bottomSpace, cuts, placedCuts, bladeWidth);
    }
  };

  const optimizeCuts = (cuts: Cut[], stockWidth: number, stockHeight: number, bladeWidth: number): [PlacedCut[], Cut[]] => {
    const placedCuts: PlacedCut[] = [];
    const sortedCuts = [...cuts].sort((a, b) => b.width * b.height - a.width * a.height);
    const initialSpace: Space = { x: 0, y: 0, width: stockWidth, height: stockHeight };

    guillotineCut(initialSpace, sortedCuts, placedCuts, bladeWidth);

    return [placedCuts, sortedCuts];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const scale = Math.min(canvas.width / stockWidth, canvas.height / stockHeight);
    const scaledWidth = stockWidth * scale;
    const scaledHeight = stockHeight * scale;

    // Draw stock
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, scaledWidth, scaledHeight);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(0, 0, scaledWidth, scaledHeight);

    // Optimize and draw cuts
    const [placedCuts, unplacedCuts] = optimizeCuts(cuts, stockWidth, stockHeight, bladeWidth);
    placedCuts.forEach((cut, index) => {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9c74f', '#90be6d'];
      ctx.fillStyle = colors[index % colors.length];
      
      const scaledX = cut.x * scale;
      const scaledY = cut.y * scale;
      const scaledCutWidth = cut.width * scale;
      const scaledCutHeight = cut.height * scale;

      ctx.fillRect(scaledX, scaledY, scaledCutWidth, scaledCutHeight);
      ctx.strokeRect(scaledX, scaledY, scaledCutWidth, scaledCutHeight);

      // Add cut dimensions text
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.fillText(`${cut.width}x${cut.height}`, scaledX + 5, scaledY + 15);
    });

    // Calculate and display waste
    const totalArea = stockWidth * stockHeight;
    const usedArea = placedCuts.reduce((sum, cut) => sum + cut.width * cut.height, 0);
    const wasteSize = totalArea - usedArea;
    const wastePercentage = (wasteSize / totalArea) * 100;

    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.fillText(`Waste: ${wastePercentage.toFixed(2)}% (${wasteSize} mm²)`, 10, scaledHeight - 10);

    // Notify parent component about placed and unplaced cuts
    onCutsPlaced(placedCuts, unplacedCuts);

  }, [stockWidth, stockHeight, cuts, bladeWidth, onCutsPlaced]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="w-full border border-gray-300"
    />
  );
};

export default CutVisualizer;