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
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { WordPosition } from '../types';

interface VerseData {
  [verseId: string]: {
    latina: string;
    translations: Record<string, string>;
  };
}

interface ComparisonViewProps {
  psalterData: Record<string, WordPosition[]>;
  verseData: VerseData | null;
}

type ViewMode = 'words' | 'verses';

// Manuscript info for older psalters
const OLDER_PSALTERS = {
  'Witt': { name: 'Žaltář wittenberský', period: '14. stol.', type: 'older' },
  'Klem': { name: 'Žaltář klementinský', period: '14. stol.', type: 'older' },
  'Kap': { name: 'Žaltář kapitulní', period: '14. stol.', type: 'older' },
  'Poděbr': { name: 'Žaltář poděbradský', period: '15. stol.', type: 'older' },
  'Bosk': { name: 'Bible boskovická', period: '1415-1430', type: 'bible' },
  'Pad': { name: 'Bible padeřovská', period: '1430-1435', type: 'bible' },
  'PTZ': { name: 'První tištěný žaltář', period: '1487', type: 'print' },
  'Bak': { name: 'Žaltář Bakalářův', period: '1504', type: 'print' },
};

const ComparisonView: React.FC<ComparisonViewProps> = ({ psalterData, verseData }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('verses');
  const [verseExpanded, setVerseExpanded] = useState<boolean>(false);
  const [selectedVerse, setSelectedVerse] = useState<string>('Ps 6,2');
  const [selectedManuscripts, setSelectedManuscripts] = useState<string[]>([]);
  const [selectedOlderPsalters, setSelectedOlderPsalters] = useState<string[]>(['Witt', 'Klem', 'Poděbr', 'PTZ']);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const verses = verseData ? Object.keys(verseData).sort((a, b) => {
    const numA = parseInt(a.split(',')[1]);
    const numB = parseInt(b.split(',')[1]);
    return numA - numB;
  }) : [];

  // Use 'Všechny' sheet for word-by-word view (contains Psalm 6 data)
  const allManuscripts = useMemo(() => {
    const firstWord = psalterData['Všechny']?.[0];
    return firstWord ? Object.keys(firstWord.variants) : [];
  }, [psalterData]);

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
      if (newMode === 'verses') {
        setVerseExpanded(false);
      }
    }
  };

  const handleVerseChange = (event: SelectChangeEvent) => {
    setSelectedVerse(event.target.value);
  };

  const toggleVerseExpanded = () => {
    setVerseExpanded(!verseExpanded);
  };

  const handleManuscriptChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedManuscripts(typeof value === 'string' ? value.split(',') : value);
  };

  const handleOlderPsalterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedOlderPsalters(typeof value === 'string' ? value.split(',') : value);
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
    // Use 'Všechny' sheet (Psalm 6 data) and sort by Latin
    const data = psalterData['Všechny'] || [];

    // Sort by latin text
    const sortedData = [...data].sort((a, b) =>
      a.latina.localeCompare(b.latina, 'cs')
    );

    if (!searchTerm) return sortedData;

    return sortedData.filter((word: WordPosition) =>
      word.latina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.biblpad.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, psalterData]);

  // Render verse comparison view
  const renderVerseView = () => {
    if (!verseData) return null;

    const verse = selectedVerse ? verseData[selectedVerse] : null;

    return (
      <Box>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
              p: 1,
              borderRadius: 1,
            }}
            onClick={toggleVerseExpanded}
          >
            <IconButton size="small">
              {verseExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
              Vybrat verš z Žalmu 6
            </Typography>
            {selectedVerse && verseExpanded && (
              <Chip label={selectedVerse} size="small" sx={{ ml: 2 }} color="primary" />
            )}
          </Box>

          <Collapse in={verseExpanded}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Verš</InputLabel>
                  <Select value={selectedVerse} onChange={handleVerseChange} label="Verš">
                    {verses.map((v: string) => (
                      <MenuItem key={v} value={v}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <InputLabel>Žaltáře k zobrazení</InputLabel>
                  <Select
                    multiple
                    value={selectedOlderPsalters}
                    onChange={handleOlderPsalterChange}
                    label="Žaltáře k zobrazení"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value: string) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.entries(OLDER_PSALTERS).map(([abbr, info]) => (
                      <MenuItem key={abbr} value={abbr}>
                        {abbr} - {info.name} ({info.period})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>
        </Paper>

        {!verseExpanded && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Klikněte výše pro výběr verše
            </Typography>
          </Paper>
        )}

        {verseExpanded && verse && (
          <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            {selectedVerse}
          </Typography>

          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Latina (Vulgáta)
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              {verse.latina}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            České překlady (od nejstarších)
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Rukopis</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>Období</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Překlad</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOlderPsalters.map((abbr: string) => {
                  const info = OLDER_PSALTERS[abbr as keyof typeof OLDER_PSALTERS];
                  const translation = verse.translations[abbr];

                  if (!translation) return null;

                  return (
                    <TableRow key={abbr} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {abbr}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {info.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={info.period}
                          size="small"
                          color={info.type === 'older' ? 'primary' : info.type === 'bible' ? 'secondary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {translation}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        )}
      </Box>
    );
  };

  // Render word-by-word comparison view
  const renderWordView = () => {
    return (
      <Box>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Žalm 6 - slovo po slovu (seřazeno podle latiny)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel>Vybrat rukopisy (max 5)</InputLabel>
                <Select
                  multiple
                  value={selectedManuscripts}
                  onChange={handleManuscriptChange}
                  label="Vybrat rukopisy (max 5)"
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hledat"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Hledat v latině/BiblPad"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#c6efce', border: '1px solid #999' }} />
              <Typography variant="body2">Autosemantikum (velká změna)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#ffeb9c', border: '1px solid #999' }} />
              <Typography variant="body2">Synsemantikum (malá změna)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, backgroundColor: '#ffffff', border: '1px solid #999' }} />
              <Typography variant="body2">Identické (X)</Typography>
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
                Zobrazeno prvních 200 z {filteredData.length} slov. Použijte vyhledávání pro filtrování.
              </Typography>
            )}
          </Paper>
        )}

        {selectedManuscripts.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Vyberte alespoň jeden rukopis k porovnání
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Porovnání textů</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Porovnání variant rukopisů s barevným označením změn
        </Typography>

        <Box sx={{ mt: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
          >
            <ToggleButton value="verses">
              Verš po verši (Ps 6)
            </ToggleButton>
            <ToggleButton value="words">
              Slovo po slovu (Excel)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {viewMode === 'verses' ? renderVerseView() : renderWordView()}
    </Box>
  );
};

export default ComparisonView;
