// src/pages/Deposit.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, VStack, FormControl, FormLabel, Button, useToast,
  Select, Container, NumberInput, NumberInputField, Text, Spinner,
} from '@chakra-ui/react';
import api from '../api/api';
import eventBus from '../services/eventBus'; // Import the global event bus

const Deposit = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchAdminGroups = async () => {
      setLoadingGroups(true);
      try {
        const response = await api.get('/groups');
        const adminGroups = response.data.filter(g => g.role === 'admin');
        setGroups(adminGroups);

        if (adminGroups.length === 1) {
          setSelectedGroupId(adminGroups[0].group_id.toString());
        }
      } catch (error) {
        toast({ title: 'Could not load groups.', status: 'error', isClosable: true });
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchAdminGroups();
  }, [toast]);

  useEffect(() => {
    const fetchUsersForGroup = async () => {
      if (!selectedGroupId) {
        setUsers([]);
        setSelectedUserId('');
        return;
      }
      setLoadingUsers(true);
      try {
        const response = await api.get(`/groups/${selectedGroupId}/users`);
        setUsers(response.data.filter(u => u.role !== 'admin'));
      } catch (error) {
        toast({ title: 'Could not load users for the selected group.', status: 'error', isClosable: true });
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsersForGroup();
  }, [selectedGroupId, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !amount || parseFloat(amount) <= 0) {
      toast({ title: "Please select a group, a user, and enter a valid amount.", status: "warning" });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/finances/deposits', {
        group_id: parseInt(selectedGroupId),
        user_id: parseInt(selectedUserId),
        amount: parseFloat(amount)
      });
      toast({ title: "Deposit successful!", status: 'success' });

      eventBus.emit('financeDataChanged'); // EMIT THE GLOBAL EVENT

      setSelectedGroupId(groups.length === 1 ? selectedGroupId : ''); // Keep group selected if only one
      setSelectedUserId('');
      setAmount('');
    } catch (error) {
      toast({ title: 'Deposit failed.', description: error.response?.data?.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md">
      <Box p={8} borderWidth="1px" borderRadius="lg" shadow="md">
        <Heading mb={6}>Add a Deposit</Heading>
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>

          {loadingGroups ? <Spinner /> : (
            groups.length > 1 ? (
              <FormControl isRequired>
                <FormLabel>1. Select Group</FormLabel>
                <Select placeholder="-- Select Group --" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
                  {groups.map(g => <option key={g.group_id} value={g.group_id}>{g.group_name}</option>)}
                </Select>
              </FormControl>
            ) : groups.length === 1 ? (
              <FormControl>
                <FormLabel>Group</FormLabel>
                <Text p={2} borderWidth="1px" borderRadius="md" bg="gray.100">{groups[0].group_name}</Text>
              </FormControl>
            ) : (
              <Text color="gray.500">You do not manage any groups.</Text>
            )
          )}

          <FormControl isRequired isDisabled={!selectedGroupId || loadingUsers}>
            <FormLabel>2. Select User</FormLabel>
            {loadingUsers ? <Spinner /> : (
              <Select placeholder="-- Select User --" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                {users.map(u => <option key={u.user_id} value={u.user_id}>{u.username}</option>)}
              </Select>
            )}
          </FormControl>
          <FormControl isRequired isDisabled={!selectedUserId}>
            <FormLabel>3. Amount</FormLabel>
            <NumberInput min={0.01} value={amount} onChange={(valueString) => setAmount(valueString)}>
              <NumberInputField placeholder="100.00" />
            </NumberInput>
          </FormControl>
          <Button type="submit" colorScheme="brand" width="full" isLoading={isSubmitting} isDisabled={!selectedUserId || !amount}>
            Submit Deposit
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default Deposit;