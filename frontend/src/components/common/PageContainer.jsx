import React from 'react';
import { Box } from '@chakra-ui/react';

const PageContainer = ({ children, ...props }) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="100vh"
            bg="gray.50"
            _dark={{ bg: 'gray.900' }}
            {...props}
        >
            {children}
        </Box>
    );
};

export default PageContainer;
