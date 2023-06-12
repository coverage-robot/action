import { getContextParameters } from "../utilities/getContextParameters";

class ContextParametersError extends Error {
    static missingParameter(parameter: keyof ReturnType<typeof getContextParameters>): ContextParametersError {
        return new ContextParametersError("Unable to get parameter: " + parameter);
    }
}

export { ContextParametersError };
