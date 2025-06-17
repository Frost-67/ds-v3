//@ts-nocheck
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from './use-app-selector';
import {
  addTab,
  removeTab,
  setActiveTab,
  updateTabName,
  startEditingTab,
  stopEditingTab,
  toggleExpanded,
  scrollTabs,
  setScrollPosition,
  duplicateTab,
  TabType,
} from '~/store/slices/bottom-tabs-slice';

export const useBottomTabs = () => {
  const dispatch = useDispatch();
  const bottomTabsState = useAppSelector((state) => state.bottomTabs);

  // Tab Management
  const createTab = useCallback((name: string, type: TabType['type']) => {
    dispatch(addTab({ name, type }));
  }, [dispatch]);

  const deleteTab = useCallback((tabId: string) => {
    dispatch(removeTab(tabId));
  }, [dispatch]);

  const activateTab = useCallback((tabId: string) => {
    dispatch(setActiveTab(tabId));
  }, [dispatch]);

  const renameTab = useCallback((tabId: string, newName: string) => {
    dispatch(updateTabName({ id: tabId, name: newName }));
  }, [dispatch]);

  const cloneTab = useCallback((tabId: string) => {
    dispatch(duplicateTab(tabId));
  }, [dispatch]);

  // Editing State
  const startEditing = useCallback((tabId: string) => {
    dispatch(startEditingTab(tabId));
  }, [dispatch]);

  const stopEditing = useCallback((tabId?: string) => {
    dispatch(stopEditingTab(tabId || null));
  }, [dispatch]);

  // UI State
  const toggleTabsExpanded = useCallback(() => {
    dispatch(toggleExpanded());
  }, [dispatch]);

  const scrollTabsLeft = useCallback(() => {
    dispatch(scrollTabs('left'));
  }, [dispatch]);

  const scrollTabsRight = useCallback(() => {
    dispatch(scrollTabs('right'));
  }, [dispatch]);

  const jumpToTabPage = useCallback((pageIndex: number) => {
    dispatch(setScrollPosition(pageIndex * bottomTabsState.maxVisibleTabs));
  }, [dispatch, bottomTabsState.maxVisibleTabs]);

  // Computed values
  const activeTab = bottomTabsState.tabs.find(tab => tab.id === bottomTabsState.activeTabId);
  const editingTab = bottomTabsState.tabs.find(tab => tab.id === bottomTabsState.editingTabId);
  const visibleTabs = bottomTabsState.tabs.slice(
    bottomTabsState.scrollPosition, 
    bottomTabsState.scrollPosition + bottomTabsState.maxVisibleTabs
  );
  
  const canScrollLeft = bottomTabsState.scrollPosition > 0;
  const canScrollRight = bottomTabsState.scrollPosition + bottomTabsState.maxVisibleTabs < bottomTabsState.tabs.length;
  const totalPages = Math.ceil(bottomTabsState.tabs.length / bottomTabsState.maxVisibleTabs);
  const currentPage = Math.floor(bottomTabsState.scrollPosition / bottomTabsState.maxVisibleTabs);

  return {
    // State
    ...bottomTabsState,
    activeTab,
    editingTab,
    visibleTabs,
    canScrollLeft,
    canScrollRight,
    totalPages,
    currentPage,

    // Actions
    createTab,
    deleteTab,
    activateTab,
    renameTab,
    cloneTab,
    startEditing,
    stopEditing,
    toggleTabsExpanded,
    scrollTabsLeft,
    scrollTabsRight,
    jumpToTabPage,
  };
};