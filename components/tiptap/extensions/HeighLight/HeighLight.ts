import { Highlight as TipTapHighlight } from "@tiptap/extension-highlight";

export const Highlight = TipTapHighlight.extend({
  priority: 300,
  addOptions() {
    return {
      ...this.parent?.(),
      spanning: true,
      excludes: null,
    };
  },
  parseHTML() {
    return [
      {
        tag: "mark",
        getAttrs: (node) => ({
          color: node.style.backgroundColor || "",
        }),
      },
      {
        style: "background-color",
        getAttrs: (value) => ({
          color: value || "",
        }),
      },
    ];
  },
});
