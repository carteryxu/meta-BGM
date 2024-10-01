import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

const App = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const[volume, setVolume] = useState(100);
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateDots = (e) => {
            const rect = container.getBounding.ClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const dots = container.querySelectorAll('.dot');
            dots.forEach((dot) => {
                const dotRect = dot.getBoundingClientRect();
                const dotX = dotRect.left + dotRect.width / 2 - rect.left;
                const dotY = dotRect.top + dotRect.height / 2 - rect.top;

                const dx = mouseX - dotX;
                const dy = mouseY - dotY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const maxDistance = 100;
                const scale = Math.max(1, 1 + (1 - Math.min(distance, maxDistance) / maxDistance) * 1.5);
                dot.style.transform = 'scale(${scale})';
            });
        };
        container.addEventListener('mousemove', updateDots);
        return () => container.removeEventListener('mousemove', updateDots);
    }, []);

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        setVolume(Number(e.target.value));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1f1f1f]">
        <div
            ref={containerRef}
            className="relative w-[500px] h-[300px] bg-[rgba(26,26,26,0.8)] rounded-[15px] shadow-[0_0_20px_rgba(255,215,0,0.2)] p-8 overflow-hidden"
        >
            {[...Array(400)].map((_, i) => (
            <div
                key={i}
                className="dot absolute w-[2.5px] h-[2.5px] bg-[#343b3c] rounded-full transition-transform duration-300 ease-in-out"
                style={{
                left: `${(i % 20) * 25}px`,
                top: `${Math.floor(i / 20) * 25}px`,
                }}
            />
            ))}
            <div className="relative z-10">
            <h1 className="text-[#f2c17b] text-4xl font-bold mb-4 font-['Space_Mono'] tracking-wide">
                meta BGM
            </h1>
            <h2 className="text-[#cfd8ef] text-xl mb-8 font-['Space_Mono']">
                endless warm jazz music in the background
            </h2>
            <button
                onClick={togglePlayPause}
                className={`font-['Space_Mono'] text-lg py-2 px-6 border-2 border-[#6c8484] cursor-pointer lowercase tracking-wider transition-all duration-300 ease-in-out ${
                isPlaying
                    ? 'bg-[#6c8484] text-[#1f1f1f]'
                    : 'bg-transparent text-[#f2c17b]'
                }`}
            >
                {isPlaying ? <Pause className="inline-block mr-2" /> : <Play className="inline-block mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
            </button>
            <div className="mt-8">
                <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-[#6c8484] appearance-none outline-none"
                style={{
                    background: `linear-gradient(to right, #f2c17b 0%, #f2c17b ${volume}%, #6c8484 ${volume}%, #6c8484 100%)`,
                }}
                />
                <div className="text-[#cfd8ef] text-sm mt-2 font-['Space_Mono']">
                Volume: {volume}%
                </div>
            </div>
            </div>
        </div>
        </div>
    );
};

export default App;