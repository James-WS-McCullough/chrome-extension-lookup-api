import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import IconBadge from "../../../src/components/atoms/IconBadge.vue";

describe("IconBadge", () => {
  it("renders the icon text", () => {
    const wrapper = mount(IconBadge, {
      props: { icon: "!", variant: "error" },
    });

    expect(wrapper.text()).toBe("!");
  });

  it("applies the error variant class", () => {
    const wrapper = mount(IconBadge, {
      props: { icon: "!", variant: "error" },
    });

    expect(wrapper.find(".icon-badge--error").exists()).toBe(true);
  });

  it("applies the info variant class", () => {
    const wrapper = mount(IconBadge, {
      props: { icon: "i", variant: "info" },
    });

    expect(wrapper.find(".icon-badge--info").exists()).toBe(true);
  });
});
