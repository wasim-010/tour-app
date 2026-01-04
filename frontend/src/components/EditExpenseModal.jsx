// src/components/EditExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, useToast, VStack, Text,
} from '@chakra-ui/react';
import api from '../api/api';

const EditExpenseModal = ({ isOpen, onClose, expense, onUpdate }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (expense) {
      setQuantity(expense.quantity);
    }
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/expenses/${expense.expense_id}`, { quantity });
      toast({ title: 'Expense Updated!', status: 'success', isClosable: true });
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      toast({ title: 'Update Failed', description: error.response?.data?.message, status: 'error', isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const newTotal = (expense.estimated_cost_per_unit * quantity).toFixed(2);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Expense for "{expense.event_name}"</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text>Cost per unit: <strong>৳{expense.estimated_cost_per_unit.toFixed(2)}</strong></Text>
            <FormControl isRequired>
              <FormLabel>Quantity</FormLabel>
              <NumberInput value={quantity} min={1} onChange={(val) => setQuantity(parseInt(val) || 1)}>
                <NumberInputField />
                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Text fontSize="xl" fontWeight="bold">New Total Cost: ৳{newTotal}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} isDisabled={isSubmitting}>Cancel</Button>
          <Button colorScheme="brand" ml={3} onClick={handleSubmit} isLoading={isSubmitting}>Save Changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditExpenseModal;