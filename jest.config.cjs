module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.cjs'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
    transform: {
        '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './.babelrc' }]
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(leaflet|react-leaflet)/)'
    ],
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
    verbose: true
}; 