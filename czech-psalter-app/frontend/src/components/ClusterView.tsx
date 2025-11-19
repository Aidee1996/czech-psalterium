import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
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

  // Calculate similarity statistics
  const analysisData = useMemo(() => {
    const manuscripts = similarityData.manuscripts;
    const matrix = similarityData.similarity_matrix;
    const pairs: { ms1: string; ms2: string; similarity: number }[] = [];

    // Collect all pairs (upper triangle only)
    for (let i = 0; i < manuscripts.length; i++) {
      for (let j = i + 1; j < manuscripts.length; j++) {
        pairs.push({
          ms1: manuscripts[i],
          ms2: manuscripts[j],
          similarity: matrix[i][j]
        });
      }
    }

    // Sort by similarity
    const sortedPairs = [...pairs].sort((a, b) => b.similarity - a.similarity);

    // Calculate statistics
    const avgSimilarity = pairs.reduce((sum, p) => sum + p.similarity, 0) / pairs.length;
    const minSimilarity = Math.min(...pairs.map(p => p.similarity));
    const maxSimilarity = Math.max(...pairs.map(p => p.similarity));

    // Count pairs at different thresholds
    const above95 = pairs.filter(p => p.similarity >= 95).length;
    const above90 = pairs.filter(p => p.similarity >= 90).length;
    const below80 = pairs.filter(p => p.similarity < 80).length;

    // Find clusters (pairs above 98% similarity)
    const clusters: string[][] = [];
    const visited = new Set<string>();

    pairs.filter(p => p.similarity >= 98).forEach(p => {
      if (!visited.has(p.ms1) && !visited.has(p.ms2)) {
        clusters.push([p.ms1, p.ms2]);
        visited.add(p.ms1);
        visited.add(p.ms2);
      } else if (visited.has(p.ms1) && !visited.has(p.ms2)) {
        const cluster = clusters.find(c => c.includes(p.ms1));
        if (cluster) {
          cluster.push(p.ms2);
          visited.add(p.ms2);
        }
      } else if (!visited.has(p.ms1) && visited.has(p.ms2)) {
        const cluster = clusters.find(c => c.includes(p.ms2));
        if (cluster) {
          cluster.push(p.ms1);
          visited.add(p.ms1);
        }
      }
    });

    return {
      topSimilar: sortedPairs.slice(0, 10),
      leastSimilar: sortedPairs.slice(-10).reverse(),
      avgSimilarity,
      minSimilarity,
      maxSimilarity,
      above95,
      above90,
      below80,
      totalPairs: pairs.length,
      clusters
    };
  }, [similarityData]);

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

      {/* Analysis Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>Similarity Statistics</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2">Average: <strong>{analysisData.avgSimilarity.toFixed(2)}%</strong></Typography>
              <Typography variant="body2">Range: {analysisData.minSimilarity.toFixed(2)}% - {analysisData.maxSimilarity.toFixed(2)}%</Typography>
              <Typography variant="body2">Total pairs: {analysisData.totalPairs}</Typography>
              <Typography variant="body2" color="success.main">≥95%: {analysisData.above95} pairs</Typography>
              <Typography variant="body2" color="warning.main">≥90%: {analysisData.above90} pairs</Typography>
              <Typography variant="body2" color="error.main">&lt;80%: {analysisData.below80} pairs</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>Most Similar Pairs</Typography>
            <TableContainer sx={{ maxHeight: 150 }}>
              <Table size="small">
                <TableBody>
                  {analysisData.topSimilar.slice(0, 5).map((pair, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>{pair.ms1} ↔ {pair.ms2}</TableCell>
                      <TableCell align="right" sx={{ py: 0.5, fontSize: '0.75rem', color: 'success.main' }}>{pair.similarity.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>Most Different Pairs</Typography>
            <TableContainer sx={{ maxHeight: 150 }}>
              <Table size="small">
                <TableBody>
                  {analysisData.leastSimilar.slice(0, 5).map((pair, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ py: 0.5, fontSize: '0.75rem' }}>{pair.ms1} ↔ {pair.ms2}</TableCell>
                      <TableCell align="right" sx={{ py: 0.5, fontSize: '0.75rem', color: 'error.main' }}>{pair.similarity.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Clusters */}
      {analysisData.clusters.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            High Similarity Clusters (≥98%)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {analysisData.clusters.map((cluster, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 1 }}>Cluster {idx + 1}:</Typography>
                {cluster.map((ms, i) => (
                  <Chip key={ms} label={ms} size="small" color={i === 0 ? 'primary' : 'default'} />
                ))}
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Paper elevation={2} sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        {viewType === 'heatmap' && <Box><svg ref={heatmapRef}></svg></Box>}
        {viewType === 'dendrogram' && <Box><svg ref={dendrogramRef}></svg></Box>}
        {viewType === 'network' && <Box><svg ref={networkRef}></svg></Box>}
      </Paper>
    </Box>
  );
};

export default ClusterView;
