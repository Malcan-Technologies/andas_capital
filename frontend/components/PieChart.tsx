interface PieChartProps {
	borrowed: number;
	repaid: number;
	size?: number;
	theme?: "light" | "dark";
}

export default function PieChart({
	borrowed,
	repaid,
	size = 80,
	theme = "light",
}: PieChartProps) {
	const percentage = borrowed > 0 ? (repaid / borrowed) * 100 : 0;
	const radius = size / 2;
	const strokeWidth = size > 120 ? 18 : 9;
	const innerRadius = radius - strokeWidth;
	const circumference = 2 * Math.PI * innerRadius;
	const strokeDasharray = `${circumference} ${circumference}`;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	const isDark = theme === "dark";

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
				{/* Background circle */}
				<circle
					cx={radius}
					cy={radius}
					r={innerRadius}
					className={`fill-none ${
						isDark ? "stroke-gray-600" : "stroke-gray-200"
					}`}
					strokeWidth={strokeWidth}
				/>
				{/* Progress circle */}
				<circle
					cx={radius}
					cy={radius}
					r={innerRadius}
					className={`fill-none ${
						isDark ? "stroke-blue-600" : "stroke-blue-600"
					}`}
					strokeWidth={strokeWidth}
					strokeDasharray={strokeDasharray}
					strokeDashoffset={strokeDashoffset}
					transform={`rotate(-90 ${radius} ${radius})`}
					strokeLinecap="round"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span
					className={`text-2xl font-bold ${
						isDark ? "text-white" : "text-gray-900"
					}`}
				>
					{Math.round(percentage)}%
				</span>
				<span
					className={`text-xs ${
						isDark ? "text-gray-300" : "text-gray-600"
					}`}
				>
					Repaid
				</span>
			</div>
		</div>
	);
}
