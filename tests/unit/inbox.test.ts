import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEMO_MAIL_THREADS, getMessagePreview } from "@/data/inbox-demo";

describe("inbox demo and preview helpers", () => {
  describe("getMessagePreview", () => {
    it("strips standard greeting lines like 'Hi there,' and returns real message body", () => {
      const text =
        "Hi there,\n\nI came across your profile and was really impressed by your background in full-stack TypeScript.";
      assert.equal(
        getMessagePreview(text),
        "I came across your profile and was really impressed by your background in full-stack TypeScript."
      );
    });

    it("strips 'Hey,' and multi-line salutations", () => {
      const text =
        "Hey,\n\nI lead engineering recruiting at Linear. Your recent work on reactive user interfaces caught our eye.";
      assert.equal(
        getMessagePreview(text),
        "I lead engineering recruiting at Linear. Your recent work on reactive user interfaces caught our eye."
      );
    });

    it("strips 'Hi again,' and follow-up greetings", () => {
      const text =
        "Hi again,\n\nJust floating my earlier note back to the top of your inbox. The Merchant Experience team is still hiring.";
      assert.equal(
        getMessagePreview(text),
        "Just floating my earlier note back to the top of your inbox. The Merchant Experience team is still hiring."
      );
    });

    it("strips 'Hello,' or 'Hello there,'", () => {
      const text = "Hello there,\n\nI run hiring for the Editor Experiences group at Notion.";
      assert.equal(getMessagePreview(text), "I run hiring for the Editor Experiences group at Notion.");
    });

    it("handles text without greetings gracefully", () => {
      const text = "We have an open Staff Engineer position that matches your profile.";
      assert.equal(getMessagePreview(text), "We have an open Staff Engineer position that matches your profile.");
    });

    it("handles empty string", () => {
      assert.equal(getMessagePreview(""), "");
    });
  });

  describe("DEMO_MAIL_THREADS variety and quick actions", () => {
    it("provides quickActions for every thread with variety across threads", () => {
      assert.ok(DEMO_MAIL_THREADS.length > 0);

      const actionSets = new Set<string>();

      for (const thread of DEMO_MAIL_THREADS) {
        assert.ok(thread.quickActions && thread.quickActions.length > 0);

        // Every thread should have a Custom reply quick-action button
        const hasCustomReply = thread.quickActions.some((a) => a.kind === "custom-reply");
        assert.equal(hasCustomReply, true);

        // Every thread should have company domain for CompanyLogo resolution
        assert.ok(thread.companyDomain);

        // Fingerprint the action set to verify context-dependent variety
        const signature = thread.quickActions.map((a) => `${a.kind}:${a.label || ""}`).join("|");
        actionSets.add(signature);
      }

      // Assert that switching threads provides distinct context-dependent actions
      assert.ok(actionSets.size > 3);
    });

    it("Linear thread includes career spec link", () => {
      const linearThread = DEMO_MAIL_THREADS.find((t) => t.company === "Linear");
      assert.ok(linearThread);
      const specAction = linearThread?.quickActions?.find((a) => a.kind === "recruiter-link");
      assert.equal(specAction?.url, "https://linear.app/careers");
    });

    it("Figma thread prioritizes availability due to email inquiry", () => {
      const figmaThread = DEMO_MAIL_THREADS.find((t) => t.company === "Figma");
      assert.ok(figmaThread);
      assert.equal(figmaThread?.quickActions?.[0].kind, "availability");
    });
  });
});
