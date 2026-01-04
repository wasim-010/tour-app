import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

const Card = ({ children, ...props }) => {
    const bg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    return (
        <Box
            bg={bg}
            p={8}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius={8}
            boxShadow="lg"
            {...props}
        >
            {children}
        </Box>
    );
};

export default Card;
