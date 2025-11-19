import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import psalterDataRaw from '../data/psalter_data.json';
import manuscriptMetadata from '../data/manuscript_metadata.json';
import { WordPosition, ManuscriptStats } from '../types';
import { decodeOptimizedData, getManuscripts, OptimizedData } from '../utils/dataLoader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const optimizedData = psalterDataRaw as OptimizedData;
const psalterData = decodeOptimizedData(optimizedData);

const StatisticsView: React.FC = () => {
  const stats = useMemo(() => {
    const allPsalms = psalterData['Všechny'] as WordPosition[];
    const manuscripts = getManuscripts(optimizedData, 'Všechny');

    return manuscripts.map(ms => {
      let identicalCount = 0;
      let autosemanticCount = 0;
      let synsemanticCount = 0;
      let otherCount = 0;
      let totalWords = 0;

      allPsalms.forEach(word => {
        const variant = word.variants[ms];
        if (variant.value) {
          totalWords++;
          switch (variant.type) {
            case 'identical':
              identicalCount++;
              break;
            case 'autosemantic':
              autosemanticCount++;
              break;
            case 'synsemantic':
              synsemanticCount++;
              break;
            default:
              otherCount++;
          }
        }
      });

      const variationRate = ((totalWords - identicalCount) / totalWords) * 100;

      return {
        name: ms,
        totalWords,
        identicalCount,
        autosemanticCount,
        synsemanticCount,
        otherCount,
        variationRate,
      } as ManuscriptStats;
    });
  }, []);

  const topVariants = useMemo(() => {
    return [...stats]
      .sort((a, b) => b.variationRate - a.variationRate)
      .slice(0, 10);
  }, [stats]);

  const topConservative = useMemo(() => {
    return [...stats]
      .sort((a, b) => a.variationRate - b.variationRate)
      .slice(0, 10);
  }, [stats]);

  const overallStats = useMemo(() => {
    const total = stats.reduce(
      (acc, curr) => ({
        identical: acc.identical + curr.identicalCount,
        autosemantic: acc.autosemantic + curr.autosemanticCount,
        synsemantic: acc.synsemantic + curr.synsemanticCount,
        other: acc.other + curr.otherCount,
      }),
      { identical: 0, autosemantic: 0, synsemantic: 0, other: 0 }
    );

    return [
      { name: 'Identical (X)', value: total.identical },
      { name: 'Autosemantic', value: total.autosemantic },
      { name: 'Synsemantic', value: total.synsemantic },
      { name: 'Other', value: total.other },
    ];
  }, [stats]);

  const metadata = manuscriptMetadata.metadata as Record<string, any>;

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Manuscript Statistics & Profiles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive analysis of variation patterns across all manuscripts
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Overall Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Overall Change Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {overallStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Variation Rate Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Most Innovative Manuscripts
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVariants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Variation Rate (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="variationRate" fill="#dc004e" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Conservative Manuscripts */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Most Conservative Manuscripts
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topConservative}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Variation Rate (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="variationRate" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Detailed Statistics Table */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Manuscript Profiles
            </Typography>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Abbreviation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      Variation Rate
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      Autosemantic
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      Synsemantic
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      Identical
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats
                    .sort((a, b) => b.variationRate - a.variationRate)
                    .map(stat => {
                      const meta = metadata[stat.name] || {};
                      return (
                        <TableRow key={stat.name} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>{stat.name}</TableCell>
                          <TableCell>{meta.full_name || '-'}</TableCell>
                          <TableCell>{meta.date || '-'}</TableCell>
                          <TableCell>{meta.location || '-'}</TableCell>
                          <TableCell align="right">{stat.variationRate.toFixed(2)}%</TableCell>
                          <TableCell align="right">{stat.autosemanticCount}</TableCell>
                          <TableCell align="right">{stat.synsemanticCount}</TableCell>
                          <TableCell align="right">{stat.identicalCount}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsView;
