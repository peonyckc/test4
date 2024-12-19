import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [isDancing, setIsDancing] = useState(true);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [timer, setTimer] = useState(40);
  const [capybaraStyle, setCapybaraStyle] = useState({});
  const [score, setScore] = useState(0);
  const [capybaraMoveIntervalId, setCapybaraMoveIntervalId] = useState(null);
  const [isPsychedelicActive, setIsPsychedelicActive] = useState(false);
  const [isPrePsychedelicActive, setIsPrePsychedelicActive] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [flipDirection, setFlipDirection] = useState(1);
  const [showVideo, setShowVideo] = useState(false);
  const [videoTimeoutId, setVideoTimeoutId] = useState(null);
  const audioRef = useRef(null);
  const clickSoundRef = useRef(null);

  const requestFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
};

  useEffect(() => {
    if (isGameStarted) {

      setIsPrePsychedelicActive(true);

      const timerId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      const psychedelicTimeoutId = setTimeout(() => {
        setIsPrePsychedelicActive(false);
        setIsPsychedelicActive(true);
      }, 5000);

      const shakeTimeoutId = setTimeout(() => {
        setIsShaking(true);
      }, 15000);

      const videoTimeoutId = setTimeout(() => {
        setShowVideo(true);
      }, (45 - 1) * 1000);

      setVideoTimeoutId(videoTimeoutId);

      return () => {
        clearInterval(timerId);
        clearTimeout(psychedelicTimeoutId);
        clearTimeout(shakeTimeoutId);
        clearTimeout(videoTimeoutId);
      };
    }
  }, [isGameStarted]);

  useEffect(() => {
    if (timer <= 0) {
      setIsGameStarted(false);
      setIsDancing(false);
      setIsMusicOn(false);
      setIsPsychedelicActive(false);
      setIsPrePsychedelicActive(false);
      setIsShaking(false);
      setShowVideo(true);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (capybaraMoveIntervalId) {
        clearInterval(capybaraMoveIntervalId);
      }
      if (videoTimeoutId) {
        clearTimeout(videoTimeoutId);
      }
    }
  }, [timer]);

  const startGame = () => {
    setIsGameStarted(true);
    setTimer(45);
    setScore(0);
    moveCapybara();
    if (audioRef.current) {
      audioRef.current.play();
    }
    requestFullscreen(document.documentElement);
  };

  const toggleMusic = () => {
    setIsMusicOn((prev) => {
      const newStatus = !prev;
      if (audioRef.current && clickSoundRef.current) {
        audioRef.current.muted = !newStatus;
        clickSoundRef.current.muted = !newStatus;
      }
      return newStatus;
    });
  };

  const moveCapybara = () => {
    const randomX = Math.random() * 80;
    const randomY = Math.random() * 80;
    const randomSize = Math.random() * 50 + 50;
    const randomScale = Math.random() * 0.5 + 0.6;

    setFlipDirection((prev) => {
      const newFlipDirection = prev * -1;

      setCapybaraStyle({
        top: `${randomY}vh`,
        left: `${randomX}vw`,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
        transform: `scale(${randomScale})`,
      });

      return newFlipDirection;
    });
  };

  const handleCapybaraClick = () => {
    if (isGameStarted) {
      setScore((prev) => prev + 1);
      moveCapybara();
      if (clickSoundRef.current) {
        clickSoundRef.current.play();
      }

      if (capybaraMoveIntervalId) {
        clearInterval(capybaraMoveIntervalId);
      }
      const newIntervalId = setInterval(() => {
        moveCapybara();
      }, 600);
      setCapybaraMoveIntervalId(newIntervalId);
    }
  };

  return (
    <>
      <Head>
        <title>Capybara Game</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div id="__next" className={`${styles.container} ${isPsychedelicActive ? styles.psychedelicActive : ''} ${isPrePsychedelicActive ? styles.prePsychedelicActive : ''} ${isShaking ? styles.shakingBackground : ''}`}>
        {!isGameStarted && !showVideo && (
          <button className={styles.startButton} onClick={startGame}>
            Start Game
          </button>
        )}
        {isGameStarted && !showVideo && (
          <>
            <button className={styles.musicButton} onClick={toggleMusic}>
              {isMusicOn ? 'Mute' : 'Unmute'}
            </button>
            <div
              className={`${styles.capybara} ${isDancing ? styles.dancing : ''}`}
              style={capybaraStyle}
              onClick={handleCapybaraClick}
            >
              <img
                src="/capybara.png"
                alt="Capybara"
                style={{ 
                  width: '220%', 
                  transform: `scaleX(${flipDirection})`
                }}
              />
            </div>
            <div className={styles.info}>
              Score: {score} | Remaining Time: {timer}s
            </div>
          </>
        )}
        {showVideo && (
          <div className={styles.videoContainer}>
            <video
              width="100%"
              height="100%"
              autoPlay
              preload="auto"
              volume={1}
              playsInline
              disableRemotePlayback
              style={{ objectFit: 'cover' }}
            >
              <source src="/video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        <audio ref={audioRef} src="/song.mp3" loop />
        <audio ref={clickSoundRef} src="/click-sound.mp3" />
      </div>
    </>
  );
}
