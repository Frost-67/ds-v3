import {
  VStack,
  Text,
  Box,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { HiCheckCircle, HiClock } from 'react-icons/hi';
import { IoWarningOutline } from "react-icons/io5";
import { useCurrentUnit } from '~/context/AppContext';

const QuestionnaireTab = () => {
  const currentUnit = useCurrentUnit();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const answerColor = useColorModeValue('pink.600', 'pink.300');

  if (!currentUnit?.questionnaire) {
    return (
      <VStack spacing="4" align="stretch" h="100%" overflowY="auto" pr="2">
        <Text>No questionnaire data available</Text>
      </VStack>
    );
  }

  const { questionnaire } = currentUnit;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: HiCheckCircle, color: 'green.500' };
      case 'in-progress':
        return { icon: HiClock, color: 'yellow.500' };
      case 'pending':
        return { icon: IoWarningOutline, color: 'orange.500' };
      default:
        return { icon: IoWarningOutline, color: 'gray.500' };
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in-progress':
        return 'yellow';
      case 'pending':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const statusConfig = getStatusIcon(questionnaire.status);

  return (
    <VStack spacing="4" align="stretch" h="100%" overflowY="auto" pr="2">
      {/* Header */}
      <Box flexShrink={0}>
        <HStack mb="2">
          <Icon as={statusConfig.icon} color={statusConfig.color} boxSize={5} />
          <Text fontSize="lg" fontWeight="semibold" color="pink.500">
            {questionnaire.title}
          </Text>
          <Badge colorScheme={getStatusBadgeColor(questionnaire.status)} variant="subtle">
            {questionnaire.status.charAt(0).toUpperCase() + questionnaire.status.slice(1)}
          </Badge>
        </HStack>
        <Text fontSize="sm" color="gray.600">
          {questionnaire.description}
        </Text>
      </Box>

      {/* Questions and Answers */}
      <VStack spacing="3" align="stretch">
        {questionnaire.questions.map((item, index) => (
          <Box
            key={item.id}
            bg={bgColor}
            p="4"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="sm" fontWeight="semibold" mb="2" color="gray.700">
              {index + 1}. {item.question}
            </Text>
            <Text fontSize="sm" color={answerColor} fontWeight="medium">
              ✓ {item.answer}
            </Text>
            {item.category && (
              <Badge mt="2" size="sm" colorScheme="blue" variant="outline">
                {item.category}
              </Badge>
            )}
          </Box>
        ))}
      </VStack>
    </VStack>
  );
};

export default QuestionnaireTab;