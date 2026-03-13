import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCanvasStore } from '../useCanvasStore';
import { useDesignStore } from '../useDesignStore';

// Mock lodash.debounce to execute immediately
vi.mock('lodash.debounce', () => ({
  default: (fn: (...args: unknown[]) => unknown) => fn,
}));

// Mock fetch globally
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

describe('State Synchronization & Undo/Redo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset stores to a clean state
    useCanvasStore.setState({
      currentProjectId: 'test-project',
      projects: {},
      currentProject: {
        id: 'test-project',
        name: 'Test Project',
        components: {
          'root': {
            id: 'root',
            type: 'box',
            children: [],
            styles: { backgroundColor: '#ffffff' }
          }
        },
        rootOrder: ['root'],
        assets: [],
        designElements: {
          'root': {
            id: 'root',
            type: 'box',
            cssProperties: { base: { backgroundColor: '#ffffff' } }
          }
        }
      },
      history: [],
      future: []
    });

    useDesignStore.setState({
      selectedElements: ['root'],
      elements: {
        'root': {
          id: 'root',
          type: 'box',
          cssProperties: { base: { backgroundColor: '#ffffff' } }
        }
      }
    });
  });

  it('should push a history snapshot when design elements are synced', () => {
    const { syncCurrentProjectDesignElements } = useCanvasStore.getState();
    
    // Clear any initial sync history
    useCanvasStore.setState({ history: [] });

    // Update design store
    const updatedElements = {
      'root': {
        id: 'root',
        type: 'box',
        cssProperties: { base: { backgroundColor: '#ff0000' } }
      }
    };
    
    // Explicit sync with history push
    syncCurrentProjectDesignElements(updatedElements, true);

    const state = useCanvasStore.getState();
    expect(state.history.length).toBeGreaterThanOrEqual(1);
    expect(state.currentProject?.designElements['root'].cssProperties.base.backgroundColor).toBe('#ff0000');
  });

  it('should undo style changes correctly', () => {
    const { syncCurrentProjectDesignElements, undo } = useCanvasStore.getState();
    
    // Clear any initial history
    useCanvasStore.setState({ history: [] });

    // State at T0: #ffffff (empty history)
    
    // Change to T1: #00ff00 (should push T0 to history)
    const updatedElements = {
      'root': {
        id: 'root',
        type: 'box',
        cssProperties: { base: { backgroundColor: '#00ff00' } }
      }
    };
    syncCurrentProjectDesignElements(updatedElements, true);

    expect(useCanvasStore.getState().history.length).toBeGreaterThanOrEqual(1);

    // Perform undo
    undo();

    const state = useCanvasStore.getState();
    // Should be back to T0
    expect(state.currentProject?.designElements['root'].cssProperties.base.backgroundColor).toBe('#ffffff');
    expect(useDesignStore.getState().elements['root'].cssProperties.base.backgroundColor).toBe('#ffffff');
  });
});
