
import { Ritual, RitualType } from './types';

export const DEFAULT_RITUALS: Omit<Ritual, 'completed' | 'value'>[] = [
  { id: 'wake-up', name: 'Wake up time', type: RitualType.Time },
  { id: 'stretching', name: 'Stretching', type: RitualType.Checkbox },
  { id: 'sunlight-walk', name: 'Walk 10 minutes in sunlight', type: RitualType.Checkbox },
  { id: 'run', name: 'Run for 30 minutes', type: RitualType.Checkbox },
  { id: 'steps', name: 'Walk 10K steps', type: RitualType.Checkbox },
  { id: 'diet', name: 'Follow diet - 3x meals', type: RitualType.Checkbox },
  { id: 'no-alcohol', name: 'No alcohol', type: RitualType.Checkbox },
  { id: 'workout', name: 'Workout for 45 minutes', type: RitualType.Checkbox },
  { id: 'sleep-time', name: 'Sleep time', type: RitualType.Time },
];
