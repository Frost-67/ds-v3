
import { TbCubeSpark } from "react-icons/tb";
import { GoInfo } from "react-icons/go";
import { BsPatchQuestion } from "react-icons/bs";

// Right Sidebar Configuration
export const RIGHT_SIDEBAR_CONFIG = {
    defaultWidth: 400,
    minWidth: 350,
    maxWidth: 600,
    tabs: [
        {
            id: '3d-overview',
            icon: TbCubeSpark,
            label: '3D Overview',
            description: 'View 3D design references and inspirations',
            enabled: true
        },
        {
            id: 'questionnaire',
            icon: BsPatchQuestion,
            label: 'Questionnaire',
            description: 'Interactive Q&A for design requirements',
            enabled: true
        },
        {
            id: 'project-info',
            icon: GoInfo,
            label: 'Project Info',
            description: 'Project details and specifications',
            enabled: true
        },
    ],
};
export const GRID_AND_SNAP_SETTINGS = {
    showGrid: true,
    gridSize: 20,
    showMajorGrid: true,
    majorGridMultiplier: 5,
    gridColor: '#e2e8f0',
    majorGridColor: '#94a3b8',
    snapToGrid: true,
    snapTolerance: 10,
}
// Bottom Tabs Configuration
export const BOTTOM_TABS_CONFIG = {
    isExpandable: true,
    defaultExpanded: true,
    maxVisibleTabs: 4,
    helpText: "Double-click to rename • Right area shows actions on hover",
    allowedTypes: ["elevation", "page"] as const,
    showTabIcons: true,
    showTabCounter: true,
};

// Editing Toolbar Configuration
export const EDITING_TOOLBAR_CONFIG = {
    height: 50,
    showViewToggle: true,
    showGridToggle: true,
    showZoomControls: true,
    showUndoRedo: true,
};

// Navbar Configuration
export const NAVBAR_CONFIG = {
    title: "Octopus 2D",
    logo: "/src/assets/brand-logo/logo.png",
    gradient: "linear(to-l, #a8e6cf, #056608)",
    showProjectId: true,
    showUserAvatar: true,
    exportOptions: [
        { label: "Export as PDF", action: "pdf" },
    ],
};

// Layout Constants
export const LAYOUT_CONSTANTS = {
    NAVBAR_HEIGHT: 56,
    EDITING_TOOLBAR_HEIGHT: 50,
    FRAME_CONTAINER_PADDING: 20,
    BOTTOM_TABS_HEIGHT: 80,
    LOGO_FONT: '"Reem Kufi Fun", sans-serif',
};