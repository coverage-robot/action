import { jest } from "@jest/globals";

import { GitParametersError } from "@errors";
import { default as pullRequestContext } from "./fixtures/pull_request.json" with { type: "json" };

describe("Given the git parameters helper", function () {
    beforeEach(() => {
        jest.resetModules();
    });

    it("throws when unable to infer commit hash", async () => {
        const getEnvironmentVariable = jest.fn();

        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", async () => ({
            ...actionsCoreModule,
            getInput: jest.fn(() => "mock-token"),
        }));
        jest.unstable_mockModule("@actions/github", async () => ({
            ...actionsGithubModule,
            getOctokit: () => ({
                rest: {
                    git: {
                        getCommit: () => ({
                            data: {
                                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
                            },
                        }),
                    },
                },
            }),
            context: {
                ...actionsGithubModule.context,
                payload: {},
            },
        }));

        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));

        const { getGitParameters } = await import("../getGitParameters.js");
        await expect(getGitParameters({ owner: "", repository: "" })).rejects.toThrow(
            GitParametersError.missingCommit().message,
        );
    });

    it("throws when unable to infer ref", async () => {
        const getEnvironmentVariable = jest.fn<() => Promise<string>>();
        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", async () => ({
            ...actionsCoreModule,
            getInput: jest.fn(() => "mock-token"),
        }));
        jest.unstable_mockModule("@actions/github", async () => ({
            ...actionsGithubModule,
            getOctokit: () => ({
                rest: {
                    git: {
                        getCommit: () => ({
                            data: {
                                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
                            },
                        }),
                    },
                },
            }),
            context: {
                ...actionsGithubModule.context,
                payload: {},
            },
        }));

        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));

        const { getGitParameters } = await import("../getGitParameters.js");

        getEnvironmentVariable.mockResolvedValueOnce("hash");

        await expect(getGitParameters({ owner: "", repository: "" })).rejects.toThrow(
            GitParametersError.missingRef().message,
        );
    });

    it("correctly infers parent commits", async () => {
        const getEnvironmentVariable = jest.fn();

        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", async () => ({
            ...actionsCoreModule,
            getInput: jest.fn(() => "mock-token"),
        }));
        jest.unstable_mockModule("@actions/github", async () => ({
            ...actionsGithubModule,
            getOctokit: () => ({
                rest: {
                    git: {
                        getCommit: () => ({
                            data: {
                                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
                            },
                        }),
                    },
                },
            }),
            context: {
                ...actionsGithubModule.context,
                payload: pullRequestContext,
            },
        }));
        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));
        const { getGitParameters } = await import("../getGitParameters.js");

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

        expect(
            await getGitParameters({
                owner: "owner",
                repository: "repo",
            }),
        ).toMatchObject({
            parent: ["parent-1", "parent-2"],
        });
    });

    it("correctly infers base ref and commit from pull request context", async () => {
        const getEnvironmentVariable = jest.fn();

        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", async () => ({
            ...actionsCoreModule,
            getInput: jest.fn(() => "mock-token"),
        }));
        jest.unstable_mockModule("@actions/github", async () => ({
            ...actionsGithubModule,
            getOctokit: () => ({
                rest: {
                    git: {
                        getCommit: () => ({
                            data: {
                                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
                            },
                        }),
                    },
                },
            }),
            context: {
                ...actionsGithubModule.context,
                payload: pullRequestContext,
            },
        }));

        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));

        const { getGitParameters } = await import("../getGitParameters.js");

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

        expect(
            await getGitParameters({
                owner: "owner",
                repository: "repo",
            }),
        ).toMatchObject({
            base: {
                commit: "mock-base-commit",
                ref: "master",
            },
        });
    });

    it("prefers pull request event head commit when inferring commit hash", async () => {
        const getEnvironmentVariable = jest.fn();

        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", async () => ({
            ...actionsCoreModule,
            getInput: jest.fn(() => "mock-token"),
        }));
        jest.unstable_mockModule("@actions/github", async () => ({
            ...actionsGithubModule,
            getOctokit: () => ({
                rest: {
                    git: {
                        getCommit: () => ({
                            data: {
                                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
                            },
                        }),
                    },
                },
            }),
            context: {
                ...actionsGithubModule.context,
                payload: pullRequestContext,
            },
        }));

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
        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));

        const { getGitParameters } = await import("../getGitParameters.js");

        expect(
            await getGitParameters({
                owner: "owner",
                repository: "repo",
            }),
        ).toMatchObject({
            head: {
                commit: "event-commit-hash",
            },
        });
    });

    it("prefers pull request head ref when inferrable", async () => {
        const getEnvironmentVariable = jest.fn();

        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", async () => ({
            ...actionsCoreModule,
            getInput: jest.fn(() => "mock-token"),
        }));
        jest.unstable_mockModule("@actions/github", async () => ({
            ...actionsGithubModule,
            getOctokit: () => ({
                rest: {
                    git: {
                        getCommit: () => ({
                            data: {
                                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
                            },
                        }),
                    },
                },
            }),
            context: {
                ...actionsGithubModule.context,
                payload: {},
            },
        }));
        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));

        const { getGitParameters } = await import("../getGitParameters.js");

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

        expect(
            await getGitParameters({
                owner: "owner",
                repository: "repo",
            }),
        ).toMatchObject({
            head: {
                ref: "head-ref",
            },
        });
    });

    it("uses ref name when head ref not inferrable", async () => {
        const getEnvironmentVariable = jest.fn();

        const actionsCoreModule = await import("@actions/core");
        const actionsGithubModule = await import("@actions/github");
        jest.unstable_mockModule("@actions/core", async () => ({
            ...actionsCoreModule,
            getInput: jest.fn(() => "mock-token"),
        }));
        jest.unstable_mockModule("@actions/github", async () => ({
            ...actionsGithubModule,
            getOctokit: () => ({
                rest: {
                    git: {
                        getCommit: () => ({
                            data: {
                                parents: [{ sha: "parent-1" }, { sha: "parent-2" }],
                            },
                        }),
                    },
                },
            }),
            context: {
                ...actionsGithubModule.context,
                payload: pullRequestContext,
            },
        }));
        jest.unstable_mockModule("../getEnvironmentVariable", () => ({
            getEnvironmentVariable,
        }));

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

        const { getGitParameters } = await import("../getGitParameters.js");

        expect(
            await getGitParameters({
                owner: "owner",
                repository: "repo",
            }),
        ).toMatchObject({
            head: {
                ref: "ref-name",
            },
        });
    });
});
