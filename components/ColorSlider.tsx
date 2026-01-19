import React from 'react';

interface ColorSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  gradient: string;
  disabled?: boolean;
}

const ColorSlider: React.FC<ColorSliderProps> = ({ label, value, min, max, onChange, gradient, disabled }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-gray-700 font-bold">{label}</label>
        <span className="text-gray-500 font-mono">{value}</span>
      </div>
      <div className="relative h-6 rounded-full w-full">
        <div 
          className="absolute inset-0 rounded-full" 
          style={{ background: gradient }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Thumb Indicator - Purely Visual */}
        <div 
          className="absolute top-0 bottom-0 w-4 h-8 bg-white border-2 border-gray-400 rounded shadow-md pointer-events-none transform -translate-y-1 -translate-x-2"
          style={{ left: `${((value - min) / (max - min)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ColorSlider;
