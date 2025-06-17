//@ts-nocheck
import { useRef, useEffect, useCallback, useState } from 'react';
import {
    Box,
    Flex,
    Button,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Icon,
    useDisclosure,
    IconButton,
    Collapse,
    HStack,
    Input,
    useOutsideClick,
} from '@chakra-ui/react';
import {
    HiPlus,
    HiChevronDown,
    HiChevronUp,
    HiChevronLeft,
    HiChevronRight,
    HiX,
    HiDuplicate,
} from 'react-icons/hi';
import { useAppContext, useCurrentUnit } from '~/context/AppContext';
import { BOTTOM_TABS_CONFIG } from '~/consts/ui';

const BottomTabs = () => {
    // Context data
    const {
        activeUnitId,
        activeElevationId,
        activeView,
        setActiveElevation,
        getCurrentUnit,
        getElevationList
    } = useAppContext();
    
    const currentUnit = getCurrentUnit();
    const elevations = getElevationList();

    // Local state for UI
    const [isExpanded, setIsExpanded] = useState(BOTTOM_TABS_CONFIG.defaultExpanded);
    const [editingTabId, setEditingTabId] = useState<string | null>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [maxVisibleTabs] = useState(BOTTOM_TABS_CONFIG.maxVisibleTabs);

    const { isOpen: isAddMenuOpen, onOpen: openAddMenu, onClose: closeAddMenu } = useDisclosure();
    const editInputRef = useRef<HTMLInputElement>(null);
    const editingContainerRef = useRef<HTMLDivElement>(null);

    // Auto-focus input when editing starts
    useEffect(() => {
        if (editingTabId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingTabId]);

    // Click outside to stop editing
    useOutsideClick({
        ref: editingContainerRef as React.RefObject<HTMLElement>,
        handler: () => {
            if (editingTabId) {
                setEditingTabId(null);
            }
        },
    });

    // Handle tab click with canvas context switching
    const handleTabClick = useCallback((elevationId: string) => {
        if (editingTabId) {
            setEditingTabId(null);
        }
        
        // Update the active elevation in app context
        setActiveElevation(elevationId);
        
        // This will trigger canvas loading via the Frame component's useEffect
    }, [setActiveElevation, editingTabId]);

    const handleTabDoubleClick = useCallback((elevationId: string) => {
        if (editingTabId !== elevationId) {
            setEditingTabId(elevationId);
        }
    }, [editingTabId]);

    const handleAddTab = useCallback((type: 'elevation' | 'page') => {
        console.log('Adding new tab of type:', type);
        closeAddMenu();
    }, [closeAddMenu]);

    const handleRemoveTab = useCallback((elevationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        console.log('Removing tab:', elevationId);
    }, []);

    const handleDuplicateTab = useCallback((elevationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        console.log('Duplicating tab:', elevationId);
    }, []);

    const handleNameChange = useCallback((elevationId: string, newName: string) => {
        console.log('Renaming tab:', elevationId, 'to:', newName);
    }, []);

    const handleNameKeyPress = useCallback((event: React.KeyboardEvent, elevationId: string) => {
        if (event.key === 'Enter') {
            setEditingTabId(null);
        } else if (event.key === 'Escape') {
            setEditingTabId(null);
        }
    }, []);

    // Scrolling logic
    const visibleElevations = elevations.slice(scrollPosition, scrollPosition + maxVisibleTabs);
    const canScrollLeft = scrollPosition > 0;
    const canScrollRight = scrollPosition + maxVisibleTabs < elevations.length;
    const totalPages = Math.ceil(elevations.length / maxVisibleTabs);
    const currentPage = Math.floor(scrollPosition / maxVisibleTabs);

    const handleScrollTabs = useCallback((direction: 'left' | 'right') => {
        if (direction === 'left' && canScrollLeft) {
            setScrollPosition(prev => Math.max(0, prev - 1));
        } else if (direction === 'right' && canScrollRight) {
            setScrollPosition(prev => Math.min(elevations.length - maxVisibleTabs, prev + 1));
        }
    }, [canScrollLeft, canScrollRight, elevations.length, maxVisibleTabs]);

    const jumpToTabPage = useCallback((pageIndex: number) => {
        setScrollPosition(pageIndex * maxVisibleTabs);
    }, [maxVisibleTabs]);

    const getTabIcon = useCallback((type: string) => {
        switch (type) {
            case 'elevation':
                return '📐';
            case 'page':
                return '📄';
            default:
                return '📐';
        }
    }, []);

    const renderTab = useCallback((elevation: any) => {
        const isEditing = editingTabId === elevation.id;
        const isActive = activeElevationId === elevation.id;

        return (
            <Box key={elevation.id} position="relative" ref={isEditing ? editingContainerRef : undefined}>
                <Button
                    onClick={() => handleTabClick(elevation.id)}
                    onDoubleClick={() => handleTabDoubleClick(elevation.id)}
                    variant="outline"
                    size="md"
                    minW="140px"
                    h="50px"
                    border="2px"
                    borderColor={isActive ? 'pink.500' : 'gray.200'}
                    bgColor={isActive ? 'pink.50' : 'white'}
                    _hover={{
                        borderColor: isActive ? 'pink.500' : 'gray.300',
                        bgColor: isActive ? 'pink.50' : 'gray.50',
                    }}
                    position="relative"
                    overflow="hidden"
                >
                    <Flex align="center" gap={2} width="full" justify="space-between">
                        <Flex align="center" gap={2} flex="1" minW="0">
                            <Text fontSize="sm" flexShrink={0}>
                                {getTabIcon(elevation.type)}
                            </Text>

                            {isEditing ? (
                                <Input
                                    ref={editInputRef}
                                    defaultValue={elevation.name}
                                    onChange={(e) => handleNameChange(elevation.id, e.target.value)}
                                    onKeyDown={(e) => handleNameKeyPress(e, elevation.id)}
                                    size="sm"
                                    variant="unstyled"
                                    fontWeight="medium"
                                    color={isActive ? 'pink.700' : 'gray.600'}
                                    bg="transparent"
                                    border="1px solid"
                                    borderColor="pink.300"
                                    borderRadius="md"
                                    p={1}
                                    px={1}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <Text
                                    fontSize="sm"
                                    fontWeight="medium"
                                    color={isActive ? 'pink.700' : 'gray.600'}
                                    noOfLines={1}
                                    flex="1"
                                    textAlign="left"
                                >
                                    {elevation.name}
                                </Text>
                            )}
                        </Flex>

                        {/* Tab Actions */}
                        {isActive && elevations.length > 1 && !isEditing && (
                            <HStack
                                spacing={1}
                                opacity={0}
                                _groupHover={{ opacity: 1 }}
                                transition="opacity 0.2s"
                            >
                                <Box
                                    bg="gray.100"
                                    borderRadius="full"
                                    px="1.5"
                                    py="1"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <IconButton
                                        aria-label="Duplicate tab"
                                        icon={<Icon as={HiDuplicate} boxSize={3.5} />}
                                        size="xs"
                                        variant="ghost"
                                        onClick={(e) => handleDuplicateTab(elevation.id, e)}
                                        _hover={{ bg: 'gray.100' }}
                                        title='Duplicate Tab'
                                    />
                                </Box>
                                <Box
                                    bg="red.100"
                                    borderRadius="full"
                                    px="1.5"
                                    py="1"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <IconButton
                                        aria-label="Delete tab"
                                        icon={<Icon as={HiX} boxSize={3.5} />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={(e) => handleRemoveTab(elevation.id, e)}
                                        _hover={{ bg: 'red.100' }}
                                        title='Delete Tab'
                                    />
                                </Box>
                            </HStack>
                        )}
                    </Flex>
                </Button>
            </Box>
        );
    }, [
        editingTabId,
        activeElevationId,
        handleTabClick,
        handleTabDoubleClick,
        handleNameChange,
        handleNameKeyPress,
        handleDuplicateTab,
        handleRemoveTab,
        getTabIcon,
        elevations.length
    ]);

    if (!currentUnit) {
        return null;
    }

    return (
        <Box
            id="bottom_tabs"
            bgColor="white"
            borderTop="1px"
            borderColor="gray.200"
            boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
            transition="all 0.3s ease"
        >
            <Flex
                align="center"
                justify="space-between"
                px={6}
                py={2}
                borderBottom={isExpanded ? "1px" : "none"}
                borderColor="gray.200"
                cursor="pointer"
                _hover={{ bgColor: 'gray.50' }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <HStack spacing={2}>
                    <Icon as={isExpanded ? HiChevronDown : HiChevronUp} boxSize={4} />
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        {currentUnit.unitInfo.name} Elevations ({elevations.length})
                    </Text>
                    {activeElevationId && (
                        <Text fontSize="xs" color="pink.500" fontWeight="medium">
                            • {elevations.find(e => e.id === activeElevationId)?.name} ({activeView})
                        </Text>
                    )}
                </HStack>
            </Flex>

            {/* Collapsible Content */}
            <Collapse in={isExpanded} animateOpacity>
                <Flex align="center" px={6} py={3}>
                    {/* Left Scroll Button */}
                    {canScrollLeft && (
                        <IconButton
                            aria-label="Scroll left"
                            icon={<Icon as={HiChevronLeft} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleScrollTabs('left')}
                            mr={2}
                        />
                    )}

                    {/* Tabs Container */}
                    <Flex
                        align="center"
                        gap={2}
                        flex="1"
                        justify="center"
                        overflowX="hidden"
                        role="group"
                    >
                        {/* Visible Tabs */}
                        {visibleElevations.map(renderTab)}

                        {/* Add New Tab Menu */}
                        <Menu isOpen={isAddMenuOpen} onClose={closeAddMenu}>
                            <MenuButton
                                as={Button}
                                onClick={openAddMenu}
                                variant="outline"
                                size="md"
                                w="60px"
                                h="50px"
                                border="2px dashed"
                                borderColor="gray.300"
                                _hover={{ borderColor: 'gray.400', bgColor: 'gray.50' }}
                            >
                                <Icon as={HiPlus} boxSize={5} color="gray.400" />
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={() => handleAddTab('elevation')}>
                                    <Flex align="center" gap={2}>
                                        <Text>📐</Text>
                                        <Text>Add Elevation</Text>
                                    </Flex>
                                </MenuItem>
                                <MenuItem onClick={() => handleAddTab('page')}>
                                    <Flex align="center" gap={2}>
                                        <Text>📄</Text>
                                        <Text>Add Page</Text>
                                    </Flex>
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>

                    {/* Right Scroll Button */}
                    {canScrollRight && (
                        <IconButton
                            aria-label="Scroll right"
                            icon={<Icon as={HiChevronRight} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleScrollTabs('right')}
                            ml={2}
                        />
                    )}
                </Flex>

                {/* Tab Indicators */}
                {elevations.length > maxVisibleTabs && (
                    <Flex justify="center" pb={2}>
                        <HStack spacing={1}>
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <Box
                                    key={index}
                                    w="6px"
                                    h="6px"
                                    borderRadius="full"
                                    bg={currentPage === index ? 'pink.500' : 'gray.300'}
                                    cursor="pointer"
                                    onClick={() => jumpToTabPage(index)}
                                    _hover={{
                                        bg: currentPage === index ? 'pink.600' : 'gray.400'
                                    }}
                                />
                            ))}
                        </HStack>
                    </Flex>
                )}

                {/* Quick Help Text */}
                {elevations.length > 0 && (
                    <Flex justify="center" pb={2}>
                        <Text fontSize="xs" color="gray.400">
                            {BOTTOM_TABS_CONFIG.helpText}
                        </Text>
                    </Flex>
                )}
            </Collapse>
        </Box>
    );
};

export default BottomTabs;