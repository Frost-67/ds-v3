import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RightSidebarTab = '3d-overview' | 'questionnaire' | 'project-info' | null;

type RightSidebarState = {
    activeTab: RightSidebarTab;
    isOpen: boolean;
    sidebarWidth: number;
    minWidth: number;
    maxWidth: number;
    isResizing: boolean;
};

const initialState: RightSidebarState = {
    activeTab: null,
    isOpen: false,
    sidebarWidth: 400,
    minWidth: 350,
    maxWidth: 600,
    isResizing: false,
};

const rightSidebarSlice = createSlice({
    name: 'rightSidebar',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<RightSidebarTab>) => {
            state.activeTab = action.payload;
            state.isOpen = action.payload !== null;
        },

        closeTab: (state) => {
            state.activeTab = null;
            state.isOpen = false;
        },

        toggleTab: (state, action: PayloadAction<RightSidebarTab>) => {
            const tab = action.payload;

            if (state.activeTab === tab) {
                state.activeTab = null;
                state.isOpen = false;
            } else {
                state.activeTab = tab;
                state.isOpen = true;
            }
        },

        setSidebarWidth: (state, action: PayloadAction<number>) => {
            const newWidth = action.payload;

            if (!isNaN(newWidth) && isFinite(newWidth) && newWidth > 0) {
                const constrainedWidth = Math.max(state.minWidth, Math.min(state.maxWidth, newWidth));
                state.sidebarWidth = constrainedWidth;
            }
        },

        setIsResizing: (state, action: PayloadAction<boolean>) => {
            state.isResizing = action.payload;
        },
    },
});

export const {
    setActiveTab,
    closeTab,
    toggleTab,
    setSidebarWidth,
    setIsResizing,
} = rightSidebarSlice.actions;

export default rightSidebarSlice.reducer;