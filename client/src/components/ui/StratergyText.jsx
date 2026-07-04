import Markdown from "react-markdown";

const StratergyText = ({ stratergy }) => {
  return (
    <div
      id="output"
      className="prose prose-invert lg:prose-lg max-w-none leading-relaxed text-slate-300"
    >
      <Markdown>{stratergy}</Markdown>
    </div>
  );
};

export default StratergyText;
