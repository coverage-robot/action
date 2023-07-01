import { getInput } from "@actions/core";
import { getOctokit, context } from "@actions/github";
import { GitParametersError } from "@errors";
import { info } from "@actions/core";
import { ContextParameters } from "./getContextParameters";
import { getEnvironmentVariable } from "./getEnvironmentVariable";

export type GitParameters = Awaited<ReturnType<typeof getGitParameters>>;

export const getGitParameters = async ({ owner, repository }: Pick<ContextParameters, "owner" | "repository">) => {
    const commit = context.payload.pull_request?.head.sha || getEnvironmentVariable("GITHUB_SHA");
    const ref = getEnvironmentVariable("GITHUB_HEAD_REF") || getEnvironmentVariable("GITHUB_REF_NAME");

    if (!commit) {
        throw GitParametersError.missingCommit();
    }

    if (!ref) {
        throw GitParametersError.missingRef();
    }

    info(`Inferred reference as ${ref}`);

    const octokit = getOctokit(getInput("github-token"));

    try {
        const {
            data: { parents },
        } = await octokit.rest.git.getCommit({
            owner,
            repo: repository,
            commit_sha: commit,
        });

        const parentCommits = parents.map((parent) => parent.sha);

        info(`Inferred commit as ${commit}, and its parent as ${parentCommits.join(",")}`);

        return { parent: parentCommits, commit, ref };
    } catch (error) {
        throw GitParametersError.missingParentCommit();
    }
};
