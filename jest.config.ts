import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.{ts,js}', '!**/node_modules/**', '!**/dist/**'],
  setupFiles: ['dotenv/config'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;