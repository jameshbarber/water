import { ConsoleLogger } from ".";

const mockDebug = jest.fn();
const mockInfo = jest.fn();
const mockWarn = jest.fn();
const mockError = jest.fn();

// Mock console methods before tests
global.console = {
  ...console,
  debug: mockDebug,
  info: mockInfo,
  warn: mockWarn,
  error: mockError
};

describe("ConsoleLogger", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(ConsoleLogger).toBeDefined();
    });

    it("logs info JSON including message", () => {
        const logger = new ConsoleLogger("debug");
        logger.info("test");
        expect(mockInfo).toHaveBeenCalledTimes(1);
        const payload = String(mockInfo.mock.calls[0][0]);
        expect(payload).toContain('"msg":"test"');
    });

    it("respects level filtering for debug", () => {
        const logger = new ConsoleLogger("info");
        logger.debug("nope");
        expect(mockDebug).not.toHaveBeenCalled();
        logger.setLevel("debug");
        logger.debug("yes");
        expect(mockDebug).toHaveBeenCalled();
    });
}); 