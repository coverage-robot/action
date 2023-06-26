import { context } from "@actions/github";
import { info } from "@actions/core";
import { ContextParametersError, GitParametersError } from "@errors";
import { getEnvironmentVariable } from "./getEnvironmentVariable";
import { getExecOutput } from "@actions/exec";
import { existsSync, lstatSync } from "fs";

export type ContextParameters = Awaited<ReturnType<typeof getContextParameters>>;

export const getContextParameters = () => {
    const { owner, repo: repository } = context.repo;
    const projectRoot = getEnvironmentVariable("GITHUB_WORKSPACE");
    const pullRequest = context.payload.pull_request?.number;

    if (!owner) {
        throw ContextParametersError.missingParameter("owner");
    }

    if (!repository) {
        throw ContextParametersError.missingParameter("repository");
    }

    if (!projectRoot || !existsSync(projectRoot) || !lstatSync(projectRoot).isDirectory()) {
        throw ContextParametersError.missingProjectRoot();
    }

    info(`Inferred owner as ${owner}, in the repository ${repository}. With a project root of ${projectRoot}`);

    return { owner, repository, pullRequest, projectRoot };
};
