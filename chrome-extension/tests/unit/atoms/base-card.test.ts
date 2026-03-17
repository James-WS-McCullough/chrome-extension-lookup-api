import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BaseCard from "../../../src/components/atoms/BaseCard.vue";

describe("BaseCard", () => {
  it("renders slot content inside the card wrapper", () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: "<p>Card content</p>",
      },
    });

    expect(wrapper.find(".base-card").exists()).toBe(true);
    expect(wrapper.text()).toContain("Card content");
  });

  it("renders multiple slot elements", () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: "<h2>Title</h2><p>Body</p>",
      },
    });

    expect(wrapper.find("h2").text()).toBe("Title");
    expect(wrapper.find("p").text()).toBe("Body");
  });
});
