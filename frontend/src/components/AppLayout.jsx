// src/components/AppLayout.jsx
import React from 'react';
import {
  Box, Flex, Heading, Button, Spacer, Text, useBreakpointValue,
  Image, Tooltip,
} from '@chakra-ui/react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MobileNav from './MobileNav';

const logoPath = '/tour-logo.svg';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Box>
      <Flex
        as="nav" align="center" justify="space-between" wrap="wrap"
        py={0} px={4} bg="brand.900" color="white" position="relative"
      >
        <Flex as={RouterLink} to="/dashboard" align="center" _hover={{ textDecoration: 'none' }}>
          <Image boxSize="100px" src={logoPath} alt="App Logo" mr={2} />
          <Heading fontSize={"md"} fontWeight={"normal"} size="sm" letterSpacing="normal">
            Trip Planner
          </Heading>
        </Flex>

        <Spacer />

        {isDesktop ? (
          <Box display="flex" alignItems="center">
            {user && (
              <Tooltip label={user.username} placement="bottom" hasArrow>
                <Text as="span" mr={4} maxW="150px" isTruncated>
                  Welcome, {user.username}!
                </Text>
              </Tooltip>
            )}

            <Button as={RouterLink} to={isAdmin ? "/admin/finances" : "/my-expenses"} colorScheme="brand" variant="ghost">
              {isAdmin ? "Finances" : "My Finances"}
            </Button>

            {isAdmin && (
              <>
                <Button as={RouterLink} to="/admin/event-expenses" colorScheme="brand" variant="ghost">
                  Event Expenses
                </Button>
                <Button as={RouterLink} to="/admin/add-expense" colorScheme="brand" variant="ghost">
                  Add Expense
                </Button>
                <Button as={RouterLink} to="/admin/deposit" colorScheme="brand" variant="ghost">
                  Deposit
                </Button>
              </>
            )}

            <Button colorScheme="brand" variant="outline" onClick={handleLogout} ml={4}>Logout</Button>
          </Box>
        ) : (
          <MobileNav onLogout={handleLogout} isAdmin={isAdmin} />
        )}
      </Flex>

      <Box p={{ base: 4, md: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;