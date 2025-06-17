import {
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  IconButton,
  VStack,
  Divider,
  Text,
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { TOOLBAR_TABS } from '~/consts/components';
import ImageUpload from './tools/ImageUpload/ImageUpload';
import Resize from './tools/Resize';
import HotkeysList from './tools/Hotkeys/Hotkeys';
import Units from './tools/Units/Units';
import Shapes from './tools/Shapes/Shapes';

const Toolbar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTab, setSelectedTab] = useState(1);

  const toggleToolbar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTabChange = (index: number) => {
    if (index === 0) {
      toggleToolbar();
      return;
    }

    setSelectedTab(index);

    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  // Collapsed state
  if (!isExpanded) {
    return (
      <VStack
        spacing={2}
        p={2}
        bgColor="gray.100"
        borderRight="2px"
        borderColor="gray.200"
        minW="60px"
        h="100%"
        id="toolbar"
      >
        <IconButton
          aria-label="Expand toolbar"
          icon={<Icon as={GoSidebarExpand} />}
          size="lg"
          variant="ghost"
          onClick={toggleToolbar}
        />
        <Divider orientation="horizontal" w="100%" borderColor="gray.500" />

        {TOOLBAR_TABS.map((tab, index) => (
          <IconButton
            key={index}
            aria-label={tab.title}
            icon={
              typeof tab.icon === 'string' ? (
                <Text fontSize="lg">{tab.icon}</Text>
              ) : (
                <Icon as={tab.icon} boxSize={5} />
              )
            }
            size="md"
            variant="ghost"
            onClick={() => {
              setSelectedTab(index + 1);
              setIsExpanded(true);
            }}
            borderRadius="lg"
            _hover={{ bg: 'gray.200' }}
          />
        ))}
      </VStack>
    );
  }

  // Expanded state
  return (
    <Flex h="100%" borderRight="2px" borderColor="gray.200">
      <Tabs
        isLazy
        lazyBehavior="keepMounted"
        orientation="vertical"
        variant="line"
        colorScheme="pink"
        h="100%"
        id="toolbar"
        bgColor="gray.100"
        index={selectedTab}
        onChange={handleTabChange}
      >
        <TabList overflowY="auto">
          {/* Collapse Tab */}
          <Tab
            px="4"
            py="4"
            bgColor="gray.100"
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            fontSize="12px"
            fontWeight="600"
            _hover={{ color: 'pink.500', bgColor: 'gray.200' }}
          >
            <Icon as={GoSidebarCollapse} boxSize={6} />
            Collapse
          </Tab>

          {TOOLBAR_TABS.map((tab, index) => (
            <Tab
              px="4"
              py="4"
              key={index}
              bgColor="gray.100"
              display="flex"
              flexDir="column"
              alignItems="center"
              justifyContent="center"
              fontSize="12px"
              fontWeight="600"
              textAlign="center"
              whiteSpace="normal"
              _selected={{ bgColor: 'white', color: 'pink.500' }}
              _hover={{ color: 'pink.500' }}
            >
              <Icon as={tab.icon} boxSize={6} mb={1} />
              <Box maxW="60px">{tab.title}</Box>
            </Tab>
          ))}
        </TabList>

        <TabPanels minW="350px" maxW="350px" bgColor="white" overflowY="auto">
          <TabPanel></TabPanel>

          {/* Tab 1: Resize */}
          <TabPanel>
            <Resize />
          </TabPanel>

          {/* Tab 2: Presets (Units) */}
          <TabPanel>
            <Units />
          </TabPanel>

          {/* Tab 3: Upload */}
          <TabPanel>
            <ImageUpload />
          </TabPanel>


          {/* Tab 5: Hotkeys */}
          <TabPanel>
            <HotkeysList />
          </TabPanel>
          <TabPanel>
            <Shapes />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default Toolbar;