// src/components/admin/AddDepositModal.jsx
import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, NumberInput, NumberInputField,
  Select, useToast, VStack
} from '@chakra-ui/react';
import api from '../../api/api';
import eventBus from '../../services/eventBus'; // Import the global event bus

const AddDepositModal = ({ isOpen, onClose, groupId, users, onDepositSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!selectedUserId || !amount || parseFloat(amount) <= 0) {
      toast({ title: 'Please select a user and enter a valid amount.', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/finances/deposits', {
        user_id: parseInt(selectedUserId),
        group_id: parseInt(groupId),
        amount: parseFloat(amount)
      });
      toast({ title: 'Deposit added successfully!', status: 'success' });

      eventBus.emit('financeDataChanged'); // EMIT THE GLOBAL EVENT

      if (onDepositSuccess) {
        onDepositSuccess();
      }

      onClose();
      setAmount('');
      setSelectedUserId('');
    } catch (error) {
      toast({ title: 'Failed to add deposit.', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add a Deposit</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Select User</FormLabel>
              <Select
                placeholder="-- Select a user --"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {users.map(user => (
                  <option key={user.user_id} value={user.user_id}>{user.username}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Amount</FormLabel>
              <NumberInput min={0.01} value={amount} onChange={(valueString) => setAmount(valueString)}>
                <NumberInputField placeholder="e.g., 100.00" />
              </NumberInput>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} isDisabled={isSubmitting}>Cancel</Button>
          <Button colorScheme="brand" ml={3} onClick={handleSubmit} isLoading={isSubmitting}>
            Add Deposit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddDepositModal;