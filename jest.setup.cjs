const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock getRandomBrightColor function
global.getRandomBrightColor = jest.fn().mockReturnValue('#FF0000');

// Mock react-router hooks
jest.mock('react-router', () => ({
    useLocation: () => ({
        pathname: '/',
        search: '',
        hash: '',
        state: null
    }),
    useNavigate: () => jest.fn(),
    useParams: () => ({})
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
    useLocation: () => ({
        pathname: '/',
        search: '',
        hash: '',
        state: null
    }),
    useParams: () => ({})
})); 