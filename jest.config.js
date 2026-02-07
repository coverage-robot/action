export default {
    moduleFileExtensions: ["js", "ts"],
    testMatch: ["**/*.test.ts"],
    resetMocks: true,
    preset: "ts-jest",
    resolver: "ts-jest-resolver",
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.json",
                useESM: true,
            },
        ],
    },
    extensionsToTreatAsEsm: [".ts"],
    moduleFileExtensions: ["ts", "js"],
    moduleNameMapper: {
        "^@requests(.*)$": "<rootDir>/src/requests$1",
        "^@requests$": "<rootDir>/src/requests/index.js$1",
        "^@utilities(.*)$": "<rootDir>/src/utilities$1",
        "^@utilities$": "<rootDir>/src/utilities/index.js$1",
        "^@errors(.*)$": "<rootDir>/src/errors",
        "^@errors$": "<rootDir>/src/errors/index.js",
    },
    collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
        "!<rootDir>/src/**/__tests__/**/*",
        "!<rootDir>/src/runtime.ts",
        "!<rootDir>/src/**/index.ts",
    ],
    verbose: true,
};
