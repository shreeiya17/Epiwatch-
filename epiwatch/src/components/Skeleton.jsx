import React from 'react';

const shimmerStyle = {
  background: 'linear-gradient(90deg, #1a2235 25%, #1f2d45 50%, #1a2235 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite'
};

export const GlobalLoadingBar = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    height: '3px',
    backgroundColor: '#3b82f6',
    zIndex: 9999,
    animation: 'loadingBar 1.5s ease forwards'
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes loadingBar {
        0% { width: 0%; opacity: 1; }
        50% { width: 70%; opacity: 1; }
        90% { width: 90%; opacity: 1; }
        100% { width: 100%; opacity: 0; }
      }
    `}</style>
  </div>
);

export const SkeletonCard = () => (
  <div style={{
    background: '#111827',
    border: '1px solid rgba(0, 0, 0,0.07)',
    borderRadius: '14px',
    padding: '20px',
    overflow: 'hidden',
    position: 'relative'
  }}>
    <div style={{ width: '60%', height: '12px', borderRadius: '4px', marginBottom: '12px', ...shimmerStyle }} />
    <div style={{ width: '80%', height: '32px', borderRadius: '4px', marginBottom: '10px', ...shimmerStyle }} />
    <div style={{ width: '40%', height: '10px', borderRadius: '4px', ...shimmerStyle }} />
  </div>
);

export const SkeletonChart = ({ height = 200 }) => (
  <div style={{
    background: '#111827',
    border: '1px solid rgba(0, 0, 0,0.07)',
    borderRadius: '14px',
    padding: '20px',
    overflow: 'hidden',
    position: 'relative'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ width: '40%', height: '16px', borderRadius: '4px', ...shimmerStyle }} />
      <div style={{ width: '20%', height: '24px', borderRadius: '20px', ...shimmerStyle }} />
    </div>
    <div style={{ width: '100%', height: `${height}px`, borderRadius: '8px', ...shimmerStyle }} />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div style={{
    background: '#111827',
    border: '1px solid rgba(0, 0, 0,0.07)',
    borderRadius: '14px',
    padding: '20px',
    overflow: 'hidden'
  }}>
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} style={{
        display: 'flex', gap: '16px', padding: '12px 0',
        borderBottom: '1px solid rgba(0, 0, 0,0.07)'
      }}>
        {[30, 120, 80, 60, 80, 60].map((w, j) => (
          <div key={j} style={{
            width: `${w}px`, height: '14px', borderRadius: '4px',
            animationDelay: `${i * 0.1}s`,
            ...shimmerStyle
          }} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonMap = () => (
  <div style={{
    height: '500px', 
    borderRadius: '14px', 
    background: '#111827',
    border: '1px solid rgba(0, 0, 0,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shimmerStyle
  }}>
    <span style={{ color: 'rgba(0, 0, 0,0.3)', fontSize: '14px' }}>Loading map data...</span>
  </div>
);
