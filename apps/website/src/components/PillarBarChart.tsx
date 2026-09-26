import { useEffect, useRef, useMemo } from 'react';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { easeBackOut } from 'd3-ease';
import 'd3-transition';
import type { PillarResult } from '../api/scan';
import { CHART_COLORS, LEVEL_COLORS } from '../constants/colors';

interface PillarBarChartProps {
  pillars: PillarResult[];
  width?: number;
  height?: number;
}

/** Truncate text with ellipsis if exceeds maxLength */
function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function PillarBarChart({ pillars, width = 600, height = 400 }: PillarBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevDataKeyRef = useRef<string | null>(null);

  const dataKey = useMemo(
    () => pillars.map((p) => `${p.pillar}-${p.score}-${p.level_achieved}`).join(','),
    [pillars]
  );

  useEffect(() => {
    if (!svgRef.current) return;
    if (prevDataKeyRef.current === dataKey) return;
    prevDataKeyRef.current = dataKey;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 80, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X scale - pillar names
    const xScale = scaleBand()
      .domain(pillars.map((p) => p.name))
      .range([0, innerWidth])
      .padding(0.3);

    // Y scale - scores
    const yScale = scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // Draw grid lines
    const gridGroup = g.append('g').attr('class', 'grid');

    [20, 40, 60, 80, 100].forEach((tick) => {
      gridGroup
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(tick))
        .attr('y2', yScale(tick))
        .attr('stroke', CHART_COLORS.grid)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0)
        .transition()
        .duration(400)
        .attr('opacity', 0.5);
    });

    // Draw 80% threshold line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(80))
      .attr('y2', yScale(80))
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0)
      .transition()
      .delay(300)
      .duration(400)
      .attr('opacity', 0.7);

    g.append('text')
      .attr('x', innerWidth - 5)
      .attr('y', yScale(80) - 5)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', '#22c55e')
      .attr('opacity', 0)
      .text('80% threshold')
      .transition()
      .delay(500)
      .duration(300)
      .attr('opacity', 1);

    // Draw bars
    const bars = g.selectAll('.bar').data(pillars).enter().append('g').attr('class', 'bar');

    // Background bars
    bars
      .append('rect')
      .attr('x', (d) => xScale(d.name)!)
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', innerHeight)
      .attr('fill', CHART_COLORS.inactive)
      .attr('opacity', 0.3)
      .attr('rx', 4);

    // Actual score bars
    bars
      .append('rect')
      .attr('x', (d) => xScale(d.name)!)
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', (d) => LEVEL_COLORS[d.level_achieved || 0])
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .transition()
      .delay((_, i) => 200 + i * 50)
      .duration(600)
      .ease(easeBackOut.overshoot(1.2))
      .attr('y', (d) => yScale(d.score))
      .attr('height', (d) => innerHeight - yScale(d.score));

    // Icons on top of bars
    bars
      .append('text')
      .attr('x', (d) => xScale(d.name)! + xScale.bandwidth() / 2)
      .attr('y', innerHeight + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('opacity', 0)
      .text((d) => d.icon)
      .transition()
      .delay((_, i) => 400 + i * 50)
      .duration(400)
      .attr('y', (d) => yScale(d.score) - 8)
      .attr('opacity', 1);

    // Score labels
    bars
      .append('text')
      .attr('x', (d) => xScale(d.name)! + xScale.bandwidth() / 2)
      .attr('y', innerHeight)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .attr('opacity', 0)
      .text((d) => `${d.score}%`)
      .transition()
      .delay((_, i) => 500 + i * 50)
      .duration(400)
      .attr('y', (d) => yScale(d.score) + 18)
      .attr('opacity', 1);

    // X axis labels
    const xAxis = g.append('g').attr('transform', `translate(0, ${innerHeight})`);

    pillars.forEach((pillar, i) => {
      const x = xScale(pillar.name)! + xScale.bandwidth() / 2;

      xAxis
        .append('text')
        .attr('x', x)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', CHART_COLORS.text)
        .attr('opacity', 0)
        .text(truncateText(pillar.name, 12))
        .transition()
        .delay(600 + i * 30)
        .duration(300)
        .attr('opacity', 1);

      // Level badge
      xAxis
        .append('text')
        .attr('x', x)
        .attr('y', 42)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('fill', LEVEL_COLORS[pillar.level_achieved || 0])
        .attr('opacity', 0)
        .text(pillar.level_achieved ? `L${pillar.level_achieved}` : '-')
        .transition()
        .delay(700 + i * 30)
        .duration(300)
        .attr('opacity', 1);

      // Checks passed
      xAxis
        .append('text')
        .attr('x', x)
        .attr('y', 56)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', CHART_COLORS.textMuted)
        .attr('opacity', 0)
        .text(`${pillar.checks_passed}/${pillar.checks_total}`)
        .transition()
        .delay(800 + i * 30)
        .duration(300)
        .attr('opacity', 1);
    });

    // Y axis
    const yAxis = g.append('g');

    [0, 25, 50, 75, 100].forEach((tick) => {
      yAxis
        .append('text')
        .attr('x', -10)
        .attr('y', yScale(tick))
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('fill', CHART_COLORS.textMuted)
        .attr('opacity', 0)
        .text(`${tick}%`)
        .transition()
        .delay(200)
        .duration(300)
        .attr('opacity', 1);
    });

    // Hover interaction on bar groups
    bars
      .on('mouseover', function (_event, d) {
        const group = select(this);
        group
          .select('rect:nth-child(2)')
          .transition()
          .duration(150)
          .attr('opacity', 0.8)
          .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))');

        // Tooltip
        const pillar = d as PillarResult;
        const tooltip = svg.append('g').attr('class', 'tooltip');
        const x = xScale(pillar.name)! + margin.left + xScale.bandwidth() / 2;
        const y = margin.top + yScale(pillar.score) - 50;

        tooltip
          .append('rect')
          .attr('x', x - 70)
          .attr('y', y)
          .attr('width', 140)
          .attr('height', 40)
          .attr('rx', 6)
          .attr('fill', CHART_COLORS.textDark)
          .attr('opacity', 0.95);

        tooltip
          .append('text')
          .attr('x', x)
          .attr('y', y + 16)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(`${pillar.icon} ${pillar.name}`);

        tooltip
          .append('text')
          .attr('x', x)
          .attr('y', y + 32)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .text(
            `${pillar.checks_passed}/${pillar.checks_total} checks · ${pillar.level_achieved ? `Level ${pillar.level_achieved}` : 'No level'}`
          );
      })
      .on('mouseout', function () {
        const group = select(this);
        group
          .select('rect:nth-child(2)')
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('filter', null);

        svg.select('.tooltip').remove();
      });
  }, [dataKey, pillars, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="mx-auto"
      role="img"
      aria-label="Bar chart showing score breakdown for each pillar"
    />
  );
}
