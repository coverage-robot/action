const getCommit = jest.fn();
const getEnvironmentVariable = jest.fn();

import { GitParametersError } from "@errors";
import * as pullRequestContext from "./fixtures/pull_request.json";
import { context } from "@actions/github";
import { getGitParameters } from "@utilities";

jest.mock("@actions/core", () => ({
    ...jest.requireActual("@actions/core"),
    getInput: jest.fn(() => "mock-token"),
}));
jest.mock("@actions/github", () => ({
    ...jest.requireActual("@actions/github"),
    getOctokit: () => ({
        rest: {
            git: {
                getCommit,
            },
        },
    }),
    context: {
        ...jest.requireActual("@actions/github").context,
        payload: {},
    },
}));
jest.mock("../getEnvironmentVariable", () => ({
    getEnvironmentVariable,
}));

describe("Given the git parameters helper", function () {
    it("throws when unable to infer commit hash", async () => {
        await expect(getGitParameters({ owner: "", repository: "" })).rejects.toThrow(
            GitParametersError.missingCommit(),
        );
    });

    it("throws when unable to infer ref", async () => {
        getEnvironmentVariable.mockResolvedValueOnce("hash");

        await expect(getGitParameters({ owner: "", repository: "" })).rejects.toThrow(GitParametersError.missingRef());
    });

    it("correctly infers parent commits", async () => {
        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_SHA":
                    return "hash";
                case "GITHUB_HEAD_REF":
                    return "head-ref";
                default:
                    return undefined;
            }
        });

        getCommit.mockReturnValue({
            data: {
                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
            },
        });

        expect(
            await getGitParameters({
                owner: "owner",
                repository: "repo",
            }),
        ).toMatchObject({
            parent: ["parent-1", "parent-2"],
        });

        expect(getCommit).toHaveBeenCalled();
    });

    it("prefers pull request event head commit when inferring commit hash", async () => {
        context.payload = pullRequestContext;

        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_SHA":
                    return "env-hash";
                case "GITHUB_HEAD_REF":
                    return "head-ref";
                case "GITHUB_REF_NAME":
                    return "ref-name";
                default:
                    return undefined;
            }
        });

        getCommit.mockReturnValue({
            data: {
                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
            },
        });

        expect(
            await getGitParameters({
                owner: "owner",
                repository: "repo",
            }),
        ).toMatchObject({
            commit: "event-commit-hash",
        });
    });

    it("prefers pull request head ref when inferrable", async () => {
        context.payload = pullRequestContext;

        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_SHA":
                    return "env-hash";
                case "GITHUB_HEAD_REF":
                    return "head-ref";
                case "GITHUB_REF_NAME":
                    return "ref-name";
                default:
                    return undefined;
            }
        });

        getCommit.mockReturnValue({
            data: {
                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
            },
        });

        expect(
            await getGitParameters({
                owner: "owner",
                repository: "repo",
            }),
        ).toMatchObject({
            ref: "head-ref",
        });
    });

    it("uses ref name when head ref not inferrable", async () => {
        context.payload = pullRequestContext;

        getEnvironmentVariable.mockImplementation((name) => {
            switch (name) {
                case "GITHUB_SHA":
                    return "env-hash";
                case "GITHUB_REF_NAME":
                    return "ref-name";
                default:
                    return undefined;
            }
        });

        getCommit.mockReturnValue({
            data: {
                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
            },
        });

        expect(
            await getGitParameters({
                owner: "owner",
                repository: "repo",
            }),
        ).toMatchObject({
            ref: "ref-name",
        });
    });
});
