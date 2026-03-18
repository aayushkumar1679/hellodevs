import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProjectStore } from "@/state/useProjectStore";

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

describe('Store Undo/Redo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    useProjectStore.setState({
      currentProjectId: 'test-project',
      projects: {},
      currentProject: {
        id: 'test-project',
        name: 'Test Project',
        components: {
          'root': {
            id: 'root',
            type: 'section',
            children: [],
            props: {},
            cssOverrides: { base: { backgroundColor: '#ffffff' } },
            animations: [],
            assets: [],
            meta: {},
          }
        },
        rootOrder: ['root'],
        rootComponent: 'root',
        assets: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      history: [],
      future: []
    });
  });

  it('should push a history snapshot when updateComponentCSSOverride is called', () => {
    const store = useProjectStore.getState();
    store.updateComponentCSSOverride('root', 'desktop', 'backgroundColor', '#ff0000');
    const state = useProjectStore.getState();
    // History should have one entry (the state before the update)
    expect(state.history.length).toBeGreaterThanOrEqual(1);
    expect(state.currentProject?.components['root'].cssOverrides.base.backgroundColor).toBe('#ff0000');
  });

  it('should undo style changes correctly', () => {
    const store = useProjectStore.getState();
    
    useProjectStore.setState({ history: [] });

    // Change background to green
    store.updateComponentCSSOverride('root', 'desktop', 'backgroundColor', '#00ff00');
    expect(useProjectStore.getState().history.length).toBeGreaterThanOrEqual(1);

    // Perform undo
    useProjectStore.getState().undo();

    const state = useProjectStore.getState();
    // Should be back to original white
    expect(state.currentProject?.components['root'].cssOverrides.base.backgroundColor).toBe('#ffffff');
  });
});
