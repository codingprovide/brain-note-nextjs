"use client";

import React from "react";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BubbleMenu from "@/components/tiptap/BubbleMenu";
import Underline from "@tiptap/extension-underline";
import { Highlight } from "./extensions/HeighLight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { FontSize } from "@/components/tiptap/extensions/FontSize";
import { SlashCommand } from "./extensions/SlashCommand";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { FocusClasses as Focus } from "@tiptap/extension-focus";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Details } from "@tiptap-pro/extension-details";
import { DetailsContent } from "@tiptap-pro/extension-details-content";
import { DetailsSummary } from "@tiptap-pro/extension-details-summary";
import { UniqueID } from "@tiptap-pro/extension-unique-id";
import { isChangeOrigin } from "@tiptap/extension-collaboration";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { BlockquoteFigure } from "./extensions/BlockquoteFigure";
import Emoji, { gitHubEmojis } from "@tiptap-pro/extension-emoji";
import { emojiSuggestion } from "./extensions/EmojiSuggestion";
import { ImageBlock } from "./extensions/ImageBlock";
import { ImageUpload } from "./extensions/ImageUpload";
import { TrailingNode } from "./extensions/TrailingNode";
import { CodeBlock } from "./extensions/CodeBlock";
import { Columns, Column } from "./extensions/MultiColumn";
import { Document } from "./extensions/Document";
const extensions = [
  Document,
  Columns,
  Column,
  CodeBlock,
  TrailingNode,
  ImageBlock,
  ImageUpload,
  Emoji.configure({
    emojis: gitHubEmojis,
    enableEmoticons: true,
    suggestion: emojiSuggestion,
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: "bg-black",
    },
  }),
  TableCell,
  TableHeader,
  TableRow,
  CharacterCount.configure({ limit: 50000 }),
  Focus,
  Placeholder.configure({
    includeChildren: true,
    showOnlyCurrent: false,
    placeholder: () => "",
  }),
  UniqueID.configure({
    types: ["paragraph", "heading", "blockquote", "codeBlock", "table"],
    filterTransaction: (transaction) => !isChangeOrigin(transaction),
  }),
  DetailsSummary,
  DetailsContent,
  Details.configure({
    persist: true,
    HTMLAttributes: {
      class: "details",
    },
  }),
  Superscript,
  Subscript,
  SlashCommand,
  TaskItem.configure({
    nested: true,
  }),
  TaskList,
  StarterKit.configure({
    document: false,
    codeBlock: false,
    blockquote: false,
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  Underline,
  TextStyle.configure({ mergeNestedSpanStyles: true }),
  Color,
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
  Link.configure({
    HTMLAttributes: {
      class: "text-blue-500 underline hover:text-blue-600 cursor-pointer",
    },
    autolink: true,
    defaultProtocol: "https",
    protocols: ["http", "https"],
    isAllowedUri: (url, ctx) => {
      try {
        // construct URL
        const parsedUrl = url.includes(":")
          ? new URL(url)
          : new URL(`${ctx.defaultProtocol}://${url}`);

        // use default validation
        if (!ctx.defaultValidate(parsedUrl.href)) {
          return false;
        }

        // disallowed protocols
        const disallowedProtocols = ["ftp", "file", "mailto"];
        const protocol = parsedUrl.protocol.replace(":", "");

        if (disallowedProtocols.includes(protocol)) {
          return false;
        }

        // only allow protocols specified in ctx.protocols
        const allowedProtocols = ctx.protocols.map((p) =>
          typeof p === "string" ? p : p.scheme
        );

        if (!allowedProtocols.includes(protocol)) {
          return false;
        }

        // disallowed domains
        const disallowedDomains = [
          "example-phishing.com",
          "malicious-site.net",
        ];
        const domain = parsedUrl.hostname;

        if (disallowedDomains.includes(domain)) {
          return false;
        }

        // all checks have passed
        return true;
      } catch {
        return false;
      }
    },
    shouldAutoLink: (url) => {
      try {
        // construct URL
        const parsedUrl = url.includes(":")
          ? new URL(url)
          : new URL(`https://${url}`);

        // only auto-link if the domain is not in the disallowed list
        const disallowedDomains = [
          "example-no-autolink.com",
          "another-no-autolink.com",
        ];
        const domain = parsedUrl.hostname;

        return !disallowedDomains.includes(domain);
      } catch {
        return false;
      }
    },
  }),
  FontSize,
  Highlight.configure({
    multicolor: true,
    HTMLAttributes: { class: "rounded-md px-1 py-0.5 box-decoration-clone" },
  }),
  BlockquoteFigure,
];

export default function Editor({
  className,
  data,
  onContentChange,
}: {
  className: string;
  data: { content: JSONContent | undefined };
  onContentChange: (content: JSONContent) => void;
}) {
  const parsedContent = data.content || "";
  return (
    <EditorProvider
      content={parsedContent}
      onUpdate={({ editor }) => onContentChange(editor.getJSON())}
      slotBefore={<BubbleMenu />}
      extensions={extensions}
      editorProps={{
        attributes: {
          class: className,
        },
      }}
      immediatelyRender={false}
    ></EditorProvider>
  );
}
