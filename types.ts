export enum ComponentType {
  CAPACITOR = 'CAPACITOR',
  RESISTOR = 'RESISTOR',
  TRANSISTOR = 'TRANSISTOR',
  CHIP = 'CHIP',
  SOURCE = 'SOURCE'
}

export interface CircuitState {
  isPowered: boolean;
  timeElapsed: number; // in milliseconds
  capacitorCharge: number; // 0 to 1 (percentage)
  transistorState: 'ON' | 'OFF';
  sdzVoltage: number; // Volts
  supplyVoltage: number; // Volts
}

export interface PartInfo {
  id: string;
  name: string;
  value: string;
  description: string;
  role: string;
}