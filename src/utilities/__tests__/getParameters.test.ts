import { jest } from "@jest/globals";

import { ContextParameters } from "@utilities";
import { GitParameters } from "@utilities";

describe("Given the parameters helper", () => {
    beforeEach(() => {
        jest.resetModules();
    });
    it("correctly pulls the tag from inputs and adds provider", async () => {
        const getGitParameters = jest.fn();
        const getContextParameters = jest.fn();
        const getInput = jest.fn();
        jest.unstable_mockModule("../getContextParameters", () => ({
            getContextParameters,
        }));
        jest.unstable_mockModule("../getGitParameters", () => ({
            getGitParameters,
        }));
        jest.unstable_mockModule("@actions/core", () => ({
            getInput,
        }));

        getContextParameters.mockReturnValueOnce({
            owner: "owner",
            pullRequest: 1,
            repository: "repo",
            projectRoot: "mock-root/path",
        } satisfies ContextParameters);

        getGitParameters.mockReturnValueOnce({
            head: {
                commit: "event-commit-hash",
                ref: "ref-name",
            },
            base: {
                commit: undefined,
                ref: undefined,
            },
            parent: ["parent-1", "parent-2"],
        } satisfies GitParameters);

        getInput.mockReturnValueOnce("mock-tag");

        const { getParameters } = await import("../getParameters.js");

        await expect(getParameters()).resolves.toMatchObject({
            provider: "github",
            tag: "mock-tag",
        });

        expect(getContextParameters).toHaveBeenCalledTimes(1);
        expect(getGitParameters).toHaveBeenCalledTimes(1);
        expect(getInput).toHaveBeenCalledTimes(1);
    });
});
