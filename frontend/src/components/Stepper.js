import { useTheme } from "../context/ThemeContext";

const STEPS = [
	"Start", "Time Slots", "Subjects", "Labs", "Classrooms", "Review"
];
export default function Stepper({ step }) {
	const { isDark } = useTheme();
	
	return (
		<div className="w-full mb-8">
			<ol className="flex justify-between items-center w-full">
				{STEPS.map((title, i) => {
					const isActive = i === step;
					const isCompleted = i < step;
					return (
						<li key={i} className="flex flex-col items-center relative flex-1">
							{/* Connection line */}
							{i < STEPS.length - 1 && (
								<div className={`absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2 z-0 ${
									isDark ? "bg-slate-600/30" : "bg-slate-400/40"
								}`}>
									<div className={`h-full transition-all duration-300 ${
										isCompleted ? 'bg-cyan-500' : (isDark ? 'bg-slate-600/30' : 'bg-slate-400/40')
									}`} style={{ width: isCompleted ? '100%' : '0%' }}></div>
								</div>
							)}
							
							{/* Step button */}
							<div
								className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
									isActive
										? isDark
											? "border-cyan-500 bg-cyan-600/20 text-cyan-400 shadow-lg shadow-cyan-500/20"
											: "border-cyan-600 bg-cyan-500/20 text-cyan-700 shadow-lg shadow-cyan-500/30"
										: isCompleted
										? isDark
											? "border-cyan-500 bg-cyan-500 text-white"
											: "border-cyan-600 bg-cyan-600 text-white"
										: isDark
											? "border-slate-600/50 bg-slate-800/50 text-slate-400"
											: "border-slate-400/60 bg-slate-200/80 text-slate-600"
								}`}
							>
								{isCompleted ? (
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								) : (
									<span className="text-sm font-semibold">{i + 1}</span>
								)}
							</div>
							
							{/* Step label */}
							<div className="mt-3 text-center">
								<span className={`text-xs sm:text-sm font-medium transition-colors ${
									isActive
										? isDark
											? "text-cyan-400"
											: "text-cyan-700"
										: isCompleted
										? isDark
											? "text-cyan-300"
											: "text-cyan-600"
										: isDark
											? "text-slate-500"
											: "text-slate-600"
								}`}>
									{title}
								</span>
							</div>
						</li>
					);
				})}
			</ol>
		</div>
	);
}