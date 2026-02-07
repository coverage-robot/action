import { jest } from "@jest/globals";
import { ContextParametersError } from "@errors";

import { default as pullRequestContext } from "./fixtures/pull_request.json" with { type: "json" };
import { dirname } from "path";
import { fileURLToPath } from "url";

describe("Given the context parameters helper", function () {
    beforeEach(() => {
        jest.resetModules();
    });

    it("returns the owner and repo from context", async () => {
        const getEnvironmentVariable = jest.fn();

        jest.unstable_mockModule("@actions/github", () => ({
            context: {
                repo: {
                    owner: "owner",
                    repo: "repo",
                },
                payload: {},
            },
        }));
        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));

        const { getContextParameters } = await import("../getContextParameters.js");

        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_WORKSPACE":
                    return dirname(fileURLToPath(import.meta.url));
                default:
                    return undefined;
            }
        });

        expect(getContextParameters()).toEqual({
            owner: "owner",
            repository: "repo",
            projectRoot: dirname(fileURLToPath(import.meta.url)),
        });
    });

    it("returns the pull request from payload context", async () => {
        const getEnvironmentVariable = jest.fn();

        jest.unstable_mockModule("@actions/github", () => ({
            context: {
                repo: {
                    owner: "owner",
                    repo: "repo",
                },
                payload: pullRequestContext,
            },
        }));
        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));

        const { getContextParameters } = await import("../getContextParameters.js");

        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_WORKSPACE":
                    return dirname(fileURLToPath(import.meta.url));
                default:
                    return undefined;
            }
        });

        expect(getContextParameters()).toEqual({
            owner: "owner",
            pullRequest: 1,
            projectRoot: dirname(fileURLToPath(import.meta.url)),
            repository: "repo",
        });
    });

    it("validates project root exists", async () => {
        const getEnvironmentVariable = jest.fn();

        jest.unstable_mockModule("@actions/github", () => ({
            context: {
                repo: {
                    owner: "owner",
                    repo: "repo",
                },
                payload: pullRequestContext,
            },
        }));
        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));

        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_WORKSPACE":
                    return "some-invalid-path/";
                default:
                    return undefined;
            }
        });

        const { getContextParameters } = await import("../getContextParameters.js");

        expect(() => getContextParameters()).toThrow(ContextParametersError.missingProjectRoot().message);
    });
});
