import React, { useState, useEffect } from 'react';

const LiveClock = () => {
  // Initialize state with the current date and time
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Set up an interval to update the time every 1000 milliseconds (1 second)
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup function: clears the interval when the component unmounts
    // This prevents memory leaks if the screen switches away from the monitor
    return () => clearInterval(timerId);
  }, []);

  // Format the time: e.g., "08:34:12 PM"
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Format the date: e.g., "Saturday, March 28, 2026"
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="live-clock-container">
      <div className="clock-time" style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>
        {formattedTime}
      </div>
      <div className="clock-date" style={{ fontSize: '1.2rem', color: '#888', marginTop: '0.25rem' }}>
        {formattedDate}
      </div>
    </div>
  );
};

export default LiveClock;