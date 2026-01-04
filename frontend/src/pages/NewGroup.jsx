// src/pages/NewGroup.jsx
import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  useToast,
  Container,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const NewGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName) {
      toast({ title: 'Group name is required.', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newGroupData = {
        group_name: groupName,
        description: description,
      };
      // The backend automatically makes the creator an admin of the new group
      await api.post('/groups', newGroupData);
      toast({
        title: 'Group created successfully!',
        status: 'success',
      });
      // Go back to the dashboard to see the new group
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Failed to create group.',
        description: error.response?.data?.message || 'Please try again.',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" mt={8}>
      <Box p={8} borderWidth="1px" borderRadius="lg" shadow="md">
        <Heading mb={6}>Create a New Tour Group</Heading>
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel>Group Name</FormLabel>
            <Input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Khulna Trip 2025"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of the tour."
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="brand"
            width="full"
            isLoading={isSubmitting}
          >
            Create Group
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default NewGroup;