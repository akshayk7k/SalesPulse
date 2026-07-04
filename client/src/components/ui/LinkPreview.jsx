const LinkPreview = ({ metadata }) => {
  return (
    <a
      href={metadata.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start p-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900/60 rounded-2xl transition-all w-full"
    >
      {metadata.image && (
        <img
          src={metadata.image}
          alt={metadata.title}
          className="w-10 h-10 min-h-10 min-w-10 object-cover rounded-full overflow-hidden border border-slate-800"
        />
      )}
      <div className="ml-3 text-left">
        <h3 className="text-sm font-semibold text-slate-200 line-clamp-1 hover:text-cyan-400 transition-colors">
          {metadata.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed font-light">{metadata.description}</p>
      </div>
    </a>
  );
};

export default LinkPreview;
