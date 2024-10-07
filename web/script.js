const { useState, useEffect, useRef } = React;

const App = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const audioContext = useRef(null);
    const playSound = useRef(null);
    const pauseSound = useRef(null);

    useEffect(() => {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        
        // Load play sound
        fetch('/audio/vinylstart.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.current.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                playSound.current = audioBuffer;
            });

        // Load pause sound
        fetch('/audio/vinylstop.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.current.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                pauseSound.current = audioBuffer;
            });
    }, []);

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

                const maxDistance = 40;
                if (distance < maxDistance) {
                    const scale = 1.25 + (maxDistance - distance) / maxDistance * 2;
                    dot.style.transform = `scale(${scale})`;
                    dot.classList.add('active');
                } else {
                    dot.style.transform = 'scale(1)';
                    dot.classList.remove('active');
                }
            });
        };

        container.addEventListener('mousemove', updateDots);
        return () => container.removeEventListener('mousemove', updateDots);
    }, []);

    useEffect(() => {
        const updateContainerSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        updateContainerSize();
        window.addEventListener('resize', updateContainerSize);

        return () => window.removeEventListener('resize', updateContainerSize);
    }, []);

    const playAudioEffect = (buffer) => {
        if (buffer && audioContext.current) {
            const source = audioContext.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.current.destination);
            source.start();
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            playAudioEffect(pauseSound.current);
        } else {
            playAudioEffect(playSound.current);
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        const value = Number(e.target.value);
        setVolume(value);
        
        e.target.style.background = `linear-gradient(to right, var(--text-color) 0%, var(--text-color) ${value}%, var(--bg-color) ${value}%, var(--bg-color) 100%)`;
    };

    const containerStyle = {
        textAlign: 'left',
        padding: '2rem',
        position: 'fixed',
        bottom: '4rem',
        left: '5rem',
        width: '90%',
        height: '300px',
        maxWidth: '500px',
        overflow: 'hidden',
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
        boxShadow: '4px 4px 1px #454f4f',
        width: '120px',  
        height: '45px',
        overflow: 'hidden',
        position: 'relative',
        top: '0',
        left: '0',
    };

    const dotSpacing = 10;
    const dotsPerRow = Math.floor(containerSize.width / dotSpacing);
    const dotsPerColumn = Math.floor(containerSize.height / dotSpacing);
    const totalDots = dotsPerRow * dotsPerColumn;

    return (
        <div className="relative min-h-screen">
            <VinylRecord isPlaying={isPlaying} />
            <div 
                className="container" 
                ref={containerRef} 
                style={{...containerStyle, ...mobileStyle}}
            >
                {[...Array(totalDots)].map((_, i) => (
                    <div
                        key={i}
                        className="dot"
                        style={{
                            left: `${(i % dotsPerRow) * dotSpacing}px`,
                            top: `${Math.floor(i / dotsPerRow) * dotSpacing}px`,
                        }}
                    />
                ))}
                <div className="relative z-10">
                    <h1 className="header">
                        meta BGM
                    </h1>
                    <h2 className="space-mono-regular text-[#cfd8ef] text-xl mb-8">
                        immerse in endless jazz background music
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
                                    background: `linear-gradient(to right, var(--text-color) 0%, var(--text-color) ${volume}%, var(--bg-color) ${volume}%, var(--bg-color) 100%)`,
                                }}
                            />
                            <div id="current-volume-label">
                                 {volume}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VinylRecord = ({ isPlaying }) => {
    return (
        <div 
            className="vinyl-record" 
            style={{ animationPlayState: isPlaying ? 'running' : 'paused'}}
        />
    );
};

ReactDOM.render(<App />, document.getElementById('root'));