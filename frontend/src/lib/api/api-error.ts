import axios from "axios";

/** Shape of the RFC 7807 problem details the API returns for every error. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<ProblemDetails>(error)) {
    if (!error.response) {
      const message =
        error.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : "Can't reach the server. Check that the API is running.";
      return new ApiError(message, 0);
    }

    const { status, data } = error.response;
    const fieldErrors = Object.fromEntries(
      Object.entries(data?.errors ?? {}).map(([field, messages]) => [
        normaliseField(field),
        messages[0],
      ]),
    );

    return new ApiError(data?.detail ?? data?.title ?? defaultMessage(status), status, fieldErrors);
  }

  return new ApiError(error instanceof Error ? error.message : "Something went wrong.", 0);
}

// Model binding errors can come back as "$.price" or "Price", the form fields are camelCase.
function normaliseField(field: string) {
  const name = field.replace(/^\$\./, "");
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function defaultMessage(status: number) {
  switch (status) {
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find what you were looking for.";
    default:
      return "Something went wrong. Please try again.";
  }
}
