const getGitParameters = jest.fn();
const getContextParameters = jest.fn();
const getInput = jest.fn();

import { ContextParameters } from "@utilities";
import { getParameters } from "@utilities";
import { GitParameters } from "@utilities";

jest.mock("../getContextParameters", () => ({
    getContextParameters,
}));
jest.mock("../getGitParameters", () => ({
    getGitParameters,
}));
jest.mock("@actions/core", () => ({
    getInput,
}));

describe("Given the parameters helper", () => {
    it("correctly pulls the tag from inputs and adds provider", async () => {
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
            parent: ["parent-1", "parent-2"]
        } satisfies GitParameters);

        getInput.mockReturnValueOnce("mock-tag");

        await expect(getParameters()).resolves.toMatchObject({
            provider: "github",
            tag: "mock-tag",
        });

        expect(getContextParameters).toHaveBeenCalledTimes(1);
        expect(getGitParameters).toHaveBeenCalledTimes(1);
        expect(getInput).toHaveBeenCalledTimes(1);
    });
});
