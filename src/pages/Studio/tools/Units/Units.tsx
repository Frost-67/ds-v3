import { useState } from 'react';
import {
    VStack,
    Button,
    Text,
    Icon,
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    InputGroup,
    InputLeftElement,
    Input,
} from '@chakra-ui/react';
import {
    HiOutlineHome,
    HiOutlineSearch,
    HiChevronRight,
    HiOutlineArrowLeft
} from 'react-icons/hi';
import { useAppContext, useCurrentUnit } from '~/context/AppContext';
import { useCanvasContexts } from '~/hooks/use-canvas-contexts';
import { DEFAULT_SHAPE_OBJECT } from '~/consts/stage-object';
import { PresetCategory, PresetItem } from '~/types/project-config.types';

type ViewType = 'units' | 'unit-items' | 'item-details';

const Units = () => {
    const { getUnitList, activeUnitId, setActiveUnit } = useAppContext();
    const currentUnit = useCurrentUnit();
    const { createObject } = useCanvasContexts();

    const [currentView, setCurrentView] = useState<ViewType>('units');
    const [selectedCategory, setSelectedCategory] = useState<PresetCategory | null>(null);
    const [, setSelectedItem] = useState<PresetItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const units = getUnitList();

    const handleUnitSelect = (unitId: string) => {
        setActiveUnit(unitId);
        setCurrentView('unit-items');
        setSearchQuery('');
    };

    const handleCategorySelect = (category: PresetCategory) => {
        setSelectedCategory(category);
        setCurrentView('item-details');
    };

    const handleBackToUnits = () => {
        setCurrentView('units');
        setSelectedCategory(null);
        setSearchQuery('');
    };

    const handleBackToItems = () => {
        setCurrentView('unit-items');
        setSelectedItem(null);
    };

    const handleAddPresetToCanvas = (item: PresetItem) => {
        // Convert preset item to canvas object
        item.elements.forEach(element => {
            createObject({
                ...DEFAULT_SHAPE_OBJECT,
                ...element,
                type: element.type as any,
                x: 100 + Math.random() * 100, // Add some randomness to position
                y: 100 + Math.random() * 100,
            });
        });
    };

    const renderBreadcrumbs = () => (
        <Breadcrumb
            spacing="4px"
            separator={<Icon as={HiChevronRight} color="gray.400" boxSize={3} />}
            fontSize="sm"
            mb={4}
        >
            <BreadcrumbItem>
                <BreadcrumbLink onClick={handleBackToUnits} color="pink.500" fontSize="sm">
                    <Icon as={HiOutlineHome} mr={1} boxSize={4} />
                    Units
                </BreadcrumbLink>
            </BreadcrumbItem>

            {activeUnitId && currentUnit && (
                <BreadcrumbItem>
                    <BreadcrumbLink
                        onClick={currentView === 'item-details' ? handleBackToItems : undefined}
                        color={currentView === 'item-details' ? "pink.500" : "gray.600"}
                        fontSize="sm"
                    >
                        {currentUnit.unitInfo.name}
                    </BreadcrumbLink>
                </BreadcrumbItem>
            )}

            {selectedCategory && currentView === 'item-details' && (
                <BreadcrumbItem isCurrentPage>
                    <Text color="gray.600" fontSize="sm">
                        {selectedCategory.name}
                    </Text>
                </BreadcrumbItem>
            )}
        </Breadcrumb>
    );

    const renderSearch = () => (
        <InputGroup mb={4}>
            <InputLeftElement>
                <Icon as={HiOutlineSearch} color="gray.400" boxSize={4} />
            </InputLeftElement>
            <Input
                placeholder={
                    currentView === 'units' ? "Search units..."
                        : currentView === 'unit-items' ? `Search ${currentUnit?.unitInfo.name.toLowerCase()} presets...`
                            : "Search..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="sm"
            />
        </InputGroup>
    );

    // Units list view
    if (currentView === 'units') {
        const filteredUnits = units.filter(unit =>
            unit.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <VStack spacing={4} align="stretch">
                {renderSearch()}

                {filteredUnits.map((unit) => (
                    <Button
                        key={unit.id}
                        variant="ghost"
                        justifyContent="flex-start"
                        h="60px"
                        onClick={() => handleUnitSelect(unit.id)}
                        _hover={{ bg: 'gray.100' }}
                        leftIcon={<Text fontSize="2xl">{unit.icon}</Text>}
                    >
                        <Box textAlign="left">
                            <Text fontWeight="medium">{unit.name}</Text>
                            <Text fontSize="xs" color="gray.500">
                                {unit.description}
                            </Text>
                        </Box>
                    </Button>
                ))}
            </VStack>
        );
    }

    // Unit preset categories view
    if (currentView === 'unit-items' && currentUnit) {
        const categories = currentUnit.presets.categories;
        const filteredCategories = categories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <VStack spacing={4} align="stretch">
                {renderBreadcrumbs()}
                {renderSearch()}

                <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    size="sm"
                    onClick={handleBackToUnits}
                    leftIcon={<Icon as={HiOutlineArrowLeft} />}
                    color="pink.500"
                    alignSelf="flex-start"
                >
                    Back to Units
                </Button>

                {filteredCategories.map((category) => (
                    <Button
                        key={category.id}
                        variant="ghost"
                        justifyContent="flex-start"
                        h="60px"
                        _hover={{ bg: 'gray.100' }}
                        leftIcon={<Text fontSize="xl">{category.icon}</Text>}
                        onClick={() => handleCategorySelect(category)}
                    >
                        <Box textAlign="left">
                            <Text fontWeight="medium">{category.name}</Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {category.description}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                                {category.items.length} items
                            </Text>
                        </Box>
                    </Button>
                ))}
            </VStack>
        );
    }

    // Category items view
    if (currentView === 'item-details' && selectedCategory && currentUnit) {
        const filteredItems = selectedCategory.items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <VStack spacing={4} align="stretch">
                {renderBreadcrumbs()}
                {renderSearch()}

                <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    size="sm"
                    onClick={handleBackToItems}
                    leftIcon={<Icon as={HiOutlineArrowLeft} />}
                    color="pink.500"
                    alignSelf="flex-start"
                >
                    Back to {currentUnit.unitInfo.name}
                </Button>

                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <Box key={item.id} p={4} borderRadius="md" border="1px" borderColor="gray.200">
                            <VStack spacing={3} align="stretch">
                                <Text fontWeight="medium">{item.name}</Text>
                                <Text fontSize="sm" color="gray.600">
                                    {item.canvas.width}w × {item.canvas.height}h
                                </Text>
                                <Button
                                    size="sm"
                                    colorScheme="pink"
                                    onClick={() => handleAddPresetToCanvas(item)}
                                >
                                    Add to Canvas
                                </Button>
                            </VStack>
                        </Box>
                    ))
                ) : (
                    <Box p={4} borderRadius="md" border="1px" borderColor="gray.200">
                        <VStack spacing={3} align="center">
                            <Text fontSize="sm" color="gray.500">
                                No presets available in this category
                            </Text>
                        </VStack>
                    </Box>
                )}
            </VStack>
        );
    }

    return null;
};

export default Units;