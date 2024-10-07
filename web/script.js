const { useState, useEffect, useRef } = React;

const App = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateDots = (e) => {
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const dots = container.querySelectorAll('.dot');
            dots.forEach((dot) => {
                const dotRect = dot.getBoundingClientRect();
                const dotX = dotRect.left + dotRect.width / 2 - rect.left;
                const dotY = dotRect.top + dotRect.height / 2 - rect.top;

                const dx = mouseX - dotX;
                const dy = mouseY - dotY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const maxDistance = 100;
                if (distance < maxDistance) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
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

    const containerStyle = {
        textAlign: 'left',
        padding: '2rem',
        position: 'fixed',
        bottom: '4rem',
        left: '5rem',
        width: '90%',
        maxWidth: '500px',
    };

    const mobileStyle = window.matchMedia('(max-width: 600px)').matches
        ? {
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              width: 'calc(100% - 2rem)',
              maxWidth: 'none',
          }
        : {};

    const buttonStyle = {
        fontFamily: "'Space Mono', monospace",
        textAlign: 'center',
        fontSize: '1.2rem',
        padding: '0px',
        backgroundColor: 'transparent',
        color: 'var(--text-color)',
        border: '3px solid var(--accent-color)',
        cursor: 'pointer',
        textTransform: 'lowercase',
        letterSpacing: '0.1em',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '120px',  
        height: '45px',  
    };

    return (
        <div 
            className="container" 
            ref={containerRef} 
            style={{...containerStyle, ...mobileStyle}}
        >
            {[...Array(400)].map((_, i) => (
                <div
                    key={i}
                    className="dot"
                    style={{
                        left: `${(i % 20) * 25}px`,
                        top: `${Math.floor(i / 20) * 25}px`,
                    }}
                />
            ))}
            <div className="relative z-10">
                <h1 className="header">
                    meta BGM
                </h1>
                <h2 className="space-mono-regular text-[#cfd8ef] text-xl mb-8">
                    endless warm jazz music in the background
                </h2>
                <div className="button">
                    <button
                        onClick={togglePlayPause}
                        style={{
                            ...buttonStyle,
                            backgroundColor: isPlaying ? 'var(--accent-color)' : 'transparent',
                            color: isPlaying ? 'var(--bg-color)' : 'var(--text-color)',
                        }}
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                </div>
                <div className="volume-bar">
                    <div id="volume-slider-container">
                        <input
                            id="volume-slider"
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            style={{
                                background: `linear-gradient(to right, #f2c17b 0%, #f2c17b ${volume}%, #6c8484 ${volume}%, #6c8484 100%)`,
                            }}
                        />
                        <div id="current-volume-label">
                            Volume: {volume}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));