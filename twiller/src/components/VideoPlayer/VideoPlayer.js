import { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Replay10Icon from '@mui/icons-material/Replay10';
import Forward10Icon from '@mui/icons-material/Forward10';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';

const VideoPlayer = ({ src, onNextVideo, onShowComments }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const tapTimeout = useRef(null);
    const tapCount = useRef(0);

    const [isPaused, setIsPaused] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFeedback, setShowFeedback] = useState(null);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    const displayFeedback = (type) => {
        setShowFeedback(type);
        setTimeout(() => setShowFeedback(null), 500);
    };

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current?.play();
        } else {
            videoRef.current?.pause();
        }
    };

    const toggleFullscreen = (e) => {
        if (e) e.stopPropagation(); // Prevent triggering the handleTap if called from button
        if (!document.fullscreenElement) {
            playerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleTap = (event) => {
        event.stopPropagation();
        const syntheticEvent = { clientX: event.clientX };
        tapCount.current += 1;

        if (tapTimeout.current) {
            clearTimeout(tapTimeout.current);
        }

        tapTimeout.current = setTimeout(() => {
            const rect = playerRef.current.getBoundingClientRect();
            const tapX = syntheticEvent.clientX - rect.left;
            const third = rect.width / 3;
            let side = 'middle';
            if (tapX < third) side = 'left';
            else if (tapX > third * 2) side = 'right';

            switch (tapCount.current) {
                case 1:
                    if (side === 'middle') togglePlay();
                    break;
                case 2:
                    if (side === 'left') {
                        videoRef.current.currentTime -= 10;
                        displayFeedback('backward');
                    } else if (side === 'right') {
                        videoRef.current.currentTime += 10;
                        displayFeedback('forward');
                    } else { // middle
                        toggleFullscreen();
                    }
                    break;
                case 3:
                    if (side === 'left') onShowComments();
                    else if (side === 'right') setShowCloseConfirm(true);
                    else onNextVideo(); // middle
                    break;
                default: break;
            }
            tapCount.current = 0;
        }, 300);
    };
    
    const handleCloseConfirm = () => {
        window.close();
        setShowCloseConfirm(false);
    };

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        const onPlay = () => setIsPaused(false);
        const onPause = () => setIsPaused(true);
        vid.addEventListener('play', onPlay);
        vid.addEventListener('pause', onPause);
        return () => {
            vid.removeEventListener('play', onPlay);
            vid.removeEventListener('pause', onPause);
        };
    }, []);

    return (
        <>
            <div className="video-player-container" ref={playerRef} onClick={handleTap}>
                <video ref={videoRef} src={src} className="video-element" loop playsInline />
                {isPaused && !showFeedback && (
                    <div className="video-overlay icon-background">
                        <PlayArrowIcon style={{ fontSize: 60 }} />
                    </div>
                )}
                {showFeedback === 'forward' && <div className="video-overlay feedback-icon"><Forward10Icon style={{ fontSize: 60 }} /></div>}
                {showFeedback === 'backward' && <div className="video-overlay feedback-icon"><Replay10Icon style={{ fontSize: 60 }} /></div>}
                
                <div title="Toggle Fullscreen" className="fullscreen-button" onClick={toggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </div>
            </div>
            <ConfirmationDialog
                isOpen={showCloseConfirm}
                onCancel={() => setShowCloseConfirm(false)}
                onConfirm={handleCloseConfirm}
                message="Are you sure you want to close the website?"
            />
        </>
    );
};

export default VideoPlayer;
