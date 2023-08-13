import { upload } from "../upload";
import { HttpClient } from "@actions/http-client";
import { readFileSync } from "fs";
import { UploadError } from "@errors";

describe("Given the upload helper", function () {
    it("uploads using correct fields", async () => {
        const mockResponse = { message: { statusCode: 200 }, readBody: () => "" };
        const put = jest.fn(() => mockResponse);

        const mockHttpClient = {
            put,
        } as unknown as HttpClient;

        const mockFileName = "src/requests/__tests__/fixtures/mock-file.xml";
        const mockFileContent = readFileSync(mockFileName, { encoding: "utf8", flag: "r" });
        const mockSignedUrl = "mock-signed-url.com";

        await expect(upload(mockFileName, mockHttpClient, mockSignedUrl)).resolves.toBe(true);

        expect(put).toHaveBeenCalledWith(mockSignedUrl, mockFileContent);
    });

    it("fails when invalid file is passed", async () => {
        const mockResponse = { message: { statusCode: 200 }, readBody: () => "" };
        const put = jest.fn(() => mockResponse);

        const mockHttpClient = {
            put,
        } as unknown as HttpClient;

        const mockFileName = "invalid-path-for-coverage/lcov.info";
        const mockSignedUrl = "mock-signed-url.com";

        await expect(upload(mockFileName, mockHttpClient, mockSignedUrl)).rejects.toThrow(
            UploadError.fileNotFound(mockFileName),
        );

        expect(put).not.toHaveBeenCalled();
    });

    it("fails when invalid PUT response is returned", async () => {
        const mockResponse = { message: { statusCode: 403 }, readBody: () => "" };
        const put = jest.fn(() => mockResponse);

        const mockHttpClient = {
            put,
        } as unknown as HttpClient;

        const mockFileName = "src/requests/__tests__/fixtures/mock-file.xml";
        const mockFileContent = readFileSync(mockFileName, { encoding: "utf8", flag: "r" });
        const mockSignedUrl = "mock-signed-url.com";

        await expect(upload(mockFileName, mockHttpClient, mockSignedUrl)).rejects.toThrow(
            UploadError.uploadNotSuccessful(403, ""),
        );

        expect(put).toHaveBeenCalledWith(mockSignedUrl, mockFileContent);
    });
});
