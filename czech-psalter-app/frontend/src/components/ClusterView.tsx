import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from '@mui/material';
import * as d3 from 'd3';

type ViewType = 'heatmap' | 'dendrogram' | 'network';

interface ClusterViewProps {
  similarityData: {
    manuscripts: string[];
    similarity_matrix: number[][];
    distance_matrix: number[][];
    linkage_matrix: number[][];
    stats: {
      num_manuscripts: number;
      num_words: number;
    };
  };
}

const ClusterView: React.FC<ClusterViewProps> = ({ similarityData }) => {
  const [viewType, setViewType] = useState<ViewType>('heatmap');
  const heatmapRef = useRef<SVGSVGElement>(null);
  const dendrogramRef = useRef<SVGSVGElement>(null);
  const networkRef = useRef<SVGSVGElement>(null);

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewType | null) => {
    if (newView !== null) {
      setViewType(newView);
    }
  };

  // Render Heatmap
  useEffect(() => {
    if (viewType !== 'heatmap' || !heatmapRef.current) return;

    const svg = d3.select(heatmapRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 150, right: 50, bottom: 50, left: 150 };
    const width = 900 - margin.left - margin.right;
    const height = 900 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const manuscripts = similarityData.manuscripts;
    const matrix = similarityData.similarity_matrix;

    const cellSize = Math.min(width, height) / manuscripts.length;

    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([50, 100]);

    manuscripts.forEach((ms1: string, i: number) => {
      manuscripts.forEach((ms2: string, j: number) => {
        const similarity = matrix[i][j];
        g.append('rect')
          .attr('x', j * cellSize)
          .attr('y', i * cellSize)
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('fill', colorScale(similarity))
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .append('title')
          .text(`${ms1} - ${ms2}: ${similarity.toFixed(2)}%`);
      });
    });

    g.selectAll('.row-label')
      .data(manuscripts)
      .enter()
      .append('text')
      .attr('class', 'row-label')
      .attr('x', -5)
      .attr('y', (_: string, i: number) => i * cellSize + cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '10px')
      .text((d: string) => d);

    g.selectAll('.col-label')
      .data(manuscripts)
      .enter()
      .append('text')
      .attr('class', 'col-label')
      .attr('x', (_: string, i: number) => i * cellSize + cellSize / 2)
      .attr('y', -5)
      .attr('text-anchor', 'start')
      .attr('transform', (_: string, i: number) => `rotate(-45, ${i * cellSize + cellSize / 2}, -5)`)
      .attr('font-size', '10px')
      .text((d: string) => d);

    const legendWidth = 200;
    const legendHeight = 20;
    const legend = g
      .append('g')
      .attr('transform', `translate(${width - legendWidth}, -50)`);

    const legendScale = d3.scaleLinear().domain([50, 100]).range([0, legendWidth]);
    const legendAxis = d3.axisBottom(legendScale).ticks(5).tickFormat((d: d3.NumberValue) => `${d}%`);

    const defs = svg.append('defs');
    const linearGradient = defs
      .append('linearGradient')
      .attr('id', 'similarity-gradient');

    linearGradient
      .selectAll('stop')
      .data(d3.range(50, 101, 1))
      .enter()
      .append('stop')
      .attr('offset', (d: number) => `${((d - 50) / 50) * 100}%`)
      .attr('stop-color', (d: number) => colorScale(d));

    legend
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#similarity-gradient)');

    legend
      .append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis);

    legend
      .append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Similarity (%)');

  }, [viewType, similarityData]);

  useEffect(() => {
    if (viewType !== 'dendrogram' || !dendrogramRef.current) return;

    const svg = d3.select(dendrogramRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 50, right: 200, bottom: 50, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const manuscripts = similarityData.manuscripts;
    const linkageMatrix = similarityData.linkage_matrix;

    const nodes: any[] = manuscripts.map((name: string, i: number) => ({ name, id: i, height: 0 }));

    linkageMatrix.forEach((link: number[], idx: number) => {
      const newNode = {
        name: '',
        id: manuscripts.length + idx,
        height: link[2],
        children: [nodes[link[0]], nodes[link[1]]]
      };
      nodes.push(newNode);
    });

    const root = nodes[nodes.length - 1];
    const cluster = d3.cluster<any>().size([height, width - 100]);
    const tree = cluster(d3.hierarchy(root, (d: any) => d.children));

    g.selectAll('.link')
      .data(tree.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<any, any>()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any)
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-width', 1.5);

    const node = g
      .selectAll('.node')
      .data(tree.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    node
      .append('circle')
      .attr('r', 4)
      .attr('fill', (d: any) => (d.children ? '#555' : '#1976d2'));

    node
      .filter((d: any) => !d.children)
      .append('text')
      .attr('dx', 8)
      .attr('dy', 3)
      .attr('font-size', '11px')
      .text((d: any) => d.data.name);

  }, [viewType, similarityData]);

  useEffect(() => {
    if (viewType !== 'network' || !networkRef.current) return;

    const svg = d3.select(networkRef.current);
    svg.selectAll('*').remove();

    const width = 900;
    const height = 700;
    svg.attr('width', width).attr('height', height);

    const manuscripts = similarityData.manuscripts;
    const matrix = similarityData.similarity_matrix;

    const nodes = manuscripts.map((name: string, i: number) => ({ id: name, index: i }));
    const links: any[] = [];
    const threshold = 95;

    for (let i = 0; i < manuscripts.length; i++) {
      for (let j = i + 1; j < manuscripts.length; j++) {
        const similarity = matrix[i][j];
        if (similarity > threshold) {
          links.push({ source: manuscripts[i], target: manuscripts[j], value: similarity });
        }
      }
    }

    const simulation = d3
      .forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => (d.value - threshold) / 2);

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 8)
      .attr('fill', '#1976d2')
      .call(d3.drag<any, any>()
        .on('start', (event: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', (event: any) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', (event: any) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }));

    const labels = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d: any) => d.id)
      .attr('font-size', '10px')
      .attr('dx', 12)
      .attr('dy', 4);

    node.append('title').text((d: any) => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      labels.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
    });

  }, [viewType, similarityData]);

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Manuscript Clustering & Similarity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize relationships between {similarityData.manuscripts.length} Czech psalter manuscripts
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewChange}
              aria-label="visualization type"
            >
              <ToggleButton value="heatmap">Heatmap</ToggleButton>
              <ToggleButton value="dendrogram">Dendrogram</ToggleButton>
              <ToggleButton value="network">Network</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        {viewType === 'heatmap' && <Box><svg ref={heatmapRef}></svg></Box>}
        {viewType === 'dendrogram' && <Box><svg ref={dendrogramRef}></svg></Box>}
        {viewType === 'network' && <Box><svg ref={networkRef}></svg></Box>}
      </Paper>
    </Box>
  );
};

export default ClusterView;
