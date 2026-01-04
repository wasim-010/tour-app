import React from 'react';
import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';

const FormInput = ({ label, type = 'text', value, onChange, placeholder, isRequired = false, error, ...props }) => {
    return (
        <FormControl isRequired={isRequired} isInvalid={!!error} {...props}>
            <FormLabel>{label}</FormLabel>
            <Input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    );
};

export default FormInput;
