import { Editor, Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
  SuggestionProps,
  SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import tippy, { Instance } from "tippy.js";

import MenuList from "./MenuList";
import { GROUPS } from "./groups";

// 定義單個 slash command 的介面
export interface SlashCommandAction {
  label: string;
  action: (editor: Editor) => void;
  aliases?: string[];
  shouldBeHidden?: (editor: Editor) => boolean;
  isEnabled?: boolean;
}

// 定義 slash command 群組的介面
export interface SlashCommandGroup {
  label: string;
  commands: SlashCommandAction[];
}

// 由於 GROUPS 的型別為 Group[]，與 SlashCommandGroup[] 不完全相同，故先轉換為 unknown，再轉型成 SlashCommandGroup[]
const typedGroups = GROUPS as unknown as SlashCommandGroup[];

const extensionName = "slashCommand";

// popup 為 tippy.js 的實例陣列
let popup: Instance[];

// 直接使用 SuggestionProps 來作為 MenuList 的 props 型別
export type MenuListProps = SuggestionProps;

// 定義 MenuList 元件的 ref 介面
interface MenuListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export const SlashCommand = Extension.create({
  name: extensionName,
  priority: 200,

  onCreate() {
    popup = tippy("body", {
      interactive: true,
      trigger: "manual",
      placement: "bottom-start",
      theme: "slash-command",
      maxWidth: "16rem",
      offset: [16, 8],
      popperOptions: {
        strategy: "fixed",
        modifiers: [
          {
            name: "flip",
            enabled: false,
          },
        ],
      },
    }) as Instance[];
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowSpaces: true,
        startOfLine: true,
        pluginKey: new PluginKey(extensionName),
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const isRootDepth = $from.depth === 1;
          const isParagraph = $from.parent.type.name === "paragraph";
          const isStartOfNode = $from.parent.textContent?.charAt(0) === "/";
          // TODO: 檢查是否在 column 中
          const isInColumn = this.editor.isActive("column");

          const afterContent = $from.parent.textContent?.substring(
            $from.parent.textContent.indexOf("/")
          );
          const isValidAfterContent = !afterContent?.endsWith("  ");

          return (
            ((isRootDepth && isParagraph && isStartOfNode) ||
              (isInColumn && isParagraph && isStartOfNode)) &&
            isValidAfterContent
          );
        },
        command: ({
          editor,
          props,
        }: {
          editor: Editor;
          props: SlashCommandAction;
        }) => {
          const { view, state } = editor;
          const { $head, $from } = view.state.selection;

          const end = $from.pos;
          const from = $head?.nodeBefore
            ? end -
              ($head.nodeBefore.text?.substring(
                $head.nodeBefore.text.indexOf("/")
              ).length ?? 0)
            : $from.start();

          const tr = state.tr.deleteRange(from, end);
          view.dispatch(tr);

          props.action(editor);
          view.focus();
        },
        items: ({ query }: { query: string }) => {
          // 過濾符合查詢條件的指令
          const withFilteredCommands: SlashCommandGroup[] = typedGroups.map(
            (group) => ({
              ...group,
              commands: group.commands
                .filter((item) => {
                  const labelNormalized = item.label.toLowerCase().trim();
                  const queryNormalized = query.toLowerCase().trim();

                  if (item.aliases) {
                    const aliases = item.aliases.map((alias) =>
                      alias.toLowerCase().trim()
                    );
                    return (
                      labelNormalized.includes(queryNormalized) ||
                      aliases.includes(queryNormalized)
                    );
                  }

                  return labelNormalized.includes(queryNormalized);
                })
                .filter((command) =>
                  command.shouldBeHidden
                    ? !command.shouldBeHidden(this.editor)
                    : true
                ),
            })
          );

          // 移除沒有符合條件的群組
          const withoutEmptyGroups = withFilteredCommands.filter(
            (group) => group.commands.length > 0
          );

          // 啟用每個指令
          const withEnabledSettings = withoutEmptyGroups.map((group) => ({
            ...group,
            commands: group.commands.map((command) => ({
              ...command,
              isEnabled: true,
            })),
          }));

          return withEnabledSettings;
        },
        render: () => {
          let component: ReactRenderer<typeof MenuList, MenuListProps> | null =
            null;
          let scrollHandler: (() => void) | null = null;

          // 計算參考元素的位置
          const getReferenceClientRect = (props: SuggestionProps): DOMRect => {
            if (!props.clientRect) {
              return props.editor.storage[extensionName].rect;
            }

            const rect = props.clientRect();

            if (!rect) {
              return props.editor.storage[extensionName].rect;
            }

            let yPos = rect.y;
            const componentHeight =
              (component?.element as HTMLElement)?.offsetHeight || 0;

            if (rect.top + componentHeight + 40 > window.innerHeight) {
              const diff = rect.top + componentHeight - window.innerHeight + 40;
              yPos = rect.y - diff;
            }

            return new DOMRect(rect.x, yPos, rect.width, rect.height);
          };

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer<typeof MenuList, MenuListProps>(
                MenuList,
                {
                  props,
                  editor: props.editor,
                }
              );

              const { view } = props.editor;

              scrollHandler = () => {
                popup?.[0].setProps({
                  getReferenceClientRect: () => getReferenceClientRect(props),
                });
              };

              view.dom.parentElement?.addEventListener("scroll", scrollHandler);

              popup?.[0].setProps({
                getReferenceClientRect: () => getReferenceClientRect(props),
                appendTo: () => document.body,
                content: component.element,
              });

              popup?.[0].show();
            },

            onUpdate(props: SuggestionProps) {
              component?.updateProps(props);

              const { view } = props.editor;
              const updatedGetReferenceClientRect = () =>
                getReferenceClientRect(props);

              view.dom.parentElement?.addEventListener(
                "scroll",
                scrollHandler!
              );

              props.editor.storage[extensionName].rect = props.clientRect
                ? updatedGetReferenceClientRect()
                : new DOMRect(0, 0, 0, 0);

              popup?.[0].setProps({
                getReferenceClientRect: updatedGetReferenceClientRect,
              });
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === "Escape") {
                popup?.[0].hide();
                return true;
              }

              if (!popup?.[0].state.isShown) {
                popup?.[0].show();
              }

              const menuListRef = component?.ref as unknown as
                | MenuListRef
                | undefined;
              if (menuListRef) {
                return menuListRef.onKeyDown(props);
              }
              return false;
            },

            onExit(props: SuggestionProps) {
              popup?.[0].hide();
              if (scrollHandler) {
                const { view } = props.editor;
                view.dom.parentElement?.removeEventListener(
                  "scroll",
                  scrollHandler
                );
              }
              component?.destroy();
              component = null;
            },
          };
        },
      }),
    ];
  },

  addStorage() {
    return {
      rect: new DOMRect(0, 0, 0, 0),
    };
  },
});

export default SlashCommand;
