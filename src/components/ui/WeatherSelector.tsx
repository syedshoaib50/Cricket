import React from 'react';
import { X, Sun, CloudRain, Cloud, Sunset, Moon, Wind, Droplets } from 'lucide-react';
import { WeatherCondition, WeatherType } from '../../types/cricket';
import { WEATHER_PRESETS } from '../../data/teamsAndWeather';

interface WeatherSelectorProps {
  currentWeather: WeatherCondition;
  onSelectWeather: (weather: WeatherCondition) => void;
  onClose: () => void;
}

export const WeatherSelector: React.FC<WeatherSelectorProps> = ({
  currentWeather,
  onSelectWeather,
  onClose,
}) => {
  const weatherIcons: Record<WeatherType, React.ReactNode> = {
    sunny: <Sun className="w-5 h-5 text-amber-400" />,
    overcast: <Cloud className="w-5 h-5 text-slate-300" />,
    rainy: <CloudRain className="w-5 h-5 text-sky-400" />,
    sunset: <Sunset className="w-5 h-5 text-orange-400" />,
    night: <Moon className="w-5 h-5 text-indigo-300" />,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CloudRain className="w-5 h-5 text-sky-400" />
            <span className="text-base font-black text-white uppercase tracking-wider">
              DYNAMIC STADIUM WEATHER & TIME
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Cards */}
        <div className="p-4 flex flex-col gap-2.5">
          {Object.values(WEATHER_PRESETS).map((preset) => {
            const isSelected = currentWeather.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectWeather(preset);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg'
                    : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                    {weatherIcons[preset.id]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      {preset.name}
                      {isSelected && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                          ACTIVE
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-slate-400 max-w-xs">{preset.description}</span>
                  </div>
                </div>

                {/* Atmospheric specs */}
                <div className="flex flex-col items-end text-xs font-mono">
                  <span className="text-amber-300 font-bold">{preset.temperature}</span>
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Droplets className="w-3 h-3 text-sky-400" /> {preset.humidity}%
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Wind className="w-3 h-3 text-slate-400" /> {preset.windSpeed} km/h
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
