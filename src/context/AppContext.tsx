import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    ProjectConfig,
    Unit,
    Elevation,
    ElevationView,
    UnitInfo,
    ViewType,
    AppContextType
} from '~/types/project-config.types';

import projectConfigData from '~/data/project-config.json';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Navigation state
    const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
    const [activeElevationId, setActiveElevationId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<ViewType>('external');

    // Load project configuration
    const loadProject = async (config?: ProjectConfig) => {
        try {
            setLoading(true);
            setError(null);

            const configToLoad = config || (projectConfigData as unknown as ProjectConfig);
            setProjectConfig(configToLoad);

            // Set initial active states
            const firstUnitId = Object.keys(configToLoad.units)[0];
            if (firstUnitId) {
                setActiveUnitId(firstUnitId);

                const firstUnit = configToLoad.units[firstUnitId];
                const activeElevation = Object.values(firstUnit.elevations).find(el => el.isActive);
                const firstElevationId = activeElevation?.id || Object.keys(firstUnit.elevations)[0];

                if (firstElevationId) {
                    setActiveElevationId(firstElevationId);
                }
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load project configuration');
            console.error('Failed to load project config:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProject();
    }, []);

    // Navigation actions
    const handleSetActiveUnit = (unitId: string) => {
        if (!projectConfig || !projectConfig.units[unitId]) return;

        setActiveUnitId(unitId);

        // Set first elevation as active when switching units
        const unit = projectConfig.units[unitId];
        const activeElevation = Object.values(unit.elevations).find(el => el.isActive);
        const firstElevationId = activeElevation?.id || Object.keys(unit.elevations)[0];

        if (firstElevationId) {
            setActiveElevationId(firstElevationId);
        }
    };

    const handleSetActiveElevation = (elevationId: string) => {
        if (!projectConfig || !activeUnitId) return;

        const unit = projectConfig.units[activeUnitId];
        if (!unit.elevations[elevationId]) return;

        setActiveElevationId(elevationId);
    };

    const handleSetActiveView = (view: ViewType) => {
        setActiveView(view);
    };

    // Update project configuration
    const updateProjectConfig = (updates: Partial<ProjectConfig>) => {
        if (!projectConfig) return;

        setProjectConfig(prev => ({
            ...prev!,
            ...updates,
            metadata: {
                ...prev!.metadata,
                lastModified: new Date().toISOString()
            }
        }));
    };

    // Computed getters
    const getCurrentUnit = (): Unit | null => {
        if (!projectConfig || !activeUnitId) return null;
        return projectConfig.units[activeUnitId] || null;
    };

    const getCurrentElevation = (): Elevation | null => {
        const unit = getCurrentUnit();
        if (!unit || !activeElevationId) return null;
        return unit.elevations[activeElevationId] || null;
    };

    const getCurrentView = (): ElevationView | null => {
        const elevation = getCurrentElevation();
        if (!elevation) return null;
        return elevation.views[activeView] || null;
    };

    const getUnitList = (): UnitInfo[] => {
        if (!projectConfig) return [];
        return Object.values(projectConfig.units).map(unit => unit.unitInfo);
    };

    const getElevationList = (unitId?: string): Elevation[] => {
        const targetUnitId = unitId || activeUnitId;
        if (!projectConfig || !targetUnitId) return [];

        const unit = projectConfig.units[targetUnitId];
        if (!unit) return [];

        return Object.values(unit.elevations);
    };

    // Context value
    const contextValue: AppContextType = {
        // Data
        projectConfig,
        loading,
        error,

        // Navigation state
        activeUnitId,
        activeElevationId,
        activeView,

        // Actions
        loadProject,
        setActiveUnit: handleSetActiveUnit,
        setActiveElevation: handleSetActiveElevation,
        setActiveView: handleSetActiveView,
        updateProjectConfig,

        // Computed getters
        getCurrentUnit,
        getCurrentElevation,
        getCurrentView,
        getUnitList,
        getElevationList,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// Helper hooks for specific data
export const useCurrentUnit = () => {
    const { getCurrentUnit } = useAppContext();
    return getCurrentUnit();
};

export const useCurrentElevation = () => {
    const { getCurrentElevation } = useAppContext();
    return getCurrentElevation();
};

export const useCurrentView = () => {
    const { getCurrentView } = useAppContext();
    return getCurrentView();
};

export const useProjectInfo = () => {
    const { projectConfig } = useAppContext();
    return projectConfig?.projectInfo || null;
};

export const useCanvasConfig = () => {
    const { projectConfig } = useAppContext();
    return projectConfig?.canvas || null;
};