import React, { useMemo } from "react";

export const PieChart = ({ data, width = 200, height = 200, innerRadius = 0 }) => {
  const colors = data.map((item) => item.color);

  const slices = useMemo(() => {
    let currentAngle = -Math.PI / 2;
    const sliceWidth = (width - 20) / 2;
    const cx = width / 2;
    const cy = height / 2;
    const radius = sliceWidth;
    const ir = innerRadius || 0;

    return data.map((item) => {
      const sliceAngle = (item.pct / 100) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      let pathData;
      if (ir > 0) {
        const ix1 = cx + ir * Math.cos(startAngle);
        const iy1 = cy + ir * Math.sin(startAngle);
        const ix2 = cx + ir * Math.cos(endAngle);
        const iy2 = cy + ir * Math.sin(endAngle);

        pathData = `
          M ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
          L ${ix2} ${iy2}
          A ${ir} ${ir} 0 ${largeArcFlag} 0 ${ix1} ${iy1}
          Z
        `;
      } else {
        pathData = `
          M ${cx} ${cy}
          L ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
          Z
        `;
      }

      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = (radius + (ir || 0)) / 2;
      const labelX = cx + labelRadius * Math.cos(midAngle);
      const labelY = cy + labelRadius * Math.sin(midAngle);

      currentAngle = endAngle;

      return {
        path: pathData,
        labelX,
        labelY,
        ...item,
      };
    });
  }, [data, width, height, innerRadius]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {slices.map((slice, idx) => (
        <g key={slice.name}>
          <path d={slice.path} fill={slice.color} className="transition-opacity hover:opacity-80 cursor-pointer" />
          {slice.pct >= 8 && (
            <text x={slice.labelX} y={slice.labelY} textAnchor="middle" dy="0.3em" className="text-xs font-semibold fill-white pointer-events-none">
              {slice.pct}%
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};
