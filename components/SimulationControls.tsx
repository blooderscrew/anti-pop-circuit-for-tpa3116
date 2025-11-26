import React from 'react';
import { Power, Volume2, VolumeX } from 'lucide-react';
import { CircuitState } from '../types';

interface SimulationControlsProps {
  state: CircuitState;
  onTogglePower: () => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ state, onTogglePower }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold text-slate-100">Controls</h2>
      
      <button
        onClick={onTogglePower}
        className={`relative w-24 h-24 rounded-full border-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 flex items-center justify-center
            ${state.isPowered 
                ? 'bg-red-500 border-red-700 shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
      >
        <Power size={48} className={`text-white transition-transform ${state.isPowered ? 'scale-110 drop-shadow-lg' : 'opacity-50'}`} />
      </button>
      <div className="text-center">
        <div className="text-sm text-slate-400 uppercase tracking-wider">Power Supply</div>
        <div className={`text-2xl font-mono font-bold ${state.isPowered ? 'text-red-400' : 'text-slate-500'}`}>
            {state.isPowered ? '24.0 V' : '0.0 V'}
        </div>
      </div>

      <div className="w-full h-px bg-slate-700 my-2"></div>

      <div className="flex flex-col items-center gap-2 w-full">
         <div className="text-sm text-slate-400 uppercase tracking-wider">Amp Status</div>
         <div className={`w-full py-3 rounded-lg flex items-center justify-center gap-3 transition-colors ${state.sdzVoltage > 2 ? 'bg-green-500/20 border border-green-500 text-green-400' : 'bg-red-500/20 border border-red-500 text-red-400'}`}>
            {state.sdzVoltage > 2 ? <Volume2 size={24} /> : <VolumeX size={24} />}
            <span className="font-bold text-lg">{state.sdzVoltage > 2 ? 'PLAYING' : 'MUTED'}</span>
         </div>
         <div className="text-xs text-slate-500 text-center">
            {state.sdzVoltage > 2 
                ? "SDZ Voltage is High (>2V)" 
                : "SDZ Voltage is Low (<2V)"}
         </div>
      </div>
    </div>
  );
};

export default SimulationControls;