import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import StatusCard from "../../../src/components/molecules/StatusCard.vue";

describe("StatusCard", () => {
  it("renders the icon badge with correct props", () => {
    const wrapper = mount(StatusCard, {
      props: { icon: "!", variant: "error" },
      slots: { default: "<p>Error occurred</p>" },
    });

    expect(wrapper.find(".icon-badge--error").exists()).toBe(true);
    expect(wrapper.find(".icon-badge").text()).toBe("!");
  });

  it("renders slot content as the message", () => {
    const wrapper = mount(StatusCard, {
      props: { icon: "i", variant: "info" },
      slots: { default: "<p>Navigate to the site</p>" },
    });

    expect(wrapper.text()).toContain("Navigate to the site");
  });

  it("renders inside a base card", () => {
    const wrapper = mount(StatusCard, {
      props: { icon: "!", variant: "error" },
      slots: { default: "<p>Message</p>" },
    });

    expect(wrapper.find(".base-card").exists()).toBe(true);
  });
});
