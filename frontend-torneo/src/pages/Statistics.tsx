// src/pages/Statistics.tsx
import React from 'react';
import { Grid, Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useStatistics } from '../hooks/useStatistics';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import RefreshIcon from '@mui/icons-material/Refresh';

const Statistics: React.FC = () => {
  const { stats, isLoading, isError, refetch } = useStatistics();

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            Estadísticas
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <AnimatedButton startIcon={<RefreshIcon />} onClick={refetch} variant="contained">
            Refrescar
          </AnimatedButton>
        </Grid>
      </Grid>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Snackbar open autoHideDuration={6000}>
          <Alert severity="error">Error al cargar estadísticas.</Alert>
        </Snackbar>
      )}

      {stats && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={4} key={stat.id}>
              <GlassCard title={`Jugador ${stat.jugadorId}`}>
                <Typography>Goles: {stat.goles}</Typography>
                <Typography>Asistencias: {stat.asistencias}</Typography>
                <Typography>Tarjetas Amarillas: {stat.tarjetasAmarillas}</Typography>
                <Typography>Tarjetas Rojas: {stat.tarjetasRojas}</Typography>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Statistics;
