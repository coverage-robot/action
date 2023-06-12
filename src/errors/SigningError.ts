class SigningError extends Error {
    static invalidResponseCode(statusCode: number): SigningError {
        return new SigningError(`Invalid status code returned when signing upload: ${statusCode}`);
    }

    static invalidResponseBody(statusCode: number, body: string | null): SigningError {
        return new SigningError(
            `Invalid body returned when signing upload. Status code: ${statusCode}, body: ${body ?? "none returned"}`
        );
    }
}

export { SigningError };
