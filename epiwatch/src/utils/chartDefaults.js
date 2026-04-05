import React from 'react';
import { Tooltip } from 'recharts';

export const GRID_COLOR = "rgba(0, 0, 0,0.06)";
export const TICK_STYLE = { fill: "#7a8499", fontSize: 11, fontFamily: "DM Sans" };
export const TOOLTIP_STYLE = {
  backgroundColor: "#1a2235",
  border: "1px solid #3b82f6",
  borderRadius: "10px",
  color: "#e8edf5",
};

export const CustomTooltip = (props) => (
  <Tooltip
    {...props}
    contentStyle={TOOLTIP_STYLE}
    itemStyle={{ color: '#e8edf5' }}
    labelStyle={{ color: '#7a8499', marginBottom: '4px' }}
  />
);