class GitParametersError extends Error {
    static missingParentCommit(): GitParametersError {
        return new GitParametersError("Unable to get parent commit from git history.");
    }

    static missingCommit(): GitParametersError {
        return new GitParametersError("Unable to get current commit from git history.");
    }

    static missingRef(): GitParametersError {
        return new GitParametersError("Unable to get current ref from git context.");
    }
}

export { GitParametersError };
