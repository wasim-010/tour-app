// src/pages/GroupFinances.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon, SimpleGrid, Stat, StatLabel,
  StatNumber, StatHelpText, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, useDisclosure, Flex,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import api from '../api/api';
import AddDepositModal from '../components/admin/AddDepositModal';

const GroupFinances = () => {
  const { groupId } = useParams();
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchFinances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/finances/group/${groupId}`);
      setSummary(response.data.groupSummary);
      setUsers(response.data.userSummaries);
    } catch (err) {
      setError('Failed to fetch financial data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  if (loading) return <Spinner size="xl" display="block" mx="auto" my={8} />;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;

  // --- THIS IS THE FIX ---
  // Filter the users list right after fetching and before rendering anything.
  const memberUsers = users.filter(user => user.role !== 'admin');

  return (
    <>
      <Box>
        <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem><BreadcrumbLink as={RouterLink} to="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage><BreadcrumbLink href="#">Group Finances</BreadcrumbLink></BreadcrumbItem>
        </Breadcrumb>
        <Flex align="center" justify="space-between" mt={4} mb={6}>
          <Heading>Group Financial Summary</Heading>
          <Button colorScheme="brand" onClick={onOpen}>Add Deposit</Button>
        </Flex>
        {summary && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg">
              <StatLabel>Total Deposited</StatLabel>
              <StatNumber color="green.500">৳{summary.total_deposited.toFixed(2)}</StatNumber>
            </Stat>
            <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg">
              <StatLabel>Total Spent</StatLabel>
              <StatNumber color="orange.500">৳{summary.total_spent.toFixed(2)}</StatNumber>
            </Stat>
            <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg">
              <StatLabel>Group Balance</StatLabel>
              <StatNumber color={summary.balance < 0 ? 'red.500' : 'blue.500'}>৳{summary.balance.toFixed(2)}</StatNumber>
              <StatHelpText>{summary.balance < 0 ? 'Over budget' : 'Remaining'}</StatHelpText>
            </Stat>
          </SimpleGrid>
        )}
        <Heading size="lg" mb={4}>Individual Balances</Heading>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr><Th>User</Th><Th isNumeric>Deposited</Th><Th isNumeric>Spent</Th><Th isNumeric>Balance</Th></Tr>
            </Thead>
            <Tbody>
              {/* Render the pre-filtered list */}
              {memberUsers.map(user => (
                <Tr key={user.user_id} bg={user.balance < 0 ? 'red.50' : 'transparent'}>
                  <Td>{user.username}</Td>
                  <Td isNumeric color="green.600">৳{user.total_deposited.toFixed(2)}</Td>
                  <Td isNumeric color="orange.600">৳{user.total_spent.toFixed(2)}</Td>
                  <Td isNumeric fontWeight="bold" color={user.balance < 0 ? 'red.600' : 'inherit'}>৳{user.balance.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      <AddDepositModal
        isOpen={isOpen}
        onClose={onClose}
        groupId={groupId}
        users={memberUsers} // Pass the filtered list to the modal as well
        onDepositSuccess={fetchFinances}
      />
    </>
  );
};

export default GroupFinances;