import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import LookupButton from "../../../src/components/atoms/LookupButton.vue";

describe("LookupButton", () => {
  it("renders button label when not loading", () => {
    const wrapper = mount(LookupButton, {
      props: { loading: false },
    });

    expect(wrapper.text()).toContain("Get Author Data");
  });

  it("renders spinner when loading", () => {
    const wrapper = mount(LookupButton, {
      props: { loading: true },
    });

    expect(wrapper.find("span.animate-spin").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Get Author Data");
  });

  it("disables the button when loading", () => {
    const wrapper = mount(LookupButton, {
      props: { loading: true },
    });

    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
  });

  it("emits click event when clicked", async () => {
    const wrapper = mount(LookupButton, {
      props: { loading: false },
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });
});
