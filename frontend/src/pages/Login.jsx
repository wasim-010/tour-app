// src/pages/Login.jsx
import React, { useState } from 'react';
import {
  Heading, VStack, useToast, Link as ChakraLink
} from '@chakra-ui/react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// New Shared Components
import PageContainer from '../components/common/PageContainer';
import Card from '../components/common/Card';
import FormInput from '../components/common/FormInput';
import BrandButton from '../components/common/BrandButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'All fields are required.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = '/auth/login';
      const userData = { email, password };
      const response = await api.post(apiUrl, userData);

      // Call the global login function from our context
      login(response.data);

      // --- ADD THIS LINE FOR DEBUGGING ---
      console.log(`[Login.jsx] Token set in localStorage: ${localStorage.getItem('token')} `);
      // ------------------------------------

      toast({
        title: 'Login Successful!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirect the user to their dashboard
      navigate('/dashboard');

    } catch (error) {
      toast({
        title: 'Login Failed.',
        description: error.response?.data?.message || 'Invalid credentials.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <Card maxWidth="500px" width="100%">
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <Heading>Login</Heading>

          <FormInput
            label="Email address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
          />

          <BrandButton type="submit" width="full" isLoading={isLoading}>
            Login
          </BrandButton>

          <ChakraLink as={RouterLink} to="/register">
            Don't have an account? Register
          </ChakraLink>
        </VStack>
      </Card>
    </PageContainer>
  );
};

export default Login;