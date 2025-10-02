import { NoopLogger } from ".";

const mockInfo = jest.fn();

global.console = {
    ...console,
    info: mockInfo,
};

describe("NoopLogger", () => {
    it("should be defined", () => {
        expect(NoopLogger).toBeDefined();
    });

    it("should not log a message", () => {
        const logger = new NoopLogger();
        logger.info("test");
        expect(mockInfo).not.toHaveBeenCalled();
    });

    it("should not log a message with a level", () => {
        const logger = new NoopLogger();
        logger.info("test");
        expect(mockInfo).not.toHaveBeenCalled();
    });
}); 


