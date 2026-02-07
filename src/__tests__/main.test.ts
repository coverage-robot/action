import { jest } from "@jest/globals";
import { resolve } from "path";

const sign = jest.fn();
const upload = jest.fn();
const getContextParameters = jest.fn();
const getGitParameters = jest.fn();
const getInput = jest.fn();
const getMultilineInput = jest.fn();

import { SigningError } from "@errors";

const actionsCoreModule = await import("@actions/core");
jest.unstable_mockModule("@requests", () => ({ sign, upload }));
jest.unstable_mockModule("@utilities/getContextParameters", () => ({ getContextParameters }));
jest.unstable_mockModule("@utilities/getGitParameters", () => ({ getGitParameters }));
jest.unstable_mockModule("@actions/core", async () => {
    return { ...actionsCoreModule, getInput, getMultilineInput };
});

const { run } = await import("../main.js");

describe("Given the main runtime", function () {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("correctly signs and uploads file with inferred parameters", async () => {
        const file = "src/__tests__/fixtures/mock-file.xml";

        getMultilineInput.mockImplementation((name) => (name === "files" ? [file] : []));
        getInput.mockImplementation((name) =>
            name === "tag" ? "mock-tag" : name === "endpoint" ? "mock-endpoint" : "",
        );

        getContextParameters.mockReturnValueOnce({
            owner: "owner",
            pullRequest: undefined,
            repository: "repo",
            projectRoot: "mock-root/path",
        });

        getGitParameters.mockReturnValueOnce({
            head: { commit: "event-commit-hash", ref: "ref-name" },
            base: { commit: undefined, ref: undefined },
            parent: ["parent-1", "parent-2"],
        });

        sign.mockReturnValueOnce({
            uploadId: "mock-upload",
            signedUrl: "mock-url",
            expiration: "2023-06-11 12:00:00",
        });

        upload.mockReturnValueOnce(true);

        await run();

        expect(getMultilineInput).toHaveBeenCalledTimes(1);
        expect(getInput).toHaveBeenCalledTimes(3);
        expect(getContextParameters).toHaveBeenCalledTimes(1);
        expect(getGitParameters).toHaveBeenCalledTimes(1);

        expect(sign).toHaveBeenNthCalledWith(
            1,
            expect.anything(),
            resolve(file),
            {
                head: { commit: "event-commit-hash", ref: "ref-name" },
                base: { commit: undefined, ref: undefined },
                owner: "owner",
                parent: ["parent-1", "parent-2"],
                provider: "github",
                pullRequest: undefined,
                repository: "repo",
                tag: "mock-tag",
                projectRoot: "mock-root/path",
            },
            "mock-endpoint",
            expect.anything(),
        );

        expect(upload).toHaveBeenNthCalledWith(1, resolve(file), expect.anything(), "mock-url");
    });

    it("does not attempt upload when signing fails", async () => {
        const file = "src/__tests__/fixtures/mock-file.xml";

        getMultilineInput.mockReturnValue([file]);
        getInput.mockImplementation((name) =>
            name === "tag" ? "mock-tag" : name === "endpoint" ? "mock-endpoint" : "",
        );

        getContextParameters.mockReturnValueOnce({
            owner: "owner",
            pullRequest: undefined,
            repository: "repo",
            projectRoot: "mock-root/path",
        });

        getGitParameters.mockReturnValueOnce({
            head: { commit: "event-commit-hash", ref: "ref-name" },
            base: { commit: undefined, ref: undefined },
            parent: ["parent-1", "parent-2"],
        });

        sign.mockImplementation(() => {
            throw SigningError.invalidResponseCode(400);
        });

        await run();

        expect(sign).toHaveBeenCalled();
        expect(upload).not.toHaveBeenCalled();
    });

    it("handles wildcard glob file paths", async () => {
        getMultilineInput.mockReturnValue(["src/__tests__/fixtures/*.xml"]);
        getInput.mockImplementation((name) =>
            name === "tag" ? "mock-tag" : name === "endpoint" ? "mock-endpoint" : "",
        );

        getContextParameters.mockReturnValueOnce({
            owner: "owner",
            pullRequest: undefined,
            repository: "repo",
            projectRoot: "mock-root/path",
        });

        getGitParameters.mockReturnValueOnce({
            head: { commit: "event-commit-hash", ref: "ref-name" },
            base: { commit: undefined, ref: undefined },
            parent: ["parent-1", "parent-2"],
        });

        sign.mockReturnValueOnce({
            uploadId: "mock-upload",
            signedUrl: "mock-url",
            expiration: "2023-06-11 12:00:00",
        });

        upload.mockReturnValueOnce(true);

        await run();

        expect(sign).toHaveBeenCalled();
        expect(upload).toHaveBeenCalled();
    });
});
