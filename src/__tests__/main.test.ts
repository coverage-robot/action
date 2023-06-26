import { ContextParameters, GitParameters } from "@utilities";
import { resolve } from "path";

const sign = jest.fn();
const upload = jest.fn();
const getContextParameters = jest.fn();
const getGitParameters = jest.fn();
const getInput = jest.fn();
const getMultilineInput = jest.fn();

import { run } from "../main";
import { SigningError } from "@errors";

jest.mock("@actions/http-client", () => ({ HttpClient: jest.fn() }));
jest.mock("@utilities/getContextParameters", () => ({ getContextParameters }));
jest.mock("@utilities/getGitParameters", () => ({ getGitParameters }));
jest.mock("@requests", () => ({
    sign,
    upload,
}));
jest.mock("@actions/core", () => ({
    ...jest.requireActual("@actions/core"),
    getInput,
    getMultilineInput,
}));

describe("Given the main runtime", function () {
    it("correctly signs and uploads file with inferred parameters", async () => {
        const file = "src/__tests__/fixtures/mock-file.xml";

        getMultilineInput.mockImplementation((name) => (name === "files" ? [file] : []));
        getInput.mockImplementation((name) => (name === "tag" ? "mock-tag" : ""));

        getContextParameters.mockReturnValueOnce({
            owner: "owner",
            pullRequest: undefined,
            repository: "repo",
            projectRoot: "mock-root/path",
        } satisfies ContextParameters);

        getGitParameters.mockReturnValueOnce({
            commit: "event-commit-hash",
            parent: ["parent-1", "parent-2"],
            ref: "ref-name",
        } satisfies GitParameters);

        sign.mockReturnValueOnce({
            uploadId: "mock-upload",
            expiration: "2023-06-11 12:00:00",
            signedUrl: "mock-url",
        });

        upload.mockReturnValueOnce(true);

        await run();

        expect(getMultilineInput).toHaveBeenCalledTimes(1);
        expect(getInput).toHaveBeenCalledTimes(1);

        expect(getContextParameters).toHaveBeenCalledTimes(1);
        expect(getGitParameters).toHaveBeenCalledTimes(1);

        expect(sign).toHaveBeenNthCalledWith(1, expect.anything(), resolve(file), {
            commit: "event-commit-hash",
            owner: "owner",
            parent: ["parent-1", "parent-2"],
            provider: "github",
            pullRequest: undefined,
            ref: "ref-name",
            repository: "repo",
            tag: "mock-tag",
            projectRoot: "mock-root/path",
        });
        expect(upload).toHaveBeenNthCalledWith(1, resolve(file), expect.anything(), "mock-url");
    });

    it("does not attempt upload when signing fails", async () => {
        const file = "src/__tests__/fixtures/mock-file.xml";

        getMultilineInput.mockImplementation((name) => (name === "files" ? [file] : []));
        getInput.mockImplementation((name) => (name === "tag" ? "mock-tag" : ""));

        getContextParameters.mockReturnValueOnce({
            owner: "owner",
            pullRequest: undefined,
            repository: "repo",
            projectRoot: "mock-root/path",
        } satisfies ContextParameters);

        getGitParameters.mockReturnValueOnce({
            commit: "event-commit-hash",
            parent: ["parent-1", "parent-2"],
            ref: "ref-name",
        } satisfies GitParameters);

        sign.mockImplementation(() => {
            throw SigningError.invalidResponseCode(400);
        });

        await run();

        expect(getMultilineInput).toHaveBeenCalledTimes(1);
        expect(getInput).toHaveBeenCalledTimes(1);

        expect(getContextParameters).toHaveBeenCalledTimes(1);
        expect(getGitParameters).toHaveBeenCalledTimes(1);

        expect(sign).toHaveBeenNthCalledWith(1, expect.anything(), resolve(file), {
            commit: "event-commit-hash",
            owner: "owner",
            parent: ["parent-1", "parent-2"],
            provider: "github",
            pullRequest: undefined,
            ref: "ref-name",
            repository: "repo",
            tag: "mock-tag",
            projectRoot: "mock-root/path",
        });
        expect(upload).not.toHaveBeenCalled();
    });

    it("handles wildcard glob file paths", async () => {
        const file = "src/__tests__/fixtures/mock-file.xml";

        getMultilineInput.mockImplementation((name) => (name === "files" ? ["src/__tests__/fixtures/*.xml"] : []));
        getInput.mockImplementation((name) => (name === "tag" ? "mock-tag" : ""));

        getContextParameters.mockReturnValueOnce({
            owner: "owner",
            pullRequest: undefined,
            repository: "repo",
            projectRoot: "mock-root/path",
        } satisfies ContextParameters);

        getGitParameters.mockReturnValueOnce({
            commit: "event-commit-hash",
            parent: ["parent-1", "parent-2"],
            ref: "ref-name",
        } satisfies GitParameters);

        sign.mockReturnValueOnce({
            uploadId: "mock-upload",
            expiration: "2023-06-11 12:00:00",
            signedUrl: "mock-url",
        });

        upload.mockReturnValueOnce(true);

        await run();

        expect(getMultilineInput).toHaveBeenCalledTimes(1);
        expect(getInput).toHaveBeenCalledTimes(1);

        expect(getContextParameters).toHaveBeenCalledTimes(1);
        expect(getGitParameters).toHaveBeenCalledTimes(1);

        expect(sign).toHaveBeenNthCalledWith(1, expect.anything(), resolve(file), {
            commit: "event-commit-hash",
            owner: "owner",
            parent: ["parent-1", "parent-2"],
            provider: "github",
            pullRequest: undefined,
            ref: "ref-name",
            repository: "repo",
            tag: "mock-tag",
            projectRoot: "mock-root/path",
        });
        expect(upload).toHaveBeenNthCalledWith(1, resolve(file), expect.anything(), "mock-url");
    });
});
