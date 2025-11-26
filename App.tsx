import React, { useState, useEffect, useRef } from 'react';
import { CircuitState, PartInfo } from './types';
import { COMPONENTS, SIMULATION_SPEED, CAPACITOR_CHARGE_RATE, SUPPLY_VOLTAGE } from './constants';
import SchematicView from './components/SchematicView';
import SimulationControls from './components/SimulationControls';
import ComponentCard from './components/ComponentCard';
import { streamCircuitExplanation } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Send, Bot, User, Activity } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [state, setState] = useState<CircuitState>({
    isPowered: false,
    timeElapsed: 0,
    capacitorCharge: 0,
    transistorState: 'OFF',
    sdzVoltage: 0,
    supplyVoltage: 0,
  });

  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<PartInfo | null>(null);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    {role: 'model', text: 'Hi! I am your AI electronics tutor. Turn on the power to see the circuit in action, or ask me anything about how this anti-pop circuit works!'}
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Graph Data history
  const [graphData, setGraphData] = useState<{time: number, voltage: number}[]>([]);

  // --- Effects ---

  // Update hovered part object
  useEffect(() => {
    if (hoveredPartId) {
      const part = COMPONENTS.find(c => c.id === hoveredPartId);
      setHoveredPart(part || null);
    } else {
      setHoveredPart(null);
    }
  }, [hoveredPartId]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prevState => {
        let newCharge = prevState.capacitorCharge;
        let newTransistorState: 'ON' | 'OFF' = 'OFF';
        let newSdzVoltage = 0;
        let newTime = prevState.timeElapsed + (SIMULATION_SPEED / 1000);

        if (prevState.isPowered) {
            // Charging Logic
            if (newCharge < 1) {
                newCharge = Math.min(1, newCharge + CAPACITOR_CHARGE_RATE);
            }
            
            // Transistor Logic:
            // When Cap is charging (flow exists), Transistor Base gets current -> ON.
            // When Cap is full (charge > 0.9 approx), flow stops -> Base drops -> OFF.
            // Simplified threshold for visualizer:
            if (newCharge < 0.85) {
                newTransistorState = 'ON';
            } else {
                newTransistorState = 'OFF';
            }

            // SDZ Voltage Logic
            if (newTransistorState === 'ON') {
                // Transistor pulls it low
                newSdzVoltage = 0.2; 
            } else {
                // Voltage Divider: 24V * (Internal 100k / (External 12k + Internal 100k))
                // Actually user said external is 12k. Usually 12k pullup and 100k internal.
                // V = 24 * (100 / 112) = ~21.4V
                newSdzVoltage = 21.4;
            }

        } else {
            // Discharging Logic
            if (newCharge > 0) {
                newCharge = Math.max(0, newCharge - (CAPACITOR_CHARGE_RATE * 2)); // Discharge faster
            }
            newTransistorState = 'OFF';
            
            // Power off SDZ drops immediately because main rail drops
            newSdzVoltage = 0;
        }

        return {
            ...prevState,
            timeElapsed: newTime,
            capacitorCharge: newCharge,
            transistorState: newTransistorState,
            sdzVoltage: newSdzVoltage,
            supplyVoltage: prevState.isPowered ? SUPPLY_VOLTAGE : 0
        };
      });
    }, SIMULATION_SPEED);

    return () => clearInterval(interval);
  }, []);

  // Graph Update
  useEffect(() => {
    setGraphData(prev => {
        const newData = [...prev, { time: parseFloat(state.timeElapsed.toFixed(1)), voltage: state.sdzVoltage }];
        if (newData.length > 50) newData.shift(); // Keep last 50 points
        return newData;
    });
  }, [state.sdzVoltage]); 

  // --- Handlers ---

  const handleTogglePower = () => {
    setState(prev => ({ ...prev, isPowered: !prev.isPowered }));
    setGraphData([]); // Reset graph on toggle? Or keep running? Let's reset for clarity.
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    const circuitContext = `
      Power is ${state.isPowered ? 'ON' : 'OFF'}.
      Capacitor Charge is ${(state.capacitorCharge * 100).toFixed(0)}%.
      Transistor is ${state.transistorState}.
      SDZ Voltage is ${state.sdzVoltage.toFixed(1)}V.
      The Amp is ${state.sdzVoltage > 2 ? 'Playing' : 'Muted'}.
    `;

    let fullResponse = "";
    setMessages(prev => [...prev, { role: 'model', text: "" }]);

    await streamCircuitExplanation(userMsg, circuitContext, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1].text = fullResponse;
            return newArr;
        });
    });
    
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 md:p-8">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center border-b border-slate-700 pb-6">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Anti-Pop Circuit Visualizer
            </h1>
            <p className="text-slate-400 mt-2">Interactive Simulation for TPA3116 Amplifier</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 text-sm font-mono text-slate-500">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Power Line
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Signal Logic
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div> Active State
            </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Schematic (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Visualizer Container */}
            <div className="aspect-video bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                <SchematicView 
                  state={state} 
                  onHoverPart={setHoveredPartId} 
                  hoveredPartId={hoveredPartId} 
                />
            </div>

            {/* Explanation / Component Card */}
            <ComponentCard part={hoveredPart} />

            {/* Voltage Graph */}
            <div className="h-64 bg-slate-800 rounded-xl border border-slate-700 p-4">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                        <Activity size={16} /> SDZ Voltage vs Time
                    </h3>
                    <span className="text-xs text-slate-500">Threshold: 2.0V</span>
                 </div>
                 <div className="h-full w-full -ml-4">
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={graphData}>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 25]} stroke="#64748b" fontSize={10} width={40} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9'}} 
                                labelStyle={{display: 'none'}}
                                itemStyle={{color: '#3b82f6'}}
                            />
                            <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="voltage" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
            </div>

        </div>

        {/* Right Column: Controls & Chat (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Controls */}
            <SimulationControls state={state} onTogglePower={handleTogglePower} />

            {/* AI Tutor Chat */}
            <div className="flex-1 min-h-[400px] bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                    <h3 className="font-bold text-slate-200 flex items-center gap-2">
                        <Bot size={20} className="text-blue-400" /> Circuit Assistant
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                m.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-slate-700 text-slate-200 rounded-bl-none'
                            }`}>
                                {m.text || (isTyping && i === messages.length - 1 ? <span className="animate-pulse">Thinking...</span> : "")}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                    <div className="relative">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Why does the capacitor charge?"
                            className="w-full bg-slate-900 border border-slate-600 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={isTyping}
                            className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default App;