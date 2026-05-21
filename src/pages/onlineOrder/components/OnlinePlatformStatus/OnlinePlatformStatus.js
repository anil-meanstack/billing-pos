import React, { useEffect, useState } from "react";
import "./OnlinePlatformStatus.css";

const OnlinePlatformStatus = () => {
    const [open, setOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(null);

    const [platforms, setPlatforms] = useState({
        zomato: {
            status: "online",
            pause_until: null,
        },
        swiggy: {
            status: "offline",
            pause_until: null,
        },
    });

    const isAnyOnline = Object.values(platforms).some(
        (item) => item.status === "online"
    );

    const openPauseModal = (key) => {
        setSelectedPlatform(key);
    };

    const pausePlatform = (minutes) => {
        const now = new Date();
        let pauseUntil;

        if (minutes === "today") {
            pauseUntil = new Date();
            pauseUntil.setHours(23, 59, 59, 999);
        } else {
            pauseUntil = new Date(now.getTime() + minutes * 60000);
        }

        setPlatforms((prev) => ({
            ...prev,
            [selectedPlatform]: {
                status: "offline",
                pause_until: pauseUntil.toISOString(),
            },
        }));

        setSelectedPlatform(null);
    };

    const resumePlatform = (key) => {
        setPlatforms((prev) => ({
            ...prev,
            [key]: {
                status: "online",
                pause_until: null,
            },
        }));
    };

    const makeOffline = (key) => {
        setPlatforms((prev) => ({
            ...prev,
            [key]: {
                status: "offline",
                pause_until: null,
            },
        }));
    };

    const handleToggle = (key) => {
        const currentStatus = platforms[key].status;

        if (currentStatus === "online") {
            openPauseModal(key);
        } else {
            resumePlatform(key);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();

            setPlatforms((prev) => {
                const updated = { ...prev };

                Object.keys(updated).forEach((key) => {
                    if (
                        updated[key].status === "paused" &&
                        updated[key].pause_until &&
                        new Date(updated[key].pause_until) <= now
                    ) {
                        updated[key] = {
                            status: "online",
                            pause_until: null,
                        };
                    }
                });

                return updated;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getStatusText = (platform) => {
        if (platform.status === "online") return "Online";

        if (platform.pause_until) {
            return `Paused till ${new Date(platform.pause_until).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}`;
        }

        return "Offline";
    };

    const renderPlatform = (key, name, logoClass, logoText) => {
        const platform = platforms[key];
        const showTimeOptions = selectedPlatform === key;

        return (
            <div className="platform-card" key={key}>
                <div className="platform-row">
                    <div className="platform-left">
                        <div className={`platform-logo ${logoClass}`}>{logoText}</div>

                        <div>
                            <h4>{name}</h4>
                            <p>{getStatusText(platform)}</p>
                        </div>
                    </div>

                    <div className="two-status-buttons">
                        <button
                            className={`status-btn ${platform.status === "online" ? "active-on" : ""}`}
                            onClick={() => resumePlatform(key)}
                        >
                            ON
                        </button>

                        <button
                            className={`status-btn ${platform.status !== "online" ? "active-off" : ""}`}
                            onClick={() => setSelectedPlatform(showTimeOptions ? null : key)}
                        >
                            OFF
                        </button>
                    </div>
                </div>

                {showTimeOptions && (
                    <div className="inline-pause-box">
                        <p>Select off time for {name}</p>

                        <div className="inline-pause-options">
                            <button onClick={() => pausePlatform(15)}>15 Min</button>
                            <button onClick={() => pausePlatform(30)}>30 Min</button>
                            <button onClick={() => pausePlatform(60)}>1 Hour</button>
                            <button onClick={() => pausePlatform(120)}>2 Hours</button>
                            <button onClick={() => pausePlatform("today")}>Full Day</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <button className="online-nav-icon" onClick={() => setOpen(true)}>
                <i className="bi bi-broadcast"></i>
                <span className={`online-dot ${isAnyOnline ? "active" : ""}`} />
            </button>

            {open && (
                <div className="platform-modal-overlay" onClick={() => setOpen(false)}>
                    <div className="platform-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="platform-modal-header">
                            <div>
                                <h3>Online Platforms</h3>
                                <p>Manage Zomato / Swiggy status</p>
                            </div>

                            <button className="platform-close" onClick={() => setOpen(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        {renderPlatform("zomato", "Zomato", "zomato-logo", "Z")}
                        {renderPlatform("swiggy", "Swiggy", "swiggy-logo", "S")}
                    </div>
                </div>
            )}


        </>
    );
};

export default OnlinePlatformStatus;