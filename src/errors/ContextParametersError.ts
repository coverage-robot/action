import { getContextParameters } from "@utilities";

class ContextParametersError extends Error {
    static missingParameter(parameter: keyof ReturnType<typeof getContextParameters>): ContextParametersError {
        return new ContextParametersError("Unable to get parameter: " + parameter);
    }

    static missingProjectRoot(): ContextParametersError {
        return new ContextParametersError("Unable to get current project root from context.");
    }
}

export { ContextParametersError };
