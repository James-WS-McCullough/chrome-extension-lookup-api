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

  it("applies the error variant classes", () => {
    const wrapper = mount(IconBadge, {
      props: { icon: "!", variant: "error" },
    });

    const badge = wrapper.find("p");
    expect(badge.classes()).toContain("bg-error-bg");
    expect(badge.classes()).not.toContain("italic");
  });

  it("applies the info variant classes", () => {
    const wrapper = mount(IconBadge, {
      props: { icon: "i", variant: "info" },
    });

    const badge = wrapper.find("p");
    expect(badge.classes()).toContain("bg-blue-900");
    expect(badge.classes()).toContain("italic");
  });
});
