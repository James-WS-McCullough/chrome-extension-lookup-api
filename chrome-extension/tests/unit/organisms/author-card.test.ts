import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AuthorCard from "../../../src/components/organisms/AuthorCard.vue";

const mockData = {
  author: "albert einstein",
  profile: {
    category: "Science & Philosophy",
    personaTags: ["deep-thoughts"],
    difficulty: "medium",
  },
  recommendedActions: ["Highlight key assumptions"],
  integrationHints: {
    preferredAuth: "API key",
    rateLimitPerMinute: 60,
    notes: "Use caching",
  },
  samplePayloads: [{ type: "insight", title: "Reduce complexity", value: "Start minimal." }],
};

describe("AuthorCard", () => {
  it("renders the title-cased author name", () => {
    const wrapper = mount(AuthorCard, { props: { data: mockData } });

    expect(wrapper.find("h2").text()).toBe("Albert Einstein");
  });

  it("renders category, difficulty, and rate limit", () => {
    const wrapper = mount(AuthorCard, { props: { data: mockData } });
    const text = wrapper.text();

    expect(text).toContain("Science & Philosophy");
    expect(text).toContain("medium");
    expect(text).toContain("60 req/min");
  });

  it("emits refresh when the refresh button is clicked", async () => {
    const wrapper = mount(AuthorCard, { props: { data: mockData } });

    await wrapper.find(".refresh-btn").trigger("click");
    expect(wrapper.emitted("refresh")).toHaveLength(1);
  });

  it("renders inside a base card", () => {
    const wrapper = mount(AuthorCard, { props: { data: mockData } });

    expect(wrapper.find(".base-card").exists()).toBe(true);
  });
});
