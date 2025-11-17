export enum RitualType {
  Checkbox = 'checkbox',
  Time = 'time',
}

export interface Ritual {
  id: string;
  name: string;
  type: RitualType;
  completed: boolean;
  value: string | null;
}

export interface DailyData {
  rituals: Ritual[];
  journal?: string;
}

export interface AppData {
  [date: string]: DailyData;
}

export type View = 'daily' | 'calendar';