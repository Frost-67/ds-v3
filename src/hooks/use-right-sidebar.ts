import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from './use-app-selector';
import {
    setActiveTab as setActiveTabAction,
    closeTab as closeTabAction,
    toggleTab as toggleTabAction,
    setSidebarWidth as setSidebarWidthAction,
    setIsResizing as setIsResizingAction,
    RightSidebarTab,
} from '~/store/slices/right-sidebar-slice';

export const useRightSidebar = () => {
    const dispatch = useDispatch();
    const {
        activeTab,
        isOpen,
        sidebarWidth,
        minWidth,
        maxWidth,
        isResizing,
    } = useAppSelector((state) => state.rightSidebar);

    const setActiveTab = useCallback((tab: RightSidebarTab) => {
        dispatch(setActiveTabAction(tab));
    }, [dispatch]);

    const closeTab = useCallback(() => {
        dispatch(closeTabAction());
    }, [dispatch]);

    const toggleTab = useCallback((tab: RightSidebarTab) => {
        dispatch(toggleTabAction(tab));
    }, [dispatch, activeTab]);

    const setSidebarWidth = useCallback((width: number) => {
        dispatch(setSidebarWidthAction(width));
    }, [dispatch]);

    const setResizing = useCallback((resizing: boolean) => {
        dispatch(setIsResizingAction(resizing));
    }, [dispatch]);


    return {
        activeTab,
        isOpen,
        sidebarWidth,
        minWidth,
        maxWidth,
        isResizing,
        setActiveTab,
        closeTab,
        toggleTab,
        setSidebarWidth,
        setResizing,
    };
};