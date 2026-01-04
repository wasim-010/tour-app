import { extendTheme } from '@chakra-ui/react';

// Define your brand colors
const colors = {
    brand: {
        50: '#E6FFFA',
        100: '#B2F5EA',
        200: '#81E6D9',
        300: '#4FD1C5',
        400: '#38B2AC',
        500: '#319795', // Main Teal color
        600: '#2C7A7B',
        700: '#285E61',
        800: '#234E52',
        900: '#1D4044',
    },
    bg: {
        surface: '#1A202C', // Dark gray surface (gray.800)
        canvas: '#171923', // Darker background (gray.900)
    }
};

const theme = extendTheme({
    colors,
    styles: {
        global: {
            body: {
                bg: 'gray.50',
                color: 'gray.800',
            },
        },
    },
    components: {
        Button: {
            defaultProps: {
                colorScheme: 'brand',
            },
            variants: {
                solid: (props) => ({
                    bg: props.colorMode === 'dark' ? 'brand.200' : 'brand.500',
                    _hover: {
                        bg: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
                    },
                }),
            },
        },
        Heading: {
            baseStyle: {
                color: 'gray.700',
            },
        },
    },
});

export default theme;
