import { useEffect, useRef, useMemo } from 'react';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { lineRadial, curveLinearClosed } from 'd3-shape';
import { interpolateArray, interpolateNumber } from 'd3-interpolate';
import { easeCubicOut } from 'd3-ease';
import 'd3-transition';
import { CHART_COLORS } from '../constants/colors';

interface RadarChartProps {
  labels: string[];
  values: number[];
  maxValue?: number;
  size?: number;
}

const pillarLabels: Record<string, string> = {
  documentation: 'Docs',
  code_style: 'Style',
  build_system: 'Build',
  testing: 'Test',
  security: 'Security',
  observability: 'Observe',
  environment: 'Env',
  task_discovery: 'Task',
  product: 'Product',
};

export function RadarChart({ labels, values, maxValue = 100, size = 300 }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevDataKeyRef = useRef<string | null>(null);

  const averageScore = useMemo(
    () => (values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0),
    [values]
  );

  const dataKey = useMemo(() => `${labels.join(',')}-${values.join(',')}`, [labels, values]);

  useEffect(() => {
    if (!svgRef.current) return;
    if (prevDataKeyRef.current === dataKey) return;
    prevDataKeyRef.current = dataKey;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = 40;
    const radius = (size - margin * 2) / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const angleSlice = (Math.PI * 2) / labels.length;

    // Create radial scale
    const rScale = scaleLinear().domain([0, maxValue]).range([0, radius]);

    // Grid levels
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

    // Draw grid circles
    const gridGroup = svg.append('g').attr('class', 'grid');

    gridLevels.forEach((level) => {
      gridGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius * level)
        .attr('fill', 'none')
        .attr('stroke', CHART_COLORS.grid)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
    });

    // Draw axes
    const axesGroup = svg.append('g').attr('class', 'axes');

    labels.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      axesGroup
        .append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', centerX + Math.cos(angle) * radius)
        .attr('y2', centerY + Math.sin(angle) * radius)
        .attr('stroke', CHART_COLORS.grid)
        .attr('stroke-width', 1)
        .attr('opacity', 0)
        .transition()
        .delay(100)
        .duration(400)
        .attr('opacity', 1);
    });

    // Create line generator for radar area
    const radarLine = lineRadial<number>()
      .radius((d) => rScale(d))
      .angle((_, i) => i * angleSlice)
      .curve(curveLinearClosed);

    // Draw data area with animation
    const dataGroup = svg.append('g').attr('transform', `translate(${centerX}, ${centerY})`);

    // Start with zero values and animate to actual values
    const zeroValues = values.map(() => 0);

    const areaPath = dataGroup
      .append('path')
      .datum(zeroValues)
      .attr('d', radarLine)
      .attr('fill', CHART_COLORS.primaryLight)
      .attr('stroke', CHART_COLORS.primary)
      .attr('stroke-width', 2);

    // Animate the area
    areaPath
      .transition()
      .duration(800)
      .ease(easeCubicOut)
      .attrTween('d', function () {
        const interpolator = interpolateArray(zeroValues, values);
        return (t: number) => radarLine(interpolator(t)) || '';
      });

    // Draw data points with animation
    const pointsGroup = svg.append('g').attr('class', 'points');

    labels.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const finalValue = Math.min(values[i] || 0, maxValue);

      const point = pointsGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 5)
        .attr('fill', CHART_COLORS.primary)
        .attr('stroke', CHART_COLORS.background)
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');

      // Animate point position
      point
        .transition()
        .delay(200)
        .duration(800)
        .ease(easeCubicOut)
        .attr('cx', centerX + Math.cos(angle) * rScale(finalValue))
        .attr('cy', centerY + Math.sin(angle) * rScale(finalValue));

      // Add hover effect
      point
        .on('mouseover', function () {
          select(this).transition().duration(150).attr('r', 8);
        })
        .on('mouseout', function () {
          select(this).transition().duration(150).attr('r', 5);
        });

      // Add tooltip
      point.append('title').text(`${pillarLabels[labels[i]] || labels[i]}: ${values[i]}%`);
    });

    // Draw labels
    const labelsGroup = svg.append('g').attr('class', 'labels');

    labels.forEach((label, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      const displayLabel = pillarLabels[label] || label;

      labelsGroup
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .attr('fill', CHART_COLORS.text)
        .attr('opacity', 0)
        .text(displayLabel)
        .transition()
        .delay(400 + i * 50)
        .duration(300)
        .attr('opacity', 1);
    });

    // Draw center score
    const centerGroup = svg.append('g').attr('class', 'center');

    centerGroup
      .append('text')
      .attr('x', centerX)
      .attr('y', centerY - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('fill', CHART_COLORS.textDark)
      .attr('opacity', 0)
      .text('0%')
      .transition()
      .delay(300)
      .duration(800)
      .attr('opacity', 1)
      .tween('text', function () {
        const i = interpolateNumber(0, averageScore);
        return function (t: number) {
          select(this).text(`${Math.round(i(t))}%`);
        };
      });

    centerGroup
      .append('text')
      .attr('x', centerX)
      .attr('y', centerY + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', CHART_COLORS.textMuted)
      .attr('opacity', 0)
      .text('Average')
      .transition()
      .delay(500)
      .duration(300)
      .attr('opacity', 1);
  }, [dataKey, labels, values, maxValue, size, averageScore]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className="mx-auto"
      role="img"
      aria-label={`Radar chart showing pillar scores. Average score: ${averageScore}%`}
    />
  );
}
