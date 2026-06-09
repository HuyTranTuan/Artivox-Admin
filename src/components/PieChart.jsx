import { useTranslate } from "@/i18n/useTranslate";
import React, { useMemo } from "react";

export const PieChart = ({
  data,
  width = 200,
  height = 200,
  innerRadius = 60,
}) => {
  const { t } = useTranslate();

  const slices = useMemo(() => {
    if (!data || data.length === 0) return [];
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    if (total === 0) return [];

    let currentAngle = -Math.PI / 2;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 6;
    const ir = innerRadius || 0;
    const GAP = 0.03; // gap between slices in radians

    return data.map((item) => {
      const pct = (item.value / total) * 100;
      const fullAngle = (item.value / total) * 2 * Math.PI;
      const sliceAngle = Math.max(fullAngle - GAP, 0);
      const startAngle = currentAngle + GAP / 2;
      const endAngle = startAngle + sliceAngle;

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
        pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`;
      } else {
        pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      }

      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = ir > 0 ? (radius + ir) / 2 : radius * 0.65;
      const labelX = cx + labelRadius * Math.cos(midAngle);
      const labelY = cy + labelRadius * Math.sin(midAngle);

      currentAngle += fullAngle;

      return { path: pathData, labelX, labelY, pct: Math.round(pct), ...item };
    });
  }, [data, width, height, innerRadius]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {slices.map((slice) => (
        <g key={slice.name}>
          <path
            d={slice.path}
            fill={slice.color}
            className="transition-opacity hover:opacity-80 cursor-pointer"
          />
          {slice.pct >= 8 && (
            <text
              x={slice.labelX}
              y={slice.labelY}
              textAnchor="middle"
              dy="0.3em"
              fontSize="12"
              fontWeight="600"
              fill="white"
              className="pointer-events-none"
            >
              {slice.pct}%
            </text>
          )}
        </g>
      ))}
      {innerRadius > 0 && (
        <>
          <text
            x={width / 2}
            y={height / 2 - 4}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#94a3bd"
          >{t('dashboard.revenue')}</text>
          <text
            x={width / 2}
            y={height / 2 + 10}
            textAnchor="middle"
            fontSize="12"
            fill="#f59e0b"
          >{t('byType')}</text>
        </>
      )}
    </svg>
  );
};
