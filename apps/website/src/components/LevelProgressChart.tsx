import { useEffect, useRef, useMemo } from 'react';
import { select } from 'd3-selection';
import { scalePoint } from 'd3-scale';
import { easeBackOut } from 'd3-ease';
import { interpolateNumber } from 'd3-interpolate';
import 'd3-transition';
import { CHART_COLORS, LEVEL_COLORS, LEVEL_NAMES } from '../constants/colors';

interface LevelProgress {
  level: number;
  achieved: boolean;
  score: number;
}

interface LevelProgressChartProps {
  data: LevelProgress[];
  width?: number;
  height?: number;
}

export function LevelProgressChart({ data, width = 600, height = 120 }: LevelProgressChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevDataKeyRef = useRef<string | null>(null);

  const dataKey = useMemo(
    () => data.map((d) => `${d.level}-${d.achieved}-${d.score}`).join(','),
    [data]
  );

  useEffect(() => {
    if (!svgRef.current) return;
    if (prevDataKeyRef.current === dataKey) return;
    prevDataKeyRef.current = dataKey;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 40, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X scale for levels
    const xScale = scalePoint<number>()
      .domain(data.map((d) => d.level))
      .range([0, innerWidth])
      .padding(0.5);

    // Draw connecting line
    const lineData = data.map((d) => xScale(d.level)!);

    g.append('line')
      .attr('x1', lineData[0])
      .attr('y1', innerHeight / 2)
      .attr('x2', lineData[0])
      .attr('y2', innerHeight / 2)
      .attr('stroke', CHART_COLORS.line)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .transition()
      .duration(600)
      .attr('x2', lineData[lineData.length - 1]);

    // Draw level circles
    const levelGroups = g
      .selectAll('.level-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'level-group')
      .attr('transform', (d) => `translate(${xScale(d.level)}, ${innerHeight / 2})`);

    // Background circles (always visible)
    levelGroups
      .append('circle')
      .attr('r', 0)
      .attr('fill', (d) => (d.achieved ? LEVEL_COLORS[d.level] : CHART_COLORS.inactive))
      .attr('stroke', (d) => (d.achieved ? LEVEL_COLORS[d.level] : CHART_COLORS.line))
      .attr('stroke-width', 3)
      .transition()
      .delay((_, i) => 200 + i * 100)
      .duration(400)
      .ease(easeBackOut.overshoot(1.7))
      .attr('r', 24);

    // Level text (L1, L2, etc.)
    levelGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', (d) => (d.achieved ? 'white' : CHART_COLORS.textMuted))
      .attr('opacity', 0)
      .text((d) => `L${d.level}`)
      .transition()
      .delay((_, i) => 400 + i * 100)
      .duration(300)
      .attr('opacity', 1);

    // Checkmark for achieved levels
    levelGroups
      .filter((d) => d.achieved)
      .append('text')
      .attr('x', 16)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', LEVEL_COLORS[5])
      .attr('opacity', 0)
      .text('✓')
      .transition()
      .delay((_, i) => 600 + i * 100)
      .duration(300)
      .attr('opacity', 1);

    // Score percentage below
    levelGroups
      .append('text')
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', CHART_COLORS.textMuted)
      .attr('opacity', 0)
      .text('0%')
      .transition()
      .delay((_, i) => 500 + i * 100)
      .duration(500)
      .attr('opacity', 1)
      .tween('text', function (d) {
        const i = interpolateNumber(0, d.score);
        return function (t: number) {
          select(this).text(`${Math.round(i(t))}%`);
        };
      });

    // Level name above
    levelGroups
      .append('text')
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', CHART_COLORS.text)
      .attr('opacity', 0)
      .text((d) => LEVEL_NAMES[d.level])
      .transition()
      .delay((_, i) => 700 + i * 100)
      .duration(300)
      .attr('opacity', 1);

    // Add hover interactivity
    levelGroups
      .on('mouseover', function (_event, d) {
        select(this)
          .select('circle')
          .transition()
          .duration(150)
          .attr('r', 28)
          .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))');

        // Show tooltip
        const tooltip = svg.append('g').attr('class', 'tooltip');

        tooltip
          .append('rect')
          .attr('x', xScale(d.level)! + margin.left - 60)
          .attr('y', margin.top + innerHeight / 2 + 60)
          .attr('width', 120)
          .attr('height', 30)
          .attr('rx', 4)
          .attr('fill', CHART_COLORS.textDark)
          .attr('opacity', 0.9);

        tooltip
          .append('text')
          .attr('x', xScale(d.level)! + margin.left)
          .attr('y', margin.top + innerHeight / 2 + 80)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .text(d.achieved ? `Achieved at ${d.score}%` : `Need 80%, at ${d.score}%`);
      })
      .on('mouseout', function () {
        select(this).select('circle').transition().duration(150).attr('r', 24).attr('filter', null);

        svg.select('.tooltip').remove();
      });
  }, [dataKey, data, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="mx-auto"
      role="img"
      aria-label="Level progress visualization showing achievement status for each maturity level"
    />
  );
}
