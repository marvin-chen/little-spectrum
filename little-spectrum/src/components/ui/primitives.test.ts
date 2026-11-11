import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button, IconButton } from "./Button";
import { Field, TextInput } from "./Field";
import { ChoiceGroup } from "./ChoiceGroup";
import { Feedback } from "./Feedback";
import { ShareButton } from "./ShareButton";

describe("shared control semantics", () => {
  it("renders a copy invite link button", () => {
    const html = render(h(ShareButton, { url: "https://example.com/join/abc" }));
    expect(html).toContain("Copy invite link");
  });
  it("prevents accidental form submission and duplicate pending actions", () => {
    expect(render(h(Button, {}, "Save"))).toContain('type="button"');
    const pending = render(h(Button, { loading: true, type: "submit" }, "Saving"));
    expect(pending).toContain('disabled=""');
    expect(pending).toContain('aria-busy="true"');
    expect(pending).toContain('type="submit"');
    expect(pending).toContain("Saving");
  });
  it("names icon-only actions", () => {
    expect(render(h(IconButton, { label: "Close preview", icon: h("svg", { "aria-hidden": true }) }))).toContain('aria-label="Close preview"');
  });
  it("preserves field IDs and descriptions while associating hints and errors", () => {
    const html = render(h(Field, {
      label: "Email", hint: "Use your own email.", error: "Enter a valid email.",
      children: h(TextInput, { id: "email", "aria-describedby": "privacy", name: "email" }),
    }));
    expect(html).toContain('for="email"');
    expect(html).toContain('aria-describedby="privacy email-hint email-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('id="email-error" role="alert"');
  });
  it("does not mark healthy fields invalid or reference missing help", () => {
    const html = render(h(Field, { label: "Name", children: h(TextInput, { id: "name" }) }));
    expect(html).not.toContain("aria-invalid=");
    expect(html).not.toContain("aria-describedby=");
  });
  it("announces errors urgently and ordinary updates politely", () => {
    expect(render(h(Feedback, { tone: "error", children: "Try again" }))).toContain('role="alert"');
    expect(render(h(Feedback, { tone: "success", children: "Saved" }))).toContain('role="status"');
  });
});

describe("choice groups", () => {
  it("keeps two groups independent and preserves selected and disabled states", () => {
    const options = [{ value: "one", label: "One" }, { value: "two", label: "Two", disabled: true }];
    const html = render(h("div", {},
      h(ChoiceGroup, { label: "Answer", value: "one", options, onChange: () => {} }),
      h(ChoiceGroup, { label: "Prediction", value: null, options, onChange: () => {} }),
    ));
    const names = [...html.matchAll(/name="([^"]+)"/g)].map((match) => match[1]);
    expect(names).toHaveLength(4);
    expect(names[0]).toBe(names[1]);
    expect(names[0]).not.toBe(names[2]);
    expect(html.match(/checked=""/g)).toHaveLength(1);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Answer"');
    expect(html).toContain('aria-label="Prediction"');
  });
});
