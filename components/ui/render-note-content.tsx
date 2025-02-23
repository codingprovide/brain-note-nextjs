import { useMemo } from "react";
import parse from "html-react-parser";

export default function RenderNodeContent({
  className,
  html,
}: {
  className: string;
  html: string;
}) {
  const parsedContent = useMemo(() => parse(html), [html]);
  return <div className={className}>{parsedContent}</div>;
}
