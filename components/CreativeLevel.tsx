import React, { useState, useRef, useEffect } from 'react';
import { HSL } from '../types';
import ColorSlider from './ColorSlider';
import { Save } from 'lucide-react';

interface CreativeLevelProps {
  onComplete: (imageData: string, colorSettings: Record<string, HSL>) => void;
}

const CreativeLevel: React.FC<CreativeLevelProps> = ({ onComplete }) => {
  // Expanded to 18 Elements
  const [elements, setElements] = useState<Record<string, HSL>>({
    sky: { h: 200, s: 80, l: 85 },
    sun: { h: 45, s: 100, l: 60 },
    cloud: { h: 200, s: 10, l: 95 },
    mountain: { h: 260, s: 25, l: 45 },
    hill: { h: 100, s: 40, l: 40 },
    lake: { h: 195, s: 60, l: 55 },
    boat: { h: 20, s: 60, l: 55 }, 
    path: { h: 35, s: 30, l: 70 },  
    grass: { h: 90, s: 55, l: 45 },
    flowers: { h: 330, s: 70, l: 60 },
    treeTrunk: { h: 25, s: 45, l: 35 },
    treeLeaves: { h: 120, s: 50, l: 40 },
    houseBody: { h: 35, s: 40, l: 80 },
    houseRoof: { h: 0, s: 60, l: 45 },
    car: { h: 210, s: 70, l: 50 }, 
    person: { h: 15, s: 60, l: 60 }, 
    kite: { h: 0, s: 80, l: 60 }, 
    birds: { h: 0, s: 0, l: 30 } 
  });

  const [selectedId, setSelectedId] = useState<string>('sky');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Helper to get color string
    const getFill = (id: string, alpha = 1) => {
      const c = elements[id];
      return `hsla(${c.h}, ${c.s}%, ${c.l}%, ${alpha})`;
    };
    
    // Helper for darker variant
    const getDarker = (id: string, amount = 15) => {
       const c = elements[id];
       return `hsl(${c.h}, ${c.s}%, ${Math.max(0, c.l - amount)}%)`;
    };

    // Helper for lighter variant
    const getLighter = (id: string, amount = 15) => {
        const c = elements[id];
        return `hsl(${c.h}, ${c.s}%, ${Math.min(100, c.l + amount)}%)`;
     };

    ctx.clearRect(0, 0, w, h);

    // --- BACKGROUND ---

    // 1. Sky (Gradient)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, getFill('sky'));
    skyGrad.addColorStop(1, 'white');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Sun (Glow + Core)
    const sunX = w * 0.85;
    const sunY = h * 0.15;
    ctx.fillStyle = getFill('sun', 0.3);
    ctx.beginPath(); ctx.arc(sunX, sunY, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = getFill('sun');
    ctx.beginPath(); ctx.arc(sunX, sunY, 35, 0, Math.PI * 2); ctx.fill();

    // 3. Clouds
    ctx.fillStyle = getFill('cloud', 0.9);
    const drawPuffyCloud = (cx: number, cy: number, scale: number) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 30 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 25 * scale, cy - 10 * scale, 35 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 50 * scale, cy, 28 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 25 * scale, cy + 10 * scale, 30 * scale, 0, Math.PI * 2);
        ctx.fill();
    };
    drawPuffyCloud(w * 0.2, h * 0.2, 1.2);
    drawPuffyCloud(w * 0.5, h * 0.12, 0.8);
    drawPuffyCloud(w * 0.1, h * 0.35, 0.6);

    // 4. Mountains
    const drawMountain = (x1: number, y1: number, x2: number, peakY: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, h);
        ctx.lineTo((x1+x2)/2, peakY);
        ctx.lineTo(x2, h);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; // Snow
        ctx.beginPath();
        ctx.moveTo((x1+x2)/2, peakY);
        ctx.lineTo((x1+x2)/2 - 20, peakY + 50);
        ctx.lineTo((x1+x2)/2 + 20, peakY + 50);
        ctx.fill();
    };
    drawMountain(0, h, w*0.6, h*0.35, getFill('mountain'));
    drawMountain(w*0.2, h, w*0.9, h*0.45, getDarker('mountain', 5));

    // 5. Hills
    ctx.fillStyle = getFill('hill');
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.bezierCurveTo(w * 0.3, h * 0.55, w * 0.6, h * 0.75, w, h * 0.6);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // 6. Lake
    const lakeY = h * 0.68;
    ctx.fillStyle = getFill('lake');
    ctx.beginPath();
    ctx.ellipse(w * 0.65, lakeY + 60, w * 0.35, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ripples
    ctx.strokeStyle = getLighter('lake', 20);
    ctx.lineWidth = 2;
    for(let i=0; i<5; i++) {
        ctx.beginPath();
        const rx = w * 0.5 + Math.random() * w * 0.3;
        const ry = lakeY + 40 + Math.random() * 40;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + 30, ry);
        ctx.stroke();
    }

    // 7. Boat
    const bx = w * 0.72;
    const by = lakeY + 50;
    ctx.fillStyle = getFill('boat');
    ctx.beginPath(); ctx.arc(bx, by, 40, 0, Math.PI, false); ctx.fill(); // Hull
    ctx.strokeStyle = getDarker('boat', 20);
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - 60); ctx.stroke(); // Mast
    ctx.fillStyle = 'white'; // Sail
    ctx.beginPath(); ctx.moveTo(bx + 2, by - 10); ctx.lineTo(bx + 35, by - 10); ctx.lineTo(bx + 2, by - 55); ctx.fill();

    // --- MIDGROUND ---

    // 8. Path
    ctx.fillStyle = getFill('path');
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h);
    ctx.quadraticCurveTo(w * 0.3, h * 0.9, w * 0.45, h * 0.75); // Curves towards house
    ctx.lineTo(w * 0.55, h * 0.75);
    ctx.quadraticCurveTo(w * 0.45, h * 0.9, w * 0.65, h);
    ctx.fill();

    // 9. Grass (Foreground)
    ctx.fillStyle = getFill('grass');
    ctx.beginPath();
    ctx.moveTo(0, h * 0.8);
    ctx.quadraticCurveTo(w * 0.2, h * 0.78, w * 0.4, h * 0.82); // Cutout for lake/path visibility
    ctx.quadraticCurveTo(w * 0.7, h * 0.85, w, h * 0.8);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // 10. Flowers (CLUSTERS)
    const flowerColor = getFill('flowers');
    const flowerCenter = getLighter('flowers', 40);

    const drawFlower = (fx: number, fy: number, scale: number = 1) => {
        const s = scale;
        ctx.fillStyle = flowerColor;
        // Petals
        ctx.beginPath(); ctx.arc(fx, fy, 5*s, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(fx+4*s, fy+4*s, 5*s, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(fx-4*s, fy+4*s, 5*s, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(fx+4*s, fy-4*s, 5*s, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(fx-4*s, fy-4*s, 5*s, 0, Math.PI*2); ctx.fill();
        // Center
        ctx.fillStyle = flowerCenter;
        ctx.beginPath(); ctx.arc(fx, fy, 3*s, 0, Math.PI*2); ctx.fill();
    };

    const drawFlowerCluster = (cx: number, cy: number, count: number, spread: number) => {
        for(let i=0; i<count; i++) {
            // Random-ish distribution
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * spread;
            const fx = cx + Math.cos(angle) * dist;
            const fy = cy + Math.sin(angle) * dist * 0.6; // Flatten vertically slightly
            drawFlower(fx, fy, 1.0 + Math.random() * 0.5); // Varying sizes
        }
    };

    // Left Cluster (Big)
    drawFlowerCluster(80, h * 0.88, 15, 45);
    
    // Right Cluster (Small)
    drawFlowerCluster(w * 0.9, h * 0.85, 8, 25);

    // 11. Trees (MULTIPLE)
    const drawTree = (tx: number, ty: number, scale: number) => {
        const trunkW = 20 * scale;
        const trunkH = 100 * scale;
        
        ctx.fillStyle = getFill('treeTrunk');
        ctx.beginPath(); 
        ctx.moveTo(tx - trunkW/2 - 5*scale, ty + trunkH); // Base left
        ctx.lineTo(tx - trunkW/2, ty); // Top left
        ctx.lineTo(tx + trunkW/2, ty); // Top right
        ctx.lineTo(tx + trunkW/2 + 5*scale, ty + trunkH); // Base right
        ctx.fill();

        ctx.fillStyle = getFill('treeLeaves');
        const drawLeafCluster = (lx: number, ly: number, r: number) => { 
            ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI * 2); ctx.fill(); 
        };
        
        // Variation in clusters based on position to make them look different
        drawLeafCluster(tx, ty - 20*scale, 40*scale); 
        drawLeafCluster(tx - 25*scale, ty + 10*scale, 30*scale); 
        drawLeafCluster(tx + 25*scale, ty + 5*scale, 30*scale); 
        drawLeafCluster(tx, ty - 50*scale, 25*scale);
    };

    // Main Tree (Left)
    drawTree(w * 0.15, h * 0.6, 1.0);
    // Secondary Tree (Left, smaller)
    drawTree(w * 0.25, h * 0.62, 0.7);
    // Distant Tree (Right background)
    drawTree(w * 0.85, h * 0.60, 0.5);


    // 12. House
    const hx = w * 0.4;
    const hy = h * 0.65;
    // Chimney & Smoke
    ctx.fillStyle = getDarker('houseBody', 10); ctx.fillRect(hx + 80, hy - 40, 20, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(hx + 90, hy - 50, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx + 95, hy - 65, 12, 0, Math.PI*2); ctx.fill();
    // Body
    ctx.fillStyle = getFill('houseBody'); ctx.fillRect(hx, hy, 120, 90);
    // Windows & Door
    ctx.fillStyle = '#bce6eb'; ctx.strokeStyle = getDarker('houseBody', 20); ctx.lineWidth = 2;
    ctx.fillRect(hx + 15, hy + 20, 30, 30); ctx.strokeRect(hx + 15, hy + 20, 30, 30);
    ctx.fillRect(hx + 75, hy + 20, 30, 30); ctx.strokeRect(hx + 75, hy + 20, 30, 30);
    ctx.fillStyle = getDarker('houseBody', 30); ctx.fillRect(hx + 45, hy + 50, 30, 40);
    // Roof
    ctx.fillStyle = getFill('houseRoof');
    ctx.beginPath(); ctx.moveTo(hx - 10, hy); ctx.lineTo(hx + 60, hy - 60); ctx.lineTo(hx + 130, hy); ctx.fill();

    // 13. Car (Moved to Foreground Grass)
    const cx = w * 0.65; // Right side of path
    const cy = h * 0.85; // Foreground
    ctx.fillStyle = getFill('car');
    ctx.beginPath();
    ctx.roundRect(cx, cy, 70, 30, 5); // Body
    ctx.fill();
    ctx.fillStyle = getLighter('car', 20);
    ctx.beginPath();
    ctx.roundRect(cx + 10, cy - 15, 40, 20, 3); // Top
    ctx.fill();
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(cx + 15, cy + 30, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 55, cy + 30, 10, 0, Math.PI*2); ctx.fill();

    // 14. Person
    const px = w * 0.3;
    const py = h * 0.8;
    ctx.fillStyle = getFill('person'); 
    ctx.fillRect(px, py, 16, 25);
    ctx.fillStyle = '#333';
    ctx.fillRect(px, py + 25, 6, 20); 
    ctx.fillRect(px + 10, py + 25, 6, 20); 
    ctx.fillStyle = '#ffdbac'; 
    ctx.beginPath(); ctx.arc(px + 8, py - 8, 10, 0, Math.PI*2); ctx.fill(); 

    // 15. Kite
    const kx = w * 0.15;
    const ky = h * 0.25;
    ctx.fillStyle = getFill('kite');
    ctx.beginPath();
    ctx.moveTo(kx, ky - 25);
    ctx.lineTo(kx + 20, ky);
    ctx.lineTo(kx, ky + 35);
    ctx.lineTo(kx - 20, ky);
    ctx.fill();
    // String
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(kx, ky + 35);
    ctx.quadraticCurveTo(kx + 10, ky + 100, px + 8, py); 
    ctx.stroke();

    // 16. Birds
    ctx.strokeStyle = getFill('birds');
    ctx.lineWidth = 2;
    const drawBird = (bx: number, by: number) => {
        ctx.beginPath();
        ctx.moveTo(bx - 10, by - 5);
        ctx.quadraticCurveTo(bx, by, bx + 10, by - 5);
        ctx.stroke();
    };
    drawBird(w * 0.7, h * 0.15);
    drawBird(w * 0.75, h * 0.18);
    drawBird(w * 0.72, h * 0.22);
  };

  useEffect(() => {
    drawCanvas();
  }, [elements]);

  const handleColorChange = (key: keyof HSL, val: number) => {
    setElements(prev => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], [key]: val }
    }));
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onComplete(dataUrl, elements);
    }
  };
  
  const elementNames: Record<string, string> = {
    sky: '天空', sun: '太阳', cloud: '云朵', mountain: '山脉', hill: '丘陵',
    lake: '湖泊', boat: '帆船', path: '小路', grass: '草地', flowers: '花丛',
    treeTrunk: '树干', treeLeaves: '树冠', houseBody: '墙壁', houseRoof: '房顶', 
    car: '小汽车', person: '人物', kite: '风筝', birds: '飞鸟'
  };

  const currentHsl = elements[selectedId];

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6 pb-24">
      
      {/* Canvas Area */}
      <div className="flex-1 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-center mb-2 text-indigo-800">创作你的风景</h2>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className="w-full h-auto rounded border border-gray-100 cursor-pointer"
        />
      </div>

      {/* Controls Area */}
      <div className="w-full md:w-96 space-y-4">
        
        {/* Element Selector - 18 items */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3">1. 选择物体</h3>
          <div className="grid grid-cols-4 gap-2"> {/* Increased columns for 18 items */}
            {Object.keys(elements).map(key => (
              <button
                key={key}
                onClick={() => setSelectedId(key)}
                className={`py-2 px-1 text-xs rounded-lg font-medium transition-all truncate ${
                  selectedId === key 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={elementNames[key]}
              >
                {elementNames[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-3">2. 调整颜色 ({elementNames[selectedId]})</h3>
          <ColorSlider 
            label="色相" value={currentHsl.h} min={0} max={360} 
            onChange={(v) => handleColorChange('h', v)}
            gradient="linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
          />
          <ColorSlider 
            label="饱和度" value={currentHsl.s} min={0} max={100} 
            onChange={(v) => handleColorChange('s', v)}
            gradient={`linear-gradient(to right, hsl(${currentHsl.h}, 0%, ${currentHsl.l}%), hsl(${currentHsl.h}, 100%, ${currentHsl.l}%))`}
          />
          <ColorSlider 
            label="明度" value={currentHsl.l} min={0} max={100} 
            onChange={(v) => handleColorChange('l', v)}
            gradient={`linear-gradient(to right, black, hsl(${currentHsl.h}, ${currentHsl.s}%, 50%), white)`}
          />
        </div>

        {/* Finish Button */}
        <button 
          onClick={handleSave}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 flex items-center justify-center"
        >
          <Save className="mr-2" /> 
          完成创作并提交
        </button>
      </div>
    </div>
  );
};

export default CreativeLevel;
