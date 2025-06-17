// Base types for project configuration

export interface ProjectInfo {
    id: string;
    name: string;
    description: string;
    client: {
        name: string;
        email: string;
        phone: string;
    };
    location: string;
    startDate: string;
    endDate: string;
    budget: {
        total: string;
        used: string;
        percentage: number;
    };
    status: string;
}

export interface CanvasConfig {
    defaultSize: {
        width: number;
        height: number;
    };
    presetSizes: Array<{
        name: string;
        width: number;
        height: number;
    }>;
    grid: {
        defaultSize: number;
        color: string;
        snapToGrid: boolean;
    };
}

export interface Overview3D {
    images: string[];
    selectedImageIndex: number;
    summary: {
        title: string;
        description: string;
        stats: Array<{
            label: string;
            value: string;
        }>;
    };
}

export interface QuestionnaireQuestion {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export interface Questionnaire {
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    questions: QuestionnaireQuestion[];
}

export interface ProjectNote {
    id: string;
    text: string;
    date: string;
    author: string;
    category: string;
}

export interface Task {
    id: string;
    name: string;
    status: 'pending' | 'in-progress' | 'completed';
    date: string;
    assignee: string;
    description: string;
}

export interface PresetElement {
    type: string;
    shapeType?: string;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth?: number;
    [key: string]: any;
}

export interface PresetItem {
    id: string;
    name: string;
    type: string;
    canvas: {
        width: number;
        height: number;
    };
    elements: PresetElement[];
}

export interface PresetCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
    items: PresetItem[];
}

export interface Presets {
    categories: PresetCategory[];
}

// Canvas element types (for elevation views)
export interface CanvasElement {
    id: string;
    type: 'shape' | 'text' | 'image';
    shapeType?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    draggable?: boolean;
    z_index?: number;
    updatedAt?: number;
    offsetX?: number;
    offsetY?: number;
    scaleX?: number;
    scaleY?: number;

    // Text specific properties
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    align?: string;
    lineHeight?: number;
    letterSpacing?: number;
    rotation?: number;
    textDecoration?: string;
    fontVariants?: string[];
    webFont?: boolean;

    [key: string]: any;
}

export interface ViewCanvas {
    width: number;
    height: number;
    backgroundColor: string;
}

export interface ViewCamera {
    x: number;
    y: number;
    scale: number;
}

export interface ElevationView {
    name: string;
    description: string;
    canvas: ViewCanvas;
    elements: CanvasElement[];
    camera: ViewCamera;
}

export interface Elevation {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    views: {
        external: ElevationView;
        internal: ElevationView;
    };
}

export interface UnitInfo {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export interface Unit {
    unitInfo: UnitInfo;
    overview3D: Overview3D;
    questionnaire: Questionnaire;
    projectNotes: ProjectNote[];
    tasks: Task[];
    spaceSpecifications: string[];
    presets: Presets;
    elevations: Record<string, Elevation>;
}

export interface ProjectMetadata {
    version: string;
    lastModified: string;
    createdBy: string;
    fileFormat: string;
    description: string;
}

export interface ProjectConfig {
    projectInfo: ProjectInfo;
    canvas: CanvasConfig;
    units: Record<string, Unit>;
    metadata: ProjectMetadata;
}

// Navigation and context types
export type ViewType = 'external' | 'internal';

export interface AppContextType {
    // Data
    projectConfig: ProjectConfig | null;
    loading: boolean;
    error: string | null;

    // Navigation state
    activeUnitId: string | null;
    activeElevationId: string | null;
    activeView: ViewType;

    // Actions
    loadProject: (config?: ProjectConfig) => Promise<void>;
    setActiveUnit: (unitId: string) => void;
    setActiveElevation: (elevationId: string) => void;
    setActiveView: (view: ViewType) => void;
    updateProjectConfig: (updates: Partial<ProjectConfig>) => void;

    // Computed getters
    getCurrentUnit: () => Unit | null;
    getCurrentElevation: () => Elevation | null;
    getCurrentView: () => ElevationView | null;
    getUnitList: () => UnitInfo[];
    getElevationList: (unitId?: string) => Elevation[];
}

// Helper types for component props
export interface RightSidebarContextData {
    overview3D: Overview3D | null;
    questionnaire: Questionnaire | null;
    projectNotes: ProjectNote[];
    tasks: Task[];
    spaceSpecifications: string[];
}

export interface BottomTabsContextData {
    elevations: Elevation[];
    activeElevationId: string | null;
    onElevationChange: (elevationId: string) => void;
}

export interface ToolbarContextData {
    presets: Presets | null;
    canvasConfig: CanvasConfig;
}