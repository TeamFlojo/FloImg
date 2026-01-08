/**
 * Tests for fs/filesystem save provider compatibility
 *
 * This is a CRITICAL test file that ensures the filesystem save provider
 * works with both "fs" (SDK/CLI) and "filesystem" (Studio) names.
 *
 * Background: The SDK historically used "fs" while Studio uses "filesystem".
 * Without this compatibility, Studio workflows fail silently when trying to save.
 */
import { describe, it, expect } from "vitest";
import { createClient } from "../src/index.js";
import FsSaveProvider from "../src/providers/save/FsSaveProvider.js";

describe("FsSaveProvider fs/filesystem compatibility", () => {
  describe("FsSaveProvider class", () => {
    it("should have name 'fs'", () => {
      const provider = new FsSaveProvider();
      expect(provider.name).toBe("fs");
    });

    it("should have 'filesystem' as an alias", () => {
      const provider = new FsSaveProvider();
      expect(provider.aliases).toContain("filesystem");
    });
  });

  describe("createClient integration", () => {
    it("should register FsSaveProvider under 'fs' name", () => {
      const client = createClient();
      expect(client.providers.save["fs"]).toBeDefined();
      expect(client.providers.save["fs"].name).toBe("fs");
    });

    it("should register FsSaveProvider under 'filesystem' alias", () => {
      const client = createClient();
      expect(client.providers.save["filesystem"]).toBeDefined();
      expect(client.providers.save["filesystem"].name).toBe("fs");
    });

    it("should have 'fs' and 'filesystem' reference the same provider instance", () => {
      const client = createClient();
      expect(client.providers.save["fs"]).toBe(client.providers.save["filesystem"]);
    });
  });

  describe("SDK usage with 'fs'", () => {
    it("should accept 'fs' as provider name in pipeline", async () => {
      const client = createClient();

      // Verify we can reference the provider by 'fs'
      const provider = client.providers.save["fs"];
      expect(provider).toBeDefined();

      // The actual save would write to disk, so we just verify registration
      expect(provider.name).toBe("fs");
    });
  });

  describe("Studio usage with 'filesystem'", () => {
    it("should accept 'filesystem' as provider name in pipeline", async () => {
      const client = createClient();

      // Verify we can reference the provider by 'filesystem' (Studio's convention)
      const provider = client.providers.save["filesystem"];
      expect(provider).toBeDefined();

      // Should be the same FsSaveProvider, just accessed via alias
      expect(provider.name).toBe("fs");
    });

    it("should work with Studio-style workflow definition", () => {
      const client = createClient();

      // Simulates how Studio builds save steps (always uses "filesystem")
      const studioSaveConfig = {
        provider: "filesystem" as const,
        destination: "./output/image.png",
      };

      // Verify the provider exists when accessed via Studio's convention
      const provider = client.providers.save[studioSaveConfig.provider];
      expect(provider).toBeDefined();
      expect(typeof provider.save).toBe("function");
    });
  });
});
