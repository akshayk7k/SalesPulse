function ProgressBar({ label, value }) {
  const safeValue = isNaN(value) || value === null || value === undefined ? 0 : value;
  return (
    <div className="w-full space-y-2 mt-5">
      {/* Label */}
      {label && (
        <div className="flex justify-between items-center text-sm font-medium text-slate-300">
          <span>{label}</span>
          <span className="text-cyan-400 font-semibold">{safeValue}%</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${safeValue}%`, // Dynamically set width based on the value
            background: `linear-gradient(to right, #06b6d4, #6366f1)`, // Gradient for the fill
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
