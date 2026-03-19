import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import UnsupportedPage from "../../../src/components/organisms/UnsupportedPage.vue";

describe("UnsupportedPage", () => {
  it("renders the info variant", () => {
    const wrapper = mount(UnsupportedPage);

    const iconBadge = wrapper.findComponent({ name: "IconBadge" });
    expect(iconBadge.props("variant")).toBe("info");
  });

  it("renders a link to quotes.toscrape.com", () => {
    const wrapper = mount(UnsupportedPage);
    const link = wrapper.find("a");

    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("https://quotes.toscrape.com");
    expect(link.attributes("target")).toBe("_blank");
  });

  it("displays the navigation message", () => {
    const wrapper = mount(UnsupportedPage);

    expect(wrapper.text()).toContain("Navigate to");
    expect(wrapper.text()).toContain("quotes.toscrape.com");
  });
});
