import parse from "html-react-parser";

export default function RenderNodeContent({
  className,
  html,
}: {
  className: string;
  html: string;
}) {
  return <div className={className}>{parse(html)}</div>;
}
