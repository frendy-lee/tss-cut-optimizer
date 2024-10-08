"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import CutVisualizer from '@/components/CutVisualizer';

interface Cut {
  width: number;
  height: number;
  quantity: number;
}

interface PlacedCut extends Cut {
  x: number;
  y: number;
}

const CutlistOptimizer: React.FC = () => {
  const [stockWidth, setStockWidth] = useState<number>(1220);
  const [stockHeight, setStockHeight] = useState<number>(2440);
  const [cutWidth, setCutWidth] = useState<number>(0);
  const [cutHeight, setCutHeight] = useState<number>(0);
  const [cutQuantity, setCutQuantity] = useState<number>(1);
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [bladeWidth, setBladeWidth] = useState<number>(3);
  const [waste, setWaste] = useState<{ percentage: number; size: number }>({ percentage: 0, size: 0 });
  const [unplacedCuts, setUnplacedCuts] = useState<Cut[]>([]);

  const addCut = () => {
    if (cutWidth > 0 && cutHeight > 0 && cutQuantity > 0) {
      const newCut = { width: cutWidth, height: cutHeight, quantity: cutQuantity };
      setCuts([...cuts, newCut]);
      setCutWidth(0);
      setCutHeight(0);
      setCutQuantity(1);
    }
  };

  const removeCut = (index: number) => {
    setCuts(cuts.filter((_, i) => i !== index));
  };

  const handleCutsPlaced = (placedCuts: PlacedCut[], unplaced: Cut[]) => {
    setUnplacedCuts(unplaced);

    const totalArea = stockWidth * stockHeight;
    const usedArea = placedCuts.reduce((sum, cut) => sum + cut.width * cut.height, 0);
    const wasteSize = totalArea - usedArea;
    const wastePercentage = (wasteSize / totalArea) * 100;

    setWaste({
      percentage: parseFloat(wastePercentage.toFixed(2)),
      size: wasteSize
    });
  };

  const expandCuts = (cuts: Cut[]): Cut[] => {
    return cuts.flatMap(cut => Array(cut.quantity).fill({ width: cut.width, height: cut.height, quantity: 1 }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockWidth">Stock Width (mm)</Label>
                <Input
                  id="stockWidth"
                  type="number"
                  value={stockWidth}
                  onChange={(e) => setStockWidth(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="stockHeight">Stock Height (mm)</Label>
                <Input
                  id="stockHeight"
                  type="number"
                  value={stockHeight}
                  onChange={(e) => setStockHeight(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bladeWidth">Saw Blade Thickness (mm)</Label>
              <Slider
                id="bladeWidth"
                min={1}
                max={10}
                step={0.5}
                value={[bladeWidth]}
                onValueChange={(value) => setBladeWidth(value[0])}
              />
              <span className="text-sm text-gray-500">{bladeWidth} mm</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cutWidth">Cut Width (mm)</Label>
                <Input
                  id="cutWidth"
                  type="number"
                  value={cutWidth}
                  onChange={(e) => setCutWidth(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="cutHeight">Cut Height (mm)</Label>
                <Input
                  id="cutHeight"
                  type="number"
                  value={cutHeight}
                  onChange={(e) => setCutHeight(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="cutQuantity">Quantity</Label>
                <Input
                  id="cutQuantity"
                  type="number"
                  value={cutQuantity}
                  onChange={(e) => setCutQuantity(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
            <Button onClick={addCut}>Add Cut</Button>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Cut List:</h3>
            <ul className="space-y-2">
              {cuts.map((cut, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{cut.width} x {cut.height} mm (Qty: {cut.quantity})</span>
                  <Button variant="destructive" size="sm" onClick={() => removeCut(index)}>Remove</Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Waste:</h3>
            <p>{waste.percentage}% ({waste.size} mm²)</p>
          </div>
          {unplacedCuts.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                {unplacedCuts.length} cut{unplacedCuts.length > 1 ? 's' : ''} could not be placed in the current layout.
                Consider adjusting your cut sizes or stock dimensions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cut Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <CutVisualizer
            stockWidth={stockWidth}
            stockHeight={stockHeight}
            cuts={expandCuts(cuts)}
            bladeWidth={bladeWidth}
            onCutsPlaced={handleCutsPlaced}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CutlistOptimizer;