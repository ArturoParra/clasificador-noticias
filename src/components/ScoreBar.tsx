interface ScoreBarProps {
  score: number;
  isDarkMode: boolean;
}

export function ScoreBar({ score, isDarkMode }: ScoreBarProps) {
  const getColorClass = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-400 to-green-500';
    if (score >= 40) return 'bg-gradient-to-r from-orange-500 to-yellow-500';
    return 'bg-gradient-to-r from-red-600 to-orange-500';
  };

  return (
    <div className={`w-full h-2.5 rounded-full overflow-hidden ${
      isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
    }`}>
      <div 
        className={`h-full ${getColorClass(score)} transition-all duration-1000 ease-out rounded-full shadow-lg`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}