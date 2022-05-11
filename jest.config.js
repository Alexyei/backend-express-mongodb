module.exports = {
    preset: 'ts-jest',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
    },
    setupFilesAfterEnv: ['./__test__/jest.setup.ts'],
};