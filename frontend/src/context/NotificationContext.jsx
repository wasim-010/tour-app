// src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useToast, Box, Text, Heading } from '@chakra-ui/react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

// This is a custom component for the toast UI
const NotificationToast = ({ title, message }) => (
    <Box color="white" p={4} bg="purple.500" borderRadius="lg" boxShadow="lg">
        <Heading size="sm">{title}</Heading>
        <Text mt={2}>{message}</Text>
    </Box>
);

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const toast = useToast();
    const socketRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        // Only connect if the user is authenticated
        if (isAuthenticated) {
            // Initialize the audio element
            if (!audioRef.current) {
                audioRef.current = new Audio('/notification.wav'); // Assumes the file is in /public
            }

            // Connect to the WebSocket server
            socketRef.current = io('/');

            // 1. Join all relevant group rooms
            const joinGroupRooms = async () => {
                try {
                    const response = await api.get('/groups');
                    const groups = response.data;
                    groups.forEach(group => {
                        socketRef.current.emit('joinGroup', group.group_id);
                    });
                } catch (error) {
                    console.error("Could not join group rooms:", error);
                }
            };

            joinGroupRooms();

            // 2. Listen for 'notification' events from the server
            socketRef.current.on('notification', ({ title, message }) => {
                // Play the sound
                audioRef.current.play().catch(e => console.error("Error playing sound:", e));

                // Show the Chakra UI toast
                toast({
                    position: 'top-right',
                    duration: 7000, // 7 seconds
                    isClosable: true,
                    render: () => <NotificationToast title={title} message={message} />,
                });
            });

            // Cleanup on component unmount or when user logs out
            return () => {
                console.log("Disconnecting socket...");
                socketRef.current.disconnect();
            };
        }
    }, [isAuthenticated, toast]);

    return (
        <NotificationContext.Provider value={{}}>
            {children}
        </NotificationContext.Provider>
    );
};