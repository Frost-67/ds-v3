import {
    VStack,
    Text,
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    Badge,
    Divider,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    List,
    ListItem,
    HStack,
    Avatar,
    Button,
    Textarea,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Icon,
    Progress,
} from '@chakra-ui/react';
import {
    HiCheckCircle,
    HiClock,
    HiExclamationCircle,
    HiUsers,
    HiDocumentText,
    HiPlus,
} from 'react-icons/hi';
import { useProjectInfo, useCurrentUnit } from '~/context/AppContext';

const ProjectInfoTab = () => {
    const projectInfo = useProjectInfo();
    const currentUnit = useCurrentUnit();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    if (!projectInfo || !currentUnit) {
        return (
            <VStack spacing="4" align="stretch" h="100%" overflowY="auto" pr="2">
                <Text>No project information available</Text>
            </VStack>
        );
    }

    const { projectNotes, tasks, spaceSpecifications } = currentUnit;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return { icon: HiCheckCircle, color: 'green' };
            case 'in-progress': return { icon: HiClock, color: 'yellow' };
            default: return { icon: HiExclamationCircle, color: 'gray' };
        }
    };

    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    const budgetPercentage = projectInfo.budget.percentage || 0;

    const handleSaveNote = (noteText: string) => {
        if (noteText.trim()) {
            // TODO: In a real scenario, if needed in the future, this would update the API call to the backend.
            toast({
                title: "Note added successfully",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        }
        onClose();
    };

    return (
        <VStack spacing="4" align="stretch" h="100%" overflowY="auto" pr="2">
            {/* Header */}
            <Box>
                <HStack justify="space-between" mb="2">
                    <Text fontSize="lg" fontWeight="semibold" color="pink.500">
                        Project Overview
                    </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                    {projectInfo.name} - {currentUnit.unitInfo.name}
                </Text>
            </Box>

            {/* Quick Stats */}
            <SimpleGrid columns={2} spacing="3">
                <Stat size="sm" bg="gray.50" p="3" borderRadius="md">
                    <StatLabel fontSize="xs">Progress</StatLabel>
                    <StatNumber fontSize="lg">{Math.round(progressPercentage)}%</StatNumber>
                    <Progress value={progressPercentage} size="sm" colorScheme="pink" mt="1" />
                </Stat>
                <Stat size="sm" bg="gray.50" p="3" borderRadius="md">
                    <StatLabel fontSize="xs">Budget Used</StatLabel>
                    <StatNumber fontSize="lg">{budgetPercentage.toFixed(1)}%</StatNumber>
                    <Progress value={budgetPercentage} size="sm" colorScheme="green" mt="1" />
                </Stat>
            </SimpleGrid>

            <Divider />

            {/* Expandable Sections */}
            <Accordion allowMultiple size="sm" defaultIndex={[0]} gap={12}>
                {/* Project Notes */}
                <AccordionItem>
                    <AccordionButton>
                        <Box flex="1" textAlign="left">
                            <HStack>
                                <HiDocumentText />
                                <Text fontWeight="semibold">Project Notes</Text>
                                <Badge colorScheme="purple" variant="subtle" size="sm">
                                    {projectNotes.length}
                                </Badge>
                            </HStack>
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <VStack spacing="3" align="stretch">
                            <Button size="sm" leftIcon={<HiPlus />} onClick={onOpen} colorScheme="pink" variant="outline">
                                Add Note
                            </Button>
                            {projectNotes.map((note) => (
                                <Box key={note.id} p="3" bg="gray.50" borderRadius="md" borderLeft="3px solid" borderLeftColor="pink.400">
                                    <Text fontSize="sm" mb="1">{note.text}</Text>
                                    <HStack justify="space-between">
                                        <HStack>
                                            <Avatar size="xs" name={note.author} />
                                            <Text fontSize="xs" color="gray.600">{note.author}</Text>
                                        </HStack>
                                        <Text fontSize="xs" color="gray.500">{note.date}</Text>
                                    </HStack>
                                    {note.category && (
                                        <Badge mt="1" size="xs" colorScheme="blue" variant="outline">
                                            {note.category}
                                        </Badge>
                                    )}
                                </Box>
                            ))}
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>

                {/* Tasks */}
                <AccordionItem>
                    <AccordionButton>
                        <Box flex="1" textAlign="left">
                            <HStack>
                                <HiCheckCircle />
                                <Text fontWeight="semibold">Tasks</Text>
                                <Badge colorScheme="green" variant="subtle" size="sm">
                                    {completedTasks}/{tasks.length}
                                </Badge>
                            </HStack>
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <VStack spacing="2" align="stretch">
                            {tasks.map((task) => {
                                const statusConfig = getStatusIcon(task.status);
                                return (
                                    <Box key={task.id} p="2" bg="gray.50" borderRadius="md">
                                        <HStack justify="space-between" align="start">
                                            <HStack align="start" flex="1">
                                                <Icon 
                                                    as={statusConfig.icon} 
                                                    color={`${statusConfig.color}.500`} 
                                                    mt="1" 
                                                    boxSize={4} 
                                                />
                                                <Box flex="1">
                                                    <Text fontSize="sm" fontWeight="medium">{task.name}</Text>
                                                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                                        {task.description}
                                                    </Text>
                                                    <HStack mt="1" spacing="2">
                                                        <Badge size="xs" colorScheme="blue" variant="outline">
                                                            {task.assignee}
                                                        </Badge>
                                                        <Text fontSize="xs" color="gray.500">{task.date}</Text>
                                                    </HStack>
                                                </Box>
                                            </HStack>
                                        </HStack>
                                    </Box>
                                );
                            })}
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>

                {/* Space Specifications */}
                <AccordionItem>
                    <AccordionButton>
                        <Box flex="1" textAlign="left">
                            <HStack>
                                <HiUsers />
                                <Text fontWeight="semibold">Space Details</Text>
                            </HStack>
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <VStack spacing="3" align="stretch">
                            <Box>
                                <Text fontSize="sm" fontWeight="medium" mb="2">Space Specifications:</Text>
                                <List spacing="1">
                                    {spaceSpecifications.map((spec, index) => (
                                        <ListItem key={index} fontSize="sm" pl="2">
                                            • {spec}
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>

                            <Divider />

                            <SimpleGrid columns={1} spacing="2">
                                <Box>
                                    <Text fontSize="xs" color="gray.500">Client</Text>
                                    <Text fontSize="sm">{projectInfo.client.name}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500">Location</Text>
                                    <Text fontSize="sm">{projectInfo.location}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500">Project Status</Text>
                                    <Text fontSize="sm">{projectInfo.status}</Text>
                                </Box>
                            </SimpleGrid>
                        </VStack>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

            {/* Add Note Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Project Note</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Note</FormLabel>
                            <Textarea
                                placeholder="Enter your note here..."
                                id="note-input"
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="pink"
                            onClick={() => {
                                const input = document.getElementById('note-input') as HTMLTextAreaElement;
                                handleSaveNote(input.value);
                                input.value = '';
                            }}
                        >
                            Add Note
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
};

export default ProjectInfoTab;