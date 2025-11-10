import useGameStore from "@/stores/gameStore";
import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

const SoundLayout = () => {
  const { gameStatus } = useGameStore();
  const audioBgRef = useRef<HTMLAudioElement>(null);
  const audioStartBetRef = useRef<HTMLAudioElement>(null);
  const audioStartGameRef = useRef<HTMLAudioElement>(null);
  const audioDuckRef = useRef<HTMLAudioElement>(null);
  const audioVictoryRef = useRef<HTMLAudioElement>(null);
  const duckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to stop all sounds and intervals
  const stopAllSounds = () => {
    audioBgRef.current?.pause();
    if (audioStartBetRef.current) {
      audioStartBetRef.current.pause();
      audioStartBetRef.current.currentTime = 0;
    }
    if (audioStartGameRef.current) {
      audioStartGameRef.current.pause();
      audioStartGameRef.current.currentTime = 0;
    }
    if (audioDuckRef.current) {
      audioDuckRef.current.pause();
      audioDuckRef.current.currentTime = 0;
    }
    if (audioVictoryRef.current) {
      audioVictoryRef.current.pause();
      audioVictoryRef.current.currentTime = 0;
    }
    if (duckIntervalRef.current) {
      clearInterval(duckIntervalRef.current);
      duckIntervalRef.current = null;
    }
  };

  // Main effect to handle sound changes based on gameStatus
  useEffect(() => {
    const playSound = (audio: HTMLAudioElement | null, volume: number) => {
      if (audio) {
        audio.volume = volume;
        audio.play().catch(err => console.error(`Autoplay failed for ${audio.src}:`, err));
      }
    }

    // Stop all sounds on any state change
    stopAllSounds();

    // Play the sound for the current state
    switch (gameStatus) {
      case "waiting":
        playSound(audioBgRef.current, 0.05);
        break;

      case "betting":
        playSound(audioStartBetRef.current, 0.05);
        break;

      case "racing":
        playSound(audioStartGameRef.current, 0.05);
        duckIntervalRef.current = setInterval(() => {
          playSound(audioDuckRef.current, 0.1);
        }, 4000);
        break;

      case "completed":
        playSound(audioVictoryRef.current, 0.05);
        // Play background music again after victory sound finishes (approx 5s)
        setTimeout(() => {
            // Only play if we are still in the completed state
            if (gameStatus === 'completed') {
                 playSound(audioBgRef.current, 0.05);
            }
        }, 5000);
        break;
        
      default:
        playSound(audioBgRef.current, 0.05);
        break;
    }

    // Cleanup function for when the component unmounts
    return () => {
      stopAllSounds();
    };
  }, [gameStatus]);

  // Effect to handle initial background sound play due to browser autoplay policies
  useEffect(() => {
    const enableAutoplay = () => {
        if (gameStatus === 'waiting' && audioBgRef.current?.paused) {
            audioBgRef.current.play().catch(err => {
                console.error("Initial autoplay failed:", err);
            });
        }
        document.body.removeEventListener('click', enableAutoplay);
    };
    document.body.addEventListener('click', enableAutoplay);
    
    // Attempt to play initially
    setTimeout(() => {
        if (gameStatus === 'waiting' && audioBgRef.current?.paused) {
            audioBgRef.current.play().catch(() => {
                // Fails silently, waits for user interaction
            });
        }
    }, 1000);

    return () => {
        document.body.removeEventListener('click', enableAutoplay);
    }
  }, [gameStatus]);


  return (
    <>
      <Outlet />
      <audio ref={audioBgRef} loop>
        <source src='/Sounds/background-sound.mp3' type='audio/mp3' />
      </audio>
      <audio ref={audioStartGameRef} loop>
        <source src='/Sounds/start-racing-game.mp3' type='audio/mp3' />
      </audio>
      <audio ref={audioDuckRef}>
        <source src='/Sounds/quacking-duck.mp3' type='audio/mp3' />
      </audio>
      <audio ref={audioStartBetRef}>
        <source src='/Sounds/start-bet.mp3' type='audio/mp3' />
      </audio>
      <audio ref={audioVictoryRef}>
        <source src='/Sounds/victory-game.mp3' type='audio/mp3' />
      </audio>
    </>
  );
};
export default SoundLayout;
