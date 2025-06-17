import React from 'react';
import {
    VStack,
    IconButton,
    Tooltip,
    Divider,
    Box,
    useColorModeValue,
} from '@chakra-ui/react';

import { TbCubeSpark } from "react-icons/tb";
import { GoInfo } from "react-icons/go";
import { BsPatchQuestion } from "react-icons/bs";
import { useRightSidebar } from '~/hooks/use-right-sidebar';
import { RightSidebarTab } from '~/store/slices/right-sidebar-slice';

const RightSidebar = () => {
    const { activeTab, toggleTab } = useRightSidebar();

    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverColor = useColorModeValue('gray.200', 'gray.600');

    const tabs = [
        {
            id: '3d-overview' as RightSidebarTab,
            icon: TbCubeSpark,
            label: '3D Overview',
            description: 'View 3D design references and inspirations',
        },
        {
            id: 'questionnaire' as RightSidebarTab,
            icon: BsPatchQuestion,
            label: 'Questionnaire',
            description: 'Interactive Q&A for design requirements',
        },
        {
            id: 'project-info' as RightSidebarTab,
            icon: GoInfo,
            label: 'Project Info',
            description: 'Project details and specifications',
        },
    ];

    const handleTabClick = (tabId: RightSidebarTab) => {
        toggleTab(tabId);
    };

    return (
        <Box
            position="fixed"
            top="50%"
            right="4"
            transform="translateY(-50%)"
            zIndex="15"
        >
            <VStack
                spacing={2}
                p={2}
                bg={bgColor}
                borderRadius="xl"
                border="2px solid"
                borderColor={borderColor}
                boxShadow="lg"
                minW="60px"
            >
                {tabs.map((tab, index) => (
                    <React.Fragment key={tab.id}>
                        <Tooltip
                            hasArrow
                            label={tab.label}
                            placement="left"
                            openDelay={500}
                        >
                            <IconButton
                                aria-label={tab.label}
                                icon={<tab.icon size={24} />}
                                size="lg"
                                variant={activeTab === tab.id ? 'outline' : 'outine'}
                                colorScheme={activeTab === tab.id ? 'pink' : 'gray'}
                                borderRadius="lg"
                                _hover={{
                                    bg: activeTab === tab.id ? 'pink.500' : hoverColor,
                                    transform: 'scale(1.05)',
                                }}
                                _active={{
                                    transform: 'scale(0.95)',
                                }}
                                transition="all 0.2s ease"
                                onClick={() => handleTabClick(tab.id)}
                            />
                        </Tooltip>

                        {/* Divider between tabs (not after last tab) */}
                        {index < tabs.length - 1 && (
                            <Divider orientation="horizontal" w="70%" borderColor="gray.400" />
                        )}
                    </React.Fragment>
                ))}
            </VStack>
        </Box>
    );
};

export default RightSidebar;