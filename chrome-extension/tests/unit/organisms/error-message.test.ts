import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ErrorMessage from "../../../src/components/organisms/ErrorMessage.vue";

describe("ErrorMessage", () => {
  it("renders the error message", () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: "Something went wrong" },
    });

    expect(wrapper.text()).toContain("Something went wrong");
  });

  it("uses the error variant", () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: "Error" },
    });

    const iconBadge = wrapper.findComponent({ name: "IconBadge" });
    expect(iconBadge.props("variant")).toBe("error");
  });

  it("renders the exclamation icon", () => {
    const wrapper = mount(ErrorMessage, {
      props: { message: "Error" },
    });

    const iconBadge = wrapper.findComponent({ name: "IconBadge" });
    expect(iconBadge.text()).toBe("!");
  });
});
