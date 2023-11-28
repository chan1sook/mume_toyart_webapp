class APIError extends Error {
  constructor(message = "", code = 400, errorId = undefined) {
    super(message);
    this.code = code;
    this.errorId = errorId;
  }
}

export default APIError;

export const APILoginAuthFailedError = new APIError(
  "Invalid Username/Password",
  403,
  1
);

export const APIMissingFormParameterError = new APIError(
  "Missing form parameter(s)",
  400,
  2
);

export const APIAuthRequiredError = new APIError("Auth Required", 401, 3);

export const APIServerNoSessionError = new APIError(
  "Server Session Problem",
  500,
  4
);

export const APIAuthFailedError = new APIError("Auth Failed", 400, 5);

export const APILackPermissionError = new APIError("Lack Permissions", 403, 6);

export const APIMalformedParameterError = new APIError(
  "Malformed Prameter(s)",
  400,
  7
);

export const APINotImplemented = new APIError("Not Implemented Yet", 501, 8);
export const APITargetArtItemNotFound = new APIError(
  "Target Art Item Not Found",
  404,
  9
);

export const APIErrorCodes = Object.freeze({
  1: APILoginAuthFailedError,
  2: APIMissingFormParameterError,
  3: APIAuthRequiredError,
  4: APIServerNoSessionError,
  5: APIAuthFailedError,
  6: APILackPermissionError,
  7: APIMalformedParameterError,
  8: APINotImplemented,
  9: APITargetArtItemNotFound,
});
