module.exports = {
    preset: 'ts-jest',
    maxWorkers: 1,
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
    },
    setupFilesAfterEnv: ['./__test__/jest.setup.ts'],
};