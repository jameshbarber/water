import type CommandsModule from "@/modules/commands";
import type { ReadingRecord } from "@/modules/readings";
import type { TriggerRecord } from "./schema";

type MakeCommandsModule = () => CommandsModule;

type Comparator = (readingValue: number, threshold: number) => boolean;

const comparators: Record<TriggerRecord["operation"], Comparator> = {
  ">": (readingValue, threshold) => readingValue > threshold,
  "<": (readingValue, threshold) => readingValue < threshold,
  "==": (readingValue, threshold) => readingValue === threshold,
  "!=": (readingValue, threshold) => readingValue !== threshold,
  ">=": (readingValue, threshold) => readingValue >= threshold,
  "<=": (readingValue, threshold) => readingValue <= threshold,
};

export const makeProcessReadings = (makeCommandsModule: MakeCommandsModule) =>
  async (trigger: TriggerRecord, readings: ReadingRecord[]) => {
    if (!trigger.value || readings.length === 0) {
      return;
    }

    const [reading] = readings;
    const threshold = Number(trigger.value);
    if (!Number.isFinite(threshold)) {
      return;
    }

    const shouldRunCommand = comparators[trigger.operation](Number(reading.value), threshold);
    if (!shouldRunCommand) {
      return;
    }

    const commands = makeCommandsModule();
    await commands.runCommand(trigger.commandId);
  };
