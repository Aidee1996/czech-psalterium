import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { WordPosition } from '../types';
import { getManuscripts } from '../utils/dataLoader';

interface ComparisonViewProps {
  psalterData: Record<string, WordPosition[]>;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ psalterData }) => {
  const [selectedPsalm, setSelectedPsalm] = useState<string>('Všechny');
  const [selectedManuscripts, setSelectedManuscripts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const psalms = Object.keys(psalterData);
  const allManuscripts = useMemo(() => {
    const firstWord = psalterData[selectedPsalm]?.[0];
    return firstWord ? Object.keys(firstWord.variants) : [];
  }, [selectedPsalm, psalterData]);

  const handlePsalmChange = (event: SelectChangeEvent) => {
    setSelectedPsalm(event.target.value);
    setSelectedManuscripts([]);
  };

  const handleManuscriptChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedManuscripts(typeof value === 'string' ? value.split(',') : value);
  };

  const getCellStyle = (type: string) => {
    switch (type) {
      case 'autosemantic':
        return { backgroundColor: '#c6efce', fontWeight: 'bold' };
      case 'synsemantic':
        return { backgroundColor: '#ffeb9c', fontStyle: 'italic' };
      case 'identical':
        return { backgroundColor: '#ffffff' };
      default:
        return { backgroundColor: '#f0f0f0' };
    }
  };

  const filteredData = useMemo(() => {
    const data = psalterData[selectedPsalm] || [];
    if (!searchTerm) return data;

    return data.filter((word: WordPosition) =>
      word.latina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.biblpad.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedPsalm, searchTerm, psalterData]);

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Text Comparison View</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Compare manuscript variations with color-coded changes
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Psalm</InputLabel>
              <Select value={selectedPsalm} onChange={handlePsalmChange} label="Psalm">
                {psalms.map((psalm: string) => (
                  <MenuItem key={psalm} value={psalm}>{psalm}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Manuscripts (max 5)</InputLabel>
              <Select
                multiple
                value={selectedManuscripts}
                onChange={handleManuscriptChange}
                label="Select Manuscripts (max 5)"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value: string) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {allManuscripts.map((ms: string) => (
                  <MenuItem
                    key={ms}
                    value={ms}
                    disabled={selectedManuscripts.length >= 5 && !selectedManuscripts.includes(ms)}
                  >
                    {ms}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Latin/BiblPad"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#c6efce', border: '1px solid #999' }} />
            <Typography variant="body2">Autosemantic (big change)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#ffeb9c', border: '1px solid #999' }} />
            <Typography variant="body2">Synsemantic (small change)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: '#ffffff', border: '1px solid #999' }} />
            <Typography variant="body2">Identical (X)</Typography>
          </Box>
        </Box>
      </Paper>

      {selectedManuscripts.length > 0 && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Latin</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>BiblPad (Reference)</TableCell>
                  {selectedManuscripts.map((ms: string) => (
                    <TableCell key={ms} sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>{ms}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.slice(0, 200).map((word: WordPosition, idx: number) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontStyle: 'italic', color: '#666' }}>{word.latina}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{word.biblpad}</TableCell>
                    {selectedManuscripts.map((ms: string) => {
                      const variant = word.variants[ms];
                      return (
                        <TableCell key={ms} sx={getCellStyle(variant.type)}>
                          {variant.value === 'X' ? (
                            <Typography variant="body2" color="text.secondary">X</Typography>
                          ) : (
                            variant.value || '-'
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredData.length > 200 && (
            <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
              Showing first 200 of {filteredData.length} words. Use search to filter results.
            </Typography>
          )}
        </Paper>
      )}

      {selectedManuscripts.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Please select at least one manuscript to compare
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ComparisonView;
