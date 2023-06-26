import { ContextParametersError } from "@errors";

const context = {
    repo: {},
    payload: {},
};
const getEnvironmentVariable = jest.fn();

import { getContextParameters } from "@utilities";
import * as pullRequestContext from "./fixtures/pull_request.json";

jest.mock("@actions/github", () => ({
    context,
}));
jest.mock("../getEnvironmentVariable", () => ({
    getEnvironmentVariable,
}));

describe("Given the context parameters helper", function () {
    it("returns the owner and repo from context", async () => {
        context.repo = {
            owner: "owner",
            repo: "repo",
        };

        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_WORKSPACE":
                    return __dirname;
                default:
                    return undefined;
            }
        });

        expect(getContextParameters()).toEqual({
            owner: "owner",
            repository: "repo",
            projectRoot: __dirname,
        });
    });

    it("returns the pull request from payload context", async () => {
        context.repo = {
            owner: "owner",
            repo: "repo",
        };
        context.payload = pullRequestContext;

        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_WORKSPACE":
                    return __dirname;
                default:
                    return undefined;
            }
        });

        expect(getContextParameters()).toEqual({
            owner: "owner",
            pullRequest: 1,
            projectRoot: __dirname,
            repository: "repo",
        });
    });

    it("validates project root exists", () => {
        context.repo = {
            owner: "owner",
            repo: "repo",
        };
        context.payload = pullRequestContext;

        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_WORKSPACE":
                    return "some-invalid-path/";
                default:
                    return undefined;
            }
        });

        expect(() => getContextParameters()).toThrow(ContextParametersError.missingProjectRoot());
    });
});
