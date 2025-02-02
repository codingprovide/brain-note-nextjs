import "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";

export type FontSizeOptions = {
  /**
   * A list of node names where the font size can be applied.
   * @default ['textStyle']
   * @example ['heading', 'paragraph']
   */
  types: string[];
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size.
       * @param fontSize The font size value (number or string without "px").
       * @example editor.commands.setFontSize(16)
       */
      setFontSize: (fontSize: number | string) => ReturnType;
      /**
       * Unset the font size.
       * @example editor.commands.unsetFontSize()
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

/**
 * This extension allows you to set a font size for text.
 * @see https://www.tiptap.dev/api/extensions/font-size
 */
export const FontSize = Extension.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              // Look for a "font-size" style (e.g. "16px") in the inline style attribute.
              const style = element.getAttribute("style") || "";
              const match = style.match(/font-size:\s*([\d.]+)px/);
              return match ? match[1] : null;
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
