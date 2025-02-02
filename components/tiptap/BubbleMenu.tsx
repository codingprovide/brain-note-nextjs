"use client";

import { BubbleMenu as TipTapBubbleMenu } from "@tiptap/react";
import { useCurrentEditor } from "@tiptap/react";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Baseline,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Plus,
  Minus,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function BubbleMenu() {
  const containerRef = useRef(null);
  const { editor } = useCurrentEditor();
  const [urlValure, setUrlValue] = useState("");
  const [fontSize, setFontSize] = useState("");
  const [currentSelectionFontSize, setCurrentSelectionFontSize] = useState("");
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        const parentElement = selection.anchorNode.parentElement;
        // 检查 parentElement 是否存在，以及是否在 editor 内部
        if (
          parentElement &&
          editor &&
          editor.view &&
          editor.view.dom.contains(parentElement)
        ) {
          const computedFontSize = window
            .getComputedStyle(parentElement)
            .getPropertyValue("font-size");
          const newFontSize = parseInt(computedFontSize, 10).toString();
          console.log("newFontSize", newFontSize);
          setCurrentSelectionFontSize(newFontSize);
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [editor]);

  if (!editor) return null;

  const increaseFontSize = () => {
    let intFontSize = parseInt(currentSelectionFontSize, 10);
    intFontSize++;
    setCurrentSelectionFontSize(intFontSize.toString());
    editor.commands.setFontSize(intFontSize.toString());
  };

  const decreaseFontSize = () => {
    let intFontSize = parseInt(currentSelectionFontSize, 10);
    intFontSize--;
    setCurrentSelectionFontSize(intFontSize.toString());
    editor.commands.setFontSize(intFontSize.toString());
  };

  const tailwindColors = {
    neutral: ["#f5f5f5", "#d4d4d4", "#737373", "#404040", "#171717"],
    red: ["#fee2e2", "#fca5a5", "#ef4444", "#b91c1c", "#7f1d1d"],
    orange: ["#ffedd5", "#fdba74", "#f97316", "#c2410c", "#7c2d12"],
    yellow: ["#fef9c3", "#fde047", "#eab308", "#a16207", "#713f12"],
    green: ["#dcfce7", "#86efac", "#22c55e", "#15803d", "#14532d"],
    blue: ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"],
    purple: ["#f3e8ff", "#d8b4fe", "#a855f7", "#7e22ce", "#581c87"],
  };

  const BubbleMenuItem = [
    {
      name: "bold",
      command: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      icon: <Bold className="h-5 w-5" />,
    },
    {
      name: "italic",
      command: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      icon: <Italic className="h-5 w-5" />,
    },
    {
      name: "strike",
      command: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
      icon: <Strikethrough className="h-5 w-5" />,
    },
    {
      name: "underline",
      command: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
      icon: <Underline className="h-5 w-5" />,
    },
    {
      name: "text-align-left",
      command: () => editor.chain().focus().setTextAlign("left").run(),
      active: editor.isActive({ textAlign: "left" }),
      icon: <AlignLeft className="h-5 w-5" />,
    },
    {
      name: "text-align-center",
      command: () => editor.chain().focus().setTextAlign("center").run(),
      active: editor.isActive({ textAlign: "center" }),
      icon: <AlignCenter className="h-5 w-5" />,
    },
    {
      name: "text-align-right",
      command: () => editor.chain().focus().setTextAlign("right").run(),
      active: editor.isActive({ textAlign: "right" }),
      icon: <AlignRight className="h-5 w-5 transform rotate-180" />,
    },
    {
      name: "text-align-justify",
      command: () => editor.chain().focus().setTextAlign("justify").run(),
      active: editor.isActive({ textAlign: "justify" }),
      icon: <AlignJustify className="h-5 w-5" />,
    },
  ];

  return (
    <div ref={containerRef}>
      {editor && (
        <TipTapBubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <ToggleGroup
            type="multiple"
            className=" flex bg-white p-2 rounded-lg shadow-xl border border-gray-200 size-max justify-center items-center"
          >
            {BubbleMenuItem.map((item) => (
              <ToggleGroupItem
                key={item.name}
                value={item.name}
                aria-label={`Toggle ${item.name}`}
                className={`p-3 rounded-md hover:bg-gray-200 ${
                  item.active ? "text-blue-400" : ""
                }`}
                onClick={item.command}
              >
                {item.icon}
              </ToggleGroupItem>
            ))}

            <ToggleGroupItem
              value="text-color"
              className="hover:bg-gray-200 p-3 rounded-md"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Baseline className="h-5 w-5" />
                </PopoverTrigger>
                <PopoverContent className="w-auto h-auto p-2 mt-5">
                  <div className="grid grid-cols-5 gap-1 place-items-center">
                    {Object.entries(tailwindColors).map(([colorName, shades]) =>
                      shades.map((shade, index) => (
                        <button
                          key={`${colorName}-${index}`}
                          className=" h-5 w-5 rounded-full border border-gray-300 hover:ring-2 hover:ring-gray-400"
                          style={{ backgroundColor: shade }}
                          onClick={() =>
                            editor.chain().focus().setColor(shade).run()
                          }
                        />
                      ))
                    )}
                  </div>
                  <Button
                    className=" w-full p-0 h-5"
                    onClick={() => editor.chain().focus().unsetColor().run()}
                    variant={"outline"}
                  >
                    default
                  </Button>
                </PopoverContent>
              </Popover>
              {}
            </ToggleGroupItem>

            <ToggleGroupItem
              value="hdight-light-color"
              className="hover:bg-gray-200 p-3 rounded-md"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Highlighter className="h-5 w-5" />
                </PopoverTrigger>
                <PopoverContent className="w-auto h-auto p-2 mt-5">
                  <div className="grid grid-cols-5 gap-1 place-items-center">
                    {Object.entries(tailwindColors).map(([colorName, shades]) =>
                      shades.map((shade, index) => (
                        <button
                          key={`${colorName}-${index}`}
                          className=" h-5 w-5 rounded-full border border-gray-300 hover:ring-2 hover:ring-gray-400"
                          style={{ backgroundColor: shade }}
                          onClick={() =>
                            editor
                              .chain()
                              .focus()
                              .toggleHighlight({ color: shade })
                              .run()
                          }
                        />
                      ))
                    )}
                  </div>
                  <Button
                    className=" w-full p-0 h-5"
                    onClick={() =>
                      editor.chain().focus().unsetHighlight().run()
                    }
                    variant={"outline"}
                  >
                    default
                  </Button>
                </PopoverContent>
              </Popover>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="link"
              className="hover:bg-gray-200 p-3 rounded-md"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Link className="h-5 w-5" />
                </PopoverTrigger>
                <PopoverContent className="w-auto h-auto p-2 mt-5">
                  <div className="grid gap-1">
                    <Input
                      placeholder="https://example.com"
                      className="w-full"
                      onChange={(e) => setUrlValue(e.target.value)}
                    />
                    <Button
                      className=" w-full p-0 h-6 mt-1"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .extendMarkRange("link")
                          .setLink({ href: urlValure })
                          .run()
                      }
                    >
                      set url
                    </Button>
                    <Button
                      className=" w-full p-0 h-6 "
                      onClick={() => editor.chain().focus().unsetLink().run()}
                      variant={"outline"}
                    >
                      remove
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </ToggleGroupItem>

            <ToggleGroupItem value="font-size" className="p-3 rounded-md">
              <Popover>
                <div className="flex items-center">
                  <div
                    className=" hover:bg-gray-200 p-1 rounded-md"
                    onClick={increaseFontSize}
                  >
                    <Plus className="" />
                  </div>
                  <PopoverTrigger asChild>
                    <div className=" border border-gray-300 p-1 px-2 mx-2 rounded-md hover:bg-gray-200">
                      {fontSize || currentSelectionFontSize}
                    </div>
                  </PopoverTrigger>
                  <div
                    className=" hover:bg-gray-200 p-1 rounded-md"
                    onClick={decreaseFontSize}
                  >
                    <Minus className="" />
                  </div>
                </div>
                <PopoverContent className="w-auto h-auto p-2 mt-5">
                  <div className="grid gap-1">
                    <Input
                      placeholder="input font size"
                      className="w-full"
                      onChange={(e) => setFontSize(e.target.value)}
                    />
                    <Button
                      className=" w-full p-0 h-6 mt-1"
                      onClick={() => {
                        if (fontSize) {
                          editor.chain().focus().setFontSize(fontSize).run();
                          setFontSize("");
                        }
                      }}
                    >
                      set font size
                    </Button>
                    <Button
                      className=" w-full p-0 h-6 "
                      onClick={() =>
                        editor.chain().focus().unsetFontSize().run()
                      }
                      variant={"outline"}
                    >
                      remove
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </ToggleGroupItem>
          </ToggleGroup>
        </TipTapBubbleMenu>
      )}
    </div>
  );
}
