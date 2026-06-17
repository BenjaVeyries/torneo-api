import React from 'react';
import { Box, Grid, Typography, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import { useStatistics } from '../hooks/useStatistics';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, isError, refetch } = useStatistics();

  const renderStat = (label: string, value: number | string) => (
    <GlassCard title={label}>
      <Typography variant="h4" component="div" sx={{ mt: 1, textAlign: 'center' }}>
        {value}
      </Typography>
    </GlassCard>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3" component="h1">
          Dashboard
        </Typography>
        <IconButton onClick={() => refetch()} disabled={isLoading} size="large" aria-label="Refresh statistics">
          <RefreshIcon />
        </IconButton>
      </Box>
      {isLoading && <Typography>Loading statistics...</Typography>}
      {isError && <Typography color="error">Failed to load statistics.</Typography>}
      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            {renderStat('Torneos', stats.torneos ?? '-')}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {renderStat('Participantes', stats.participantes ?? '-')}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {renderStat('Equipos', stats.equipos ?? '-')}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {renderStat('Jugadores', stats.jugadores ?? '-')}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {renderStat('Partidos', stats.partidos ?? '-')}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {renderStat('Puntos Totales', stats.puntosTotales ?? '-')}
          </Grid>
        </Grid>
      )}
      <Box mt={4} display="flex" justifyContent="center">
        <AnimatedButton href="/torneos" variant="contained" size="large">
          Gestionar Torneos
        </AnimatedButton>
      </Box>
    </Box>
  );
};

export default Dashboard;
