// Observation Selectors

import { Observation } from '../services/types';

export function selectActiveObservations(observations: Observation[]): Observation[] {
  return observations.filter((o) => !o.resolved);
}

export function selectResolvedObservations(observations: Observation[]): Observation[] {
  return observations.filter((o) => o.resolved);
}

