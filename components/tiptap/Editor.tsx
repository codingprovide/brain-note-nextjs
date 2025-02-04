"use client";

import React from "react";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BubbleMenu from "@/components/tiptap/BubbleMenu";
import Underline from "@tiptap/extension-underline";
// import Highlight from "@tiptap/extension-highlight";
import { Highlight } from "./extensions/HeighLight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { FontSize } from "@/components/tiptap/extensions/FontSize";
import clsx from "clsx";
import { SlashCommand } from "./extensions/SlashCommand";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { FocusClasses as Focus } from "@tiptap/extension-focus";
import { CollaborationCursor } from "@tiptap/extension-collaboration-cursor";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Collaboration } from "@tiptap/extension-collaboration";
import { Emoji, gitHubEmojis } from "@tiptap-pro/extension-emoji";
import { TableOfContents } from "@tiptap-pro/extension-table-of-contents";
import { FileHandler } from "@tiptap-pro/extension-file-handler";
import { Details } from "@tiptap-pro/extension-details";
import { DetailsContent } from "@tiptap-pro/extension-details-content";
import { DetailsSummary } from "@tiptap-pro/extension-details-summary";
import { UniqueID } from "@tiptap-pro/extension-unique-id";
import { isChangeOrigin } from "@tiptap/extension-collaboration";
import { emojiSuggestion } from "@/components/tiptap/extensions/EmojiSuggestion";
import { TableOfContentsNode } from "@/components/tiptap/extensions/TableOfContentsNode";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";

// import DragHandleWrapper from "@/components/tiptap/extensions/DragHandleWrapper";

const extensions = [
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
];

const content = `
<h2>
  Hi there,
</h2>
<p>
  This is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kinds of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
<div data-type="drag_item">
  Drag me!
</div>
`;

export default function Editor({ className }: { className?: string }) {
  return (
    <div className={(clsx("flex items-center justify-center"), className)}>
      <EditorProvider
        slotBefore={<BubbleMenu />}
        extensions={extensions}
        content={content}
        editorProps={{
          attributes: {
            class:
              "prose prose-strong:text-inherit prose-p:m-0 prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none p-5",
          },
        }}
        immediatelyRender={false}
      ></EditorProvider>
    </div>
  );
}
