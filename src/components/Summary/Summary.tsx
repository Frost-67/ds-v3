import {
    VStack,
    Text,
    Heading,
    SimpleGrid,
    Box,
    Stat,
    StatLabel,
    StatNumber,
    Divider,
    Badge,
    useColorModeValue,
} from '@chakra-ui/react';

interface SummaryProps {
    title: string;
    description: string;
    stats: Array<{
        label: string;
        value: string;
    }>;
}

const Summary = ({ title, description, stats }: SummaryProps) => {
    const bgColor = useColorModeValue('gray.50', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    return (
        <VStack align="stretch" spacing="4">
            {/* Title */}
            <Heading size="md" color="pink.500">
                {title}
            </Heading>

            {/* Description */}
            <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                {description}
            </Text>

            <Divider />

            {/* Statistics Grid */}
            <Box>
                <Text fontSize="sm" fontWeight="semibold" mb="3" color="gray.700">
                    Design Statistics
                </Text>
                <SimpleGrid columns={2} spacing="3">
                    {stats.map((stat, index) => (
                        <Box
                            key={index}
                            bg={bgColor}
                            p="3"
                            borderRadius="md"
                            border="1px solid"
                            borderColor={borderColor}
                        >
                            <Stat size="sm">
                                <StatLabel fontSize="xs" color="gray.600">
                                    {stat.label}
                                </StatLabel>
                                <StatNumber fontSize="md" fontWeight="semibold">
                                    {stat.value}
                                </StatNumber>
                            </Stat>
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>

            {/* Additional Info */}
            <Box>
                <Text fontSize="sm" fontWeight="semibold" mb="2" color="gray.700">
                    Design Features
                </Text>
                <VStack align="stretch" spacing="2">
                    <Badge colorScheme="green" variant="subtle" p="2" borderRadius="md">
                        🌱 Eco-friendly materials
                    </Badge>
                    <Badge colorScheme="blue" variant="subtle" p="2" borderRadius="md">
                        💡 Smart lighting integration
                    </Badge>
                    <Badge colorScheme="purple" variant="subtle" p="2" borderRadius="md">
                        🎨 Color psychology applied
                    </Badge>
                    <Badge colorScheme="orange" variant="subtle" p="2" borderRadius="md">
                        📐 Optimized space utilization
                    </Badge>
                </VStack>
            </Box>
        </VStack>
    );
};

export default Summary;