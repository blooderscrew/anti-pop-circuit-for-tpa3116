import { PartInfo } from './types';

export const COMPONENTS: PartInfo[] = [
  {
    id: 'c1',
    name: 'Capacitor',
    value: '10µF',
    description: 'Stores electrical energy. In this circuit, it acts as a timer. When power turns on, it allows current to flow briefly while it charges up.',
    role: 'The Timer'
  },
  {
    id: 'r_base',
    name: 'Base Resistor',
    value: '22kΩ',
    description: 'Limits the current flowing into the transistor base to prevent damage.',
    role: 'Current Limiter'
  },
  {
    id: 'r_discharge',
    name: 'Discharge Resistor',
    value: '100kΩ',
    description: 'Provides a path for the capacitor to discharge when power is turned off, resetting the timer for the next use.',
    role: 'Reset Switch'
  },
  {
    id: 'q1',
    name: 'NPN Transistor',
    value: 'BC548',
    description: 'An electronic switch. When current flows into its Base (B), it connects the Collector (C) to Emitter (E), pulling the signal to ground.',
    role: 'The Switch'
  },
  {
    id: 'r_pullup',
    name: 'Pull-Up Resistor',
    value: '12kΩ',
    description: 'Connects the SDZ pin to 24V. Together with the internal 100kΩ resistor, it sets the voltage to the correct level for "On".',
    role: 'Voltage Setter'
  },
  {
    id: 'chip',
    name: 'Amplifier Chip',
    value: 'TPA3116',
    description: 'The main audio amplifier. It has an SDZ (Shutdown) pin. If SDZ is Low (<2V), it is Muted. If High (>2V), it plays sound.',
    role: ' The Brain'
  }
];

export const SIMULATION_SPEED = 10; // ms per tick
export const CAPACITOR_CHARGE_RATE = 0.02; // Charge increment per tick
export const THRESHOLD_VOLTAGE = 2.0; // SDZ threshold
export const SUPPLY_VOLTAGE = 24.0;
