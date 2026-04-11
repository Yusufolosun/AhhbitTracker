import type { AppStateAction } from './actions';
import type { AppState } from './types';

export function createInitialAppState(): AppState {
  return {
    trackedAddress: null,
    isHydrating: true,
    preview: null,
  };
}

export function appStateReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'hydrate:start':
      return {
        ...state,
        isHydrating: true,
      };
    case 'hydrate:complete':
      return {
        ...state,
        trackedAddress: action.payload.trackedAddress,
        isHydrating: false,
        preview: null,
      };
    case 'address:set':
      return {
        ...state,
        trackedAddress: action.payload.trackedAddress,
        preview: null,
      };
    case 'address:clear':
      return {
        ...state,
        trackedAddress: null,
        preview: null,
      };
    case 'preview:set':
      return {
        ...state,
        preview: action.payload.preview,
      };
    case 'preview:clear':
      return {
        ...state,
        preview: null,
      };
    default:
      return state;
  }
}