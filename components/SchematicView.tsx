import React from 'react';
import { CircuitState } from '../types';

interface SchematicViewProps {
  state: CircuitState;
  onHoverPart: (id: string | null) => void;
  hoveredPartId?: string | null;
}

// --- Realistic Components ---

const RealResistor = ({ x, y, rotate, bands }: { x: number; y: number; rotate: number; bands: string[] }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotate})`}>
    {/* Shadow */}
    <rect x="-35" y="-10" width="70" height="20" rx="5" fill="#000" fillOpacity="0.3" transform="translate(2, 2)" />
    {/* Body */}
    <rect x="-35" y="-10" width="70" height="20" rx="5" fill="#eec591" stroke="#8b5a2b" strokeWidth="1" />
    {/* Bands */}
    <rect x="-25" y="-10" width="6" height="20" fill={bands[0]} />
    <rect x="-15" y="-10" width="6" height="20" fill={bands[1]} />
    <rect x="-5" y="-10" width="6" height="20" fill={bands[2]} />
    <rect x="20" y="-10" width="6" height="20" fill={bands[3]} />
  </g>
);

const RealCapacitor = ({ x, y, charge }: { x: number; y: number; charge: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Legs */}
    <rect x="-2" y="-55" width="4" height="20" fill="#94a3b8" />
    <rect x="-2" y="35" width="4" height="20" fill="#94a3b8" />
    {/* Body */}
    <rect x="-15" y="-35" width="30" height="70" rx="4" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
    {/* Stripe (Negative) */}
    <rect x="-15" y="10" width="30" height="15" fill="#cbd5e1" opacity="0.8" />
    <text x="0" y="22" textAnchor="middle" fontSize="10" fill="#1e3a8a" fontWeight="bold">-</text>
    {/* Label */}
    <text x="0" y="-10" textAnchor="middle" fontSize="10" fill="#cbd5e1" fontWeight="bold">10µF</text>
    {/* Charge Level (Overlay) */}
    <rect x="-13" y={33 - (charge * 66)} width="26" height={charge * 66} fill="#10b981" opacity="0.4" rx="2" />
  </g>
);

const RealTransistor = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Legs */}
    <line x1="-15" y1="10" x2="-20" y2="40" stroke="#94a3b8" strokeWidth="3" />
    <line x1="0" y1="10" x2="0" y2="40" stroke="#94a3b8" strokeWidth="3" />
    <line x1="15" y1="10" x2="20" y2="40" stroke="#94a3b8" strokeWidth="3" />
    {/* Body (TO-92 front face) */}
    <path d="M -20 10 L 20 10 L 20 -20 C 20 -35, -20 -35, -20 -20 Z" fill="#1e293b" />
    <text x="0" y="-15" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontFamily="monospace">BC548</text>
  </g>
);

const RealChip = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
     {/* Legs */}
     {[0, 10, 20, 30, 40, 50, 60, 70].map(offset => (
         <React.Fragment key={offset}>
            <rect x="-12" y={15 + offset} width="6" height="4" fill="#cbd5e1" />
            <rect x="56" y={15 + offset} width="6" height="4" fill="#cbd5e1" />
         </React.Fragment>
     ))}
     {/* Body */}
     <rect x="-6" y="0" width="62" height="120" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="2" />
     {/* Label */}
     <text x="25" y="60" textAnchor="middle" transform="rotate(-90 25 60)" fill="#cbd5e1" fontSize="12" fontWeight="bold" fontFamily="monospace">TPA3116</text>
     <circle cx="5" cy="10" r="3" fill="#1e293b" />
  </g>
);


const SchematicView: React.FC<SchematicViewProps> = ({ state, onHoverPart, hoveredPartId }) => {
  // Determine wire colors based on state
  const powerColor = state.isPowered ? '#ef4444' : '#334155'; // Red or Slate-700
  const groundColor = '#3b82f6'; // Blue
  
  // Logic wire color (SDZ line)
  let sdzColor = '#334155';
  if (state.isPowered) {
    if (state.transistorState === 'ON') {
      sdzColor = '#3b82f6'; // Pulled to ground
    } else {
      sdzColor = '#f59e0b'; // High voltage (~21V)
    }
  }

  // Base current flow color
  const baseFlowColor = state.isPowered && state.transistorState === 'ON' ? '#fbbf24' : '#334155';

  return (
    <div className="w-full h-full bg-slate-800 rounded-xl overflow-hidden border border-slate-700 relative shadow-inner">
        <div className="absolute top-4 left-4 text-slate-400 text-sm font-mono z-10 pointer-events-none">
            {hoveredPartId ? "Realistic View Mode" : "Schematic View Mode"}
        </div>
      <svg viewBox="0 0 800 500" className="w-full h-full p-4">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
          </marker>
        </defs>

        {/* --- Main 24V Rail --- */}
        <path d="M 50 50 L 750 50" stroke={powerColor} strokeWidth="4" fill="none" />
        <text x="60" y="40" fill={powerColor} className="font-bold">24V DC</text>

        {/* --- Ground Rail --- */}
        <path d="M 50 450 L 750 450" stroke={groundColor} strokeWidth="4" fill="none" />
        <text x="60" y="440" fill={groundColor} className="font-bold">GND</text>

        {/* --- Capacitor Path (Left Branch) --- */}
        <line x1="200" y1="50" x2="200" y2="150" stroke={powerColor} strokeWidth="3" />
        
        {/* Capacitor: Symbol or Real */}
        <g 
            onMouseEnter={() => onHoverPart('c1')}
            onMouseLeave={() => onHoverPart(null)}
            className="cursor-pointer hover:opacity-80"
        >
            {/* Hitbox */}
            <rect x="170" y="140" width="60" height="80" fill="transparent" />
            
            {hoveredPartId === 'c1' ? (
                <RealCapacitor x={200} y={170} charge={state.capacitorCharge} />
            ) : (
                <>
                    <line x1="180" y1="150" x2="220" y2="150" stroke="#cbd5e1" strokeWidth="3" />
                    <line x1="180" y1="165" x2="220" y2="165" stroke="#cbd5e1" strokeWidth="3" />
                    <text x="230" y="160" fill="#cbd5e1" fontSize="14">10µF</text>
                    {/* Charge Indicator for Symbol */}
                    <rect x="225" y="140" width="10" height="35" fill="#000" stroke="#555" />
                    <rect x="225" y={175 - (state.capacitorCharge * 35)} width="10" height={state.capacitorCharge * 35} fill="#10b981" />
                </>
            )}
        </g>

        {/* Wire from Cap to Node */}
        <line x1="200" y1={hoveredPartId === 'c1' ? 200 : 165} x2="200" y2="250" stroke={baseFlowColor} strokeWidth="3" />

        {/* --- Resistor 100k (Discharge) --- */}
        <line x1="200" y1="250" x2="200" y2="300" stroke={baseFlowColor} strokeWidth="3" />
        <g 
            onMouseEnter={() => onHoverPart('r_discharge')}
            onMouseLeave={() => onHoverPart(null)}
            className="cursor-pointer hover:opacity-80"
        >
            {/* Hitbox */}
            <rect x="170" y="300" width="60" height="50" fill="transparent" />

            {hoveredPartId === 'r_discharge' ? (
                 <RealResistor x={200} y={325} rotate={90} bands={['brown', 'black', 'yellow', '#ffd700']} />
            ) : (
                <>
                    <path d="M 200 300 L 190 310 L 210 320 L 190 330 L 210 340 L 200 350" stroke="#cbd5e1" strokeWidth="3" fill="none" />
                    <text x="140" y="325" fill="#cbd5e1" fontSize="14">100kΩ</text>
                </>
            )}
        </g>
        <line x1="200" y1="350" x2="200" y2="450" stroke={groundColor} strokeWidth="3" />

        {/* --- Path to Base --- */}
        <line x1="200" y1="250" x2="300" y2="250" stroke={baseFlowColor} strokeWidth="3" />
        <g 
            onMouseEnter={() => onHoverPart('r_base')}
            onMouseLeave={() => onHoverPart(null)}
            className="cursor-pointer hover:opacity-80"
        >
            {/* Hitbox */}
             <rect x="300" y="220" width="50" height="60" fill="transparent" />

            {hoveredPartId === 'r_base' ? (
                <RealResistor x={325} y={250} rotate={0} bands={['red', 'red', 'orange', '#ffd700']} />
            ) : (
                <>
                    <path d="M 300 250 L 310 240 L 320 260 L 330 240 L 340 260 L 350 250" stroke="#cbd5e1" strokeWidth="3" fill="none" />
                    <text x="310" y="230" fill="#cbd5e1" fontSize="14">22kΩ</text>
                </>
            )}
        </g>
        <line x1="350" y1="250" x2="400" y2="250" stroke={baseFlowColor} strokeWidth="3" />

        {/* --- Transistor (BC548) --- */}
        <g 
            transform="translate(400, 200)"
            onMouseEnter={() => onHoverPart('q1')}
            onMouseLeave={() => onHoverPart(null)}
            className="cursor-pointer hover:opacity-80"
        >
             {/* Hitbox */}
             <rect x="-20" y="-10" width="80" height="120" fill="transparent" />

             {hoveredPartId === 'q1' ? (
                <RealTransistor x={40} y={50} />
             ) : (
                <>
                    {/* Base Line */}
                    <line x1="0" y1="50" x2="20" y2="50" stroke={baseFlowColor} strokeWidth="3" />
                    {/* Collector Path (Top) */}
                    <line x1="40" y1="0" x2="40" y2="30" stroke={sdzColor} strokeWidth="3" />
                    {/* Emitter Path (Bottom) */}
                    <line x1="40" y1="70" x2="40" y2="100" stroke={groundColor} strokeWidth="3" />
                    
                    {/* Transistor Circle body */}
                    <circle cx="40" cy="50" r="30" stroke="#94a3b8" strokeWidth="2" fill={state.transistorState === 'ON' ? '#22c55e' : '#1e293b'} fillOpacity="0.2" />
                    <text x="25" y="10" fill="#94a3b8" fontSize="12">BC548</text>
                    
                    {/* Internal Transistor Lines */}
                    <line x1="20" y1="30" x2="20" y2="70" stroke="#cbd5e1" strokeWidth="4" /> {/* Bar */}
                    <line x1="20" y1="40" x2="40" y2="30" stroke="#cbd5e1" strokeWidth="3" /> {/* To Collector */}
                    <line x1="20" y1="60" x2="40" y2="70" stroke="#cbd5e1" strokeWidth="3" /> {/* To Emitter */}
                    {/* Emitter Arrow */}
                    <path d="M 35 68 L 42 72 L 34 76" fill="#cbd5e1" />
                </>
             )}
        </g>

        {/* Emitter to Ground */}
        <line x1="440" y1="300" x2="440" y2="450" stroke={groundColor} strokeWidth="3" />


        {/* --- 12k Pull Up Resistor --- */}
        <line x1="600" y1="50" x2="600" y2="150" stroke={powerColor} strokeWidth="3" />
        <g 
            onMouseEnter={() => onHoverPart('r_pullup')}
            onMouseLeave={() => onHoverPart(null)}
            className="cursor-pointer hover:opacity-80"
        >
             {/* Hitbox */}
             <rect x="580" y="150" width="40" height="50" fill="transparent" />

            {hoveredPartId === 'r_pullup' ? (
                <RealResistor x={600} y={175} rotate={90} bands={['brown', 'red', 'orange', '#ffd700']} />
            ) : (
                <>
                    <path d="M 600 150 L 590 160 L 610 170 L 590 180 L 610 190 L 600 200" stroke="#cbd5e1" strokeWidth="3" fill="none" />
                    <text x="620" y="180" fill="#cbd5e1" fontSize="14">12kΩ</text>
                </>
            )}
        </g>
        <line x1="600" y1="200" x2="600" y2="230" stroke={sdzColor} strokeWidth="3" />

        {/* --- Connection to Collector and Amp --- */}
        <line x1="600" y1="230" x2="440" y2="230" stroke={sdzColor} strokeWidth="3" />
        <line x1="600" y1="230" x2="750" y2="230" stroke={sdzColor} strokeWidth="3" />

        {/* --- TPA3116 Chip --- */}
        <g 
            transform="translate(680, 200)"
            onMouseEnter={() => onHoverPart('chip')}
            onMouseLeave={() => onHoverPart(null)}
            className="cursor-pointer hover:opacity-80"
        >
            <rect x="0" y="0" width="100" height="150" fill="transparent" /> {/* Hitbox */}
            
            {hoveredPartId === 'chip' ? (
                <RealChip x={20} y={15} />
            ) : (
                <>
                    <rect x="0" y="0" width="100" height="150" rx="10" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
                    <text x="15" y="30" fill="#f1f5f9" fontWeight="bold">TPA3116</text>
                    
                    {/* SDZ Pin */}
                    <circle cx="0" cy="30" r="5" fill="#f59e0b" />
                    <text x="10" y="50" fill="#f59e0b" fontSize="12">SDZ Pin</text>

                    {/* Internal Logic */}
                    <text x="10" y="80" fill="#94a3b8" fontSize="12">Internal R</text>
                    <path d="M 50 85 L 45 90 L 55 95 L 45 100 L 55 105 L 50 110" stroke="#64748b" strokeWidth="2" fill="none" />
                    <text x="60" y="100" fill="#64748b" fontSize="10">100kΩ</text>
                    <line x1="50" y1="110" x2="50" y2="130" stroke={groundColor} strokeWidth="2" />
                    <line x1="40" y1="130" x2="60" y2="130" stroke={groundColor} strokeWidth="2" />
                </>
            )}

             {/* Status Text (Always show on top of chip or nearby) */}
             <rect x="10" y="120" width="80" height="20" rx="4" fill={state.sdzVoltage > 2 ? "#22c55e" : "#ef4444"} />
             <text x="50" y="134" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                {state.sdzVoltage > 2 ? "ACTIVE" : "MUTED"}
             </text>
        </g>

        {/* --- Info Overlay --- */}
        <text x="440" y="215" fill={sdzColor} fontSize="12" fontWeight="bold">
            {state.sdzVoltage.toFixed(1)}V
        </text>

      </svg>
    </div>
  );
};

export default SchematicView;