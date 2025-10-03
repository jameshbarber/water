import AppError from "@/core/error";

describe("AppError", () => {
  it("creates error with message", () => {
    const error = new AppError("test error");
    expect(error.message).toBe("test error");
    expect(error instanceof Error).toBe(true);
  });

  it("creates error with status code", () => {
    const error = new AppError("not found", 404);
    expect(error.message).toBe("not found");
    expect(error.status).toBe(404);
  });

  it("creates error with error code", () => {
    const error = new AppError("validation failed", 400, "VALIDATION_ERROR");
    expect(error.message).toBe("validation failed");
    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("creates error with details", () => {
    const details = { field: "name", error: "required" };
    const error = new AppError("invalid input", 400, "VALIDATION_ERROR", details);
    expect(error.message).toBe("invalid input");
    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details).toEqual(details);
  });
});
