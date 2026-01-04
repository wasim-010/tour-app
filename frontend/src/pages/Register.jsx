// src/pages/Register.jsx
import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Heading, VStack, useToast, Link as ChakraLink
} from '@chakra-ui/react';
import api from '../api/api';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // <-- IMPORT navigation hooks

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate(); // <-- Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (validation code is the same)
    try {
      const apiUrl = '/auth/register';
      const userData = { username, email, password };
      await api.post(apiUrl, userData);

      toast({
        title: 'Registration Successful!',
        description: 'Please log in to continue.',
        status: 'success',
      });

      // Redirect the user to the login page
      navigate('/login');

    } catch (error) {
      toast({
        title: 'Registration Failed.',
        description: error.response?.data?.message || 'Something went wrong.',
        status: 'error',
      });
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="100vh">
      <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <Heading>Register</Heading>
          {/* ... (FormControls are the same) */}
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="brand" width="full">Register</Button>
          <ChakraLink as={RouterLink} to="/login">
            Already have an account? Login
          </ChakraLink>
        </VStack>
      </Box>
    </Box>
  );
};

export default Register;