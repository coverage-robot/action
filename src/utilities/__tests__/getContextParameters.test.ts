const context = {
    repo: {},
    payload: {},
};

import { getContextParameters } from "@utilities";
import * as pullRequestContext from "./fixtures/pull_request.json";

jest.mock("@actions/github", () => ({
    context,
}));

describe("Given the context parameters helper", function () {
    it("returns the owner and repo from context", async () => {
        context.repo = {
            owner: "owner",
            repo: "repo",
        };

        expect(getContextParameters()).toEqual({
            owner: "owner",
            repository: "repo",
        });
    });

    it("returns the pull request from payload context", async () => {
        context.repo = {
            owner: "owner",
            repo: "repo",
        };
        context.payload = pullRequestContext;

        expect(getContextParameters()).toEqual({
            owner: "owner",
            pullRequest: 1,
            repository: "repo",
        });
    });
});
