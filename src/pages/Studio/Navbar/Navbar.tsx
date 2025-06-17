import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  Spacer,
  HStack,
  Text,
  MenuItem,
  Avatar,
  IconButton,
  Tooltip,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { HiOutlineArrowsExpand } from 'react-icons/hi';
import { useProjectInfo } from '~/context/AppContext';
import { NAVBAR_CONFIG } from '~/consts/ui';
import logo from '../../../assets/brand-logo/logo.png';

function Navbar() {
  const { onToggle: toggleFullscreen } = useDisclosure();
  const projectInfo = useProjectInfo();

  const handleExport = (type: 'json' | 'png' | 'pdf') => {
    console.log(`Exporting as ${type}`);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    toggleFullscreen();
  };

  return (
    <Flex bgGradient={NAVBAR_CONFIG.gradient} align="center" id="navbar">
      <Box>
        <Heading
          fontSize="28px"
          fontWeight="400"
          userSelect="none"
          color="white"
          ml="20px"
          mb="0"
          fontFamily="inherit"
        >
          <Flex align="center" justify="center" p={4} color="white" gap={4}>
            <img
              src={logo}
              alt={`${NAVBAR_CONFIG.title} Logo`}
              style={{ width: '30px' }}
            />
            <Text as="span" fontSize="lg" fontWeight="semibold">
              {NAVBAR_CONFIG.title}
            </Text>

            {/* Project Info Display */}
            {NAVBAR_CONFIG.showProjectId && projectInfo && (
              <Box
                p={3}
                borderRadius="md"
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.2)"
                backdropFilter="blur(10px)"
                boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
              >
                <Flex align="center" fontSize="sm">
                  <VStack align="start" spacing={0}>
                    <Text color="white" fontWeight="semibold" fontSize="xs">
                      {projectInfo.name} - {projectInfo.id}
                    </Text>
                  </VStack>
                </Flex>
              </Box>
            )}
          </Flex>
        </Heading>
      </Box>
      <Spacer />
      <HStack sx={{ pr: 4 }} spacing={4}>
        {/* Fullscreen Toggle */}
        <Tooltip label="Toggle Fullscreen" placement="bottom">
          <IconButton
            aria-label="Toggle fullscreen"
            icon={<HiOutlineArrowsExpand />}
            variant="ghost"
            color="white"
            size="lg"
            _hover={{
              bg: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.05)',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            onClick={handleFullscreen}
          />
        </Tooltip>

        {/* User Avatar */}
        {NAVBAR_CONFIG.showUserAvatar && (
          <Avatar
            name={projectInfo?.client.name || "User"}
            bg="#fff"
            src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            title={projectInfo?.client.name || "User"}
          />
        )}

        {/* Export Menu */}
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Export
          </MenuButton>
          <MenuList>
            {NAVBAR_CONFIG.exportOptions.map((option) => (
              <MenuItem key={option.action} onClick={() => handleExport(option.action as any)}>
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}

export default Navbar;