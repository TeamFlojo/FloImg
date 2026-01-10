import { describe, it, expect, beforeEach } from "vitest";
import { getCollectedUsageEvents, clearCollectedUsageEvents } from "../src/floimg/setup.js";

describe("Usage Event Collection", () => {
  beforeEach(() => {
    clearCollectedUsageEvents();
  });

  describe("clearCollectedUsageEvents", () => {
    it("should clear all collected events", () => {
      // First verify we can get events (they might exist from other tests)
      clearCollectedUsageEvents();
      const events = getCollectedUsageEvents();
      expect(events).toHaveLength(0);
    });
  });

  describe("getCollectedUsageEvents", () => {
    it("should return a copy of collected events (not the original array)", () => {
      const events1 = getCollectedUsageEvents();
      const events2 = getCollectedUsageEvents();

      // Should be equal content but different array references
      expect(events1).not.toBe(events2);
      expect(events1).toEqual(events2);
    });

    it("should return empty array after clear", () => {
      clearCollectedUsageEvents();
      const events = getCollectedUsageEvents();
      expect(events).toEqual([]);
    });
  });

  describe("module-level state isolation", () => {
    it("clear and get should work correctly in sequence", () => {
      // This tests the documented sequential execution assumption
      clearCollectedUsageEvents();

      // After clear, should be empty
      expect(getCollectedUsageEvents()).toHaveLength(0);

      // Multiple clears should be safe
      clearCollectedUsageEvents();
      clearCollectedUsageEvents();
      expect(getCollectedUsageEvents()).toHaveLength(0);
    });
  });
});
