import React from 'react';
import { PartInfo } from '../types';
import { Info } from 'lucide-react';

interface ComponentCardProps {
  part: PartInfo | null;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ part }) => {
  if (!part) {
    return (
      <div className="h-40 bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center text-slate-500 text-center border-dashed">
        <Info size={32} className="mb-2 opacity-50" />
        <p>Hover over any component in the schematic diagram to learn how it works.</p>
      </div>
    );
  }

  return (
    <div className="h-40 bg-slate-800 rounded-xl border border-blue-500/50 p-6 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Info size={64} />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-xl font-bold text-blue-400">{part.name}</h3>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono">{part.value}</span>
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-400 border border-slate-600 px-2 py-1 rounded">
                {part.role}
            </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
            {part.description}
        </p>
      </div>
    </div>
  );
};

export default ComponentCard;