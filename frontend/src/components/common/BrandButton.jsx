import React from 'react';
import { Button } from '@chakra-ui/react';

const BrandButton = ({ children, ...props }) => {
    return (
        <Button colorScheme="brand" {...props}>
            {children}
        </Button>
    );
};

export default BrandButton;
