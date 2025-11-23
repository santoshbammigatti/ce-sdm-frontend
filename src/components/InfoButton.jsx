import { useState, useEffect, useRef } from 'react';

export default function InfoButton({ title, content }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTooltip]);

  return (
    <div ref={tooltipRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="info-button"
        onClick={(e) => {
          e.preventDefault();
          setShowTooltip(!showTooltip);
        }}
        aria-label={title}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>
      {showTooltip && (
        <div className="info-tooltip">
          <div className="info-tooltip-content">
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h4>
            <div>{content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
