import { sign, SignedUrl } from "../sign";
import { HttpClient } from "@actions/http-client";
import { API_URL } from "../../config";
import { SigningError } from "@errors";
import { Parameters } from "@utilities";

describe("Given the sign helper", function () {
    it("signs request with correct parameters", async () => {
        const mockToken = "mock-token";
        const post = jest.fn(() => ({
            statusCode: 200,
            result: {
                expiration: "2023-06-11 12:00:00",
                signedUrl: "mock-url",
                uploadId: "mock-upload",
            } satisfies SignedUrl,
        }));

        const mockHttpClient = {
            postJson: post,
        } as unknown as HttpClient;

        const mockFileName = "mock-file.xml";
        const mockParameters = {
            commit: "event-commit-hash",
            owner: "owner",
            parent: ["parent-1", "parent-2"],
            provider: "github",
            pullRequest: 1,
            ref: "ref-name",
            repository: "repo",
            tag: "mock-tag",
            projectRoot: "mock-root/path",
        } satisfies Parameters;

        await expect(sign(mockHttpClient, mockFileName, mockParameters, mockToken)).resolves.toEqual({
            expiration: "2023-06-11 12:00:00",
            signedUrl: "mock-url",
            uploadId: "mock-upload",
        } satisfies SignedUrl);

        expect(post).toHaveBeenCalledWith(
            `${API_URL}/upload`,
            {
                data: { ...mockParameters, fileName: mockFileName },
            },
            { Authorization: `Basic ${btoa(mockToken)}` },
        );
    });

    it("fails when receiving non-200 http code response", async () => {
        const mockToken = "mock-token";
        const post = jest.fn(() => ({
            statusCode: 400,
            result: {} as SignedUrl,
        }));

        const mockHttpClient = {
            postJson: post,
        } as unknown as HttpClient;

        const mockFileName = "mock-file.xml";
        const mockParameters = {} as Parameters;

        await expect(sign(mockHttpClient, mockFileName, mockParameters, mockToken)).rejects.toThrow(
            SigningError.invalidResponseCode(400),
        );

        expect(post).toHaveBeenCalledWith(
            `${API_URL}/upload`,
            {
                data: { ...mockParameters, fileName: mockFileName },
            },
            { Authorization: `Basic ${btoa(mockToken)}` },
        );
    });

    it("fails when no result provided", async () => {
        const mockToken = "mock-token";
        const post = jest.fn(() => ({
            statusCode: 200,
        }));

        const mockHttpClient = {
            postJson: post,
        } as unknown as HttpClient;

        const mockFileName = "mock-file.xml";
        const mockParameters = {} as Parameters;

        await expect(sign(mockHttpClient, mockFileName, mockParameters, mockToken)).rejects.toThrow(
            SigningError.invalidResponseBody(200, null),
        );

        expect(post).toHaveBeenCalledWith(
            `${API_URL}/upload`,
            {
                data: { ...mockParameters, fileName: mockFileName },
            },
            { Authorization: `Basic ${btoa(mockToken)}` },
        );
    });

    it("fails when signing result does not match expectation", async () => {
        const mockToken = "mock-token";
        const mockResult = { signedUrl: "", "some-invalid-data": "" };

        const post = jest.fn(() => ({
            statusCode: 200,
            result: mockResult,
        }));

        const mockHttpClient = {
            postJson: post,
        } as unknown as HttpClient;

        const mockFileName = "mock-file.xml";
        const mockParameters = {} as Parameters;

        await expect(sign(mockHttpClient, mockFileName, mockParameters, mockToken)).rejects.toThrow(
            SigningError.invalidResponseBody(200, JSON.stringify(mockResult)),
        );

        expect(post).toHaveBeenCalledWith(
            `${API_URL}/upload`,
            {
                data: { ...mockParameters, fileName: mockFileName },
            },
            { Authorization: `Basic ${btoa(mockToken)}` },
        );
    });
});
