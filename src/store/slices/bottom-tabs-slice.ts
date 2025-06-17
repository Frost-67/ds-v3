import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TabType = {
  id: string;
  name: string;
  type: 'page' | 'elevation';
  isActive: boolean;
  isEditing?: boolean;
  createdAt: number;
  updatedAt: number;
  content?: any;
};

type BottomTabsState = {
  tabs: TabType[];
  activeTabId: string | null;
  isExpanded: boolean;
  scrollPosition: number;
  maxVisibleTabs: number;
  editingTabId: string | null;
};

const initialState: BottomTabsState = {
  tabs: [
    { 
      id: '1', 
      name: 'Living Room', 
      type: 'elevation', 
      isActive: true,
      isEditing: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  activeTabId: '1',
  isExpanded: true,
  scrollPosition: 0,
  maxVisibleTabs: 4,
  editingTabId: null,
};

const bottomTabsSlice = createSlice({
  name: 'bottomTabs',
  initialState,
  reducers: {
    // Tab Management
    addTab: (state, action: PayloadAction<Pick<TabType, 'name' | 'type'>>) => {
      const newTab: TabType = {
        id: Date.now().toString(),
        name: action.payload.name,
        type: action.payload.type,
        isActive: false,
        isEditing: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.tabs.push(newTab);
    },
    
    removeTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      const tabIndex = state.tabs.findIndex(tab => tab.id === tabId);
      
      if (tabIndex === -1) return;
      
      // Remove the tab
      state.tabs.splice(tabIndex, 1);
      
      // Handle active tab logic
      if (state.activeTabId === tabId) {
        if (state.tabs.length > 0) {
          // Set the next tab as active, or previous if it was the last tab
          const nextActiveIndex = Math.min(tabIndex, state.tabs.length - 1);
          const newActiveTab = state.tabs[nextActiveIndex];
          state.activeTabId = newActiveTab.id;
          newActiveTab.isActive = true;
        } else {
          state.activeTabId = null;
        }
      }
      
      // Reset editing state if the removed tab was being edited
      if (state.editingTabId === tabId) {
        state.editingTabId = null;
      }
      
      // Adjust scroll position if necessary
      const maxScrollPosition = Math.max(0, state.tabs.length - state.maxVisibleTabs);
      if (state.scrollPosition > maxScrollPosition) {
        state.scrollPosition = maxScrollPosition;
      }
    },
    
    setActiveTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      
      // Update all tabs' active state
      state.tabs.forEach(tab => {
        tab.isActive = tab.id === tabId;
      });
      
      state.activeTabId = tabId;
      
      // Stop editing when switching tabs
      if (state.editingTabId && state.editingTabId !== tabId) {
        const editingTab = state.tabs.find(tab => tab.id === state.editingTabId);
        if (editingTab) {
          editingTab.isEditing = false;
        }
        state.editingTabId = null;
      }
    },
    
    updateTabName: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const { id, name } = action.payload;
      const tab = state.tabs.find(tab => tab.id === id);
      if (tab) {
        // Only update the name, don't apply fallback until editing is finished
        tab.name = name;
        tab.updatedAt = Date.now();
      }
    },
    
    finishEditingTabName: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      const tab = state.tabs.find(tab => tab.id === tabId);
      if (tab) {
        // Apply fallback only when editing is finished and name is empty
        const trimmedName = tab.name.trim();
        if (!trimmedName) {
          tab.name = tab.type === 'elevation' ? 'Untitled elevation' : 'Untitled page';
        } else {
          tab.name = trimmedName;
        }
        tab.isEditing = false;
        tab.updatedAt = Date.now();
      }
      state.editingTabId = null;
    },
    
    updateTab: (state, action: PayloadAction<{ id: string; updates: Partial<TabType> }>) => {
      const { id, updates } = action.payload;
      const tab = state.tabs.find(tab => tab.id === id);
      if (tab) {
        Object.assign(tab, { ...updates, updatedAt: Date.now() });
      }
    },
    
    // Editing State Management
    startEditingTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      
      // Stop editing any other tab
      state.tabs.forEach(tab => {
        tab.isEditing = tab.id === tabId;
      });
      
      state.editingTabId = tabId;
    },
    
    stopEditingTab: (state, action: PayloadAction<string | null> = { payload: null, type: '' }) => {
      const tabId = action.payload || state.editingTabId;
      
      if (tabId) {
        const tab = state.tabs.find(tab => tab.id === tabId);
        if (tab) {
          // Apply fallback when stopping edit if name is empty
          const trimmedName = tab.name.trim();
          if (!trimmedName) {
            tab.name = tab.type === 'elevation' ? 'Untitled elevation' : 'Untitled page';
          } else {
            tab.name = trimmedName;
          }
          tab.isEditing = false;
        }
      }
      
      state.editingTabId = null;
    },
    
    // UI State Management
    toggleExpanded: (state) => {
      state.isExpanded = !state.isExpanded;
      
      // Stop editing when collapsing
      if (!state.isExpanded && state.editingTabId) {
        const editingTab = state.tabs.find(tab => tab.id === state.editingTabId);
        if (editingTab) {
          editingTab.isEditing = false;
        }
        state.editingTabId = null;
      }
    },
    
    setExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
      
      // Stop editing when collapsing
      if (!state.isExpanded && state.editingTabId) {
        const editingTab = state.tabs.find(tab => tab.id === state.editingTabId);
        if (editingTab) {
          editingTab.isEditing = false;
        }
        state.editingTabId = null;
      }
    },
    
    // Scrolling
    setScrollPosition: (state, action: PayloadAction<number>) => {
      const maxPosition = Math.max(0, state.tabs.length - state.maxVisibleTabs);
      state.scrollPosition = Math.min(Math.max(0, action.payload), maxPosition);
    },
    
    scrollTabs: (state, action: PayloadAction<'left' | 'right'>) => {
      const direction = action.payload;
      const maxPosition = Math.max(0, state.tabs.length - state.maxVisibleTabs);
      
      if (direction === 'left') {
        state.scrollPosition = Math.max(0, state.scrollPosition - 1);
      } else {
        state.scrollPosition = Math.min(maxPosition, state.scrollPosition + 1);
      }
    },
    
    setMaxVisibleTabs: (state, action: PayloadAction<number>) => {
      state.maxVisibleTabs = Math.max(1, action.payload);
      
      // Adjust scroll position if necessary
      const maxPosition = Math.max(0, state.tabs.length - state.maxVisibleTabs);
      if (state.scrollPosition > maxPosition) {
        state.scrollPosition = maxPosition;
      }
    },
    
    // Tab Reordering
    reorderTabs: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
          fromIndex >= state.tabs.length || toIndex >= state.tabs.length) {
        return;
      }
      
      const [movedTab] = state.tabs.splice(fromIndex, 1);
      state.tabs.splice(toIndex, 0, movedTab);
      
      // Update timestamps
      movedTab.updatedAt = Date.now();
    },
    
    // Bulk Operations
    closeAllTabs: (state) => {
      state.tabs = [];
      state.activeTabId = null;
      state.editingTabId = null;
      state.scrollPosition = 0;
    },
    
    duplicateTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      const tab = state.tabs.find(t => t.id === tabId);
      
      if (tab) {
        const duplicatedTab: TabType = {
          ...tab,
          id: Date.now().toString(),
          name: `${tab.name} Copy`,
          isActive: false,
          isEditing: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        // Insert after the original tab
        const originalIndex = state.tabs.findIndex(t => t.id === tabId);
        state.tabs.splice(originalIndex + 1, 0, duplicatedTab);
      }
    },
  },
});

export const {
  addTab,
  removeTab,
  setActiveTab,
  updateTabName,
  finishEditingTabName,
  updateTab,
  startEditingTab,
  stopEditingTab,
  toggleExpanded,
  setExpanded,
  setScrollPosition,
  scrollTabs,
  setMaxVisibleTabs,
  reorderTabs,
  closeAllTabs,
  duplicateTab,
} = bottomTabsSlice.actions;

export default bottomTabsSlice.reducer;