// src/components/AddExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, useToast, VStack, Text,
} from '@chakra-ui/react';
import api from '../api/api';

const AddExpenseModal = ({ isOpen, onClose, event }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  if (!event) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const expenseData = {
        event_id: event.event_id,
        quantity: quantity,
      };
      await api.post('/expenses', expenseData);
      toast({
        title: 'Expense Submitted!',
        description: `Added ${quantity} of ${event.event_name}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.message || 'There was an error.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Expense for "{event.event_name}"</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text>Estimated cost per unit: <strong>৳{event.estimated_cost_per_unit.toFixed(2)}</strong></Text>
            <FormControl isRequired>
              <FormLabel>Quantity</FormLabel>
              <NumberInput
                defaultValue={1}
                min={1}
                value={quantity}
                onChange={(valueString) => setQuantity(parseInt(valueString) || 1)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Text fontSize="xl" fontWeight="bold">
              Total Estimated Cost: ৳{(event.estimated_cost_per_unit * quantity).toFixed(2)}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} isDisabled={isSubmitting}>Cancel</Button>
          <Button colorScheme="brand" ml={3} onClick={handleSubmit} isLoading={isSubmitting}>Submit Expense</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddExpenseModal;