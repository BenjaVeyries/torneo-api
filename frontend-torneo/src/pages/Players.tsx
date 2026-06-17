// src/pages/Players.tsx
import React, { useState } from 'react';
import { Box, Grid, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import ModalForm from '../components/ModalForm';
import { usePlayers } from '../hooks/usePlayers';

const Players: React.FC = () => {
  const { data: players, isLoading, isError, refetch, createPlayer, updatePlayer, deletePlayer } = usePlayers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const handleOpen = (player?: any) => {
    setEditing(player ?? null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSubmit = (values: any) => {
    if (editing) {
      updatePlayer({ id: editing.id, player: values });
    } else {
      createPlayer(values);
    }
    handleClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Grid item>
          <Typography variant="h4" component="h1">Jugadores</Typography>
        </Grid>
        <Grid item>
          <Tooltip title="Refrescar">
            <IconButton onClick={() => refetch()}><RefreshIcon /></IconButton>
          </Tooltip>
          <AnimatedButton startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Nuevo Jugador
          </AnimatedButton>
        </Grid>
      </Grid>

      {isLoading && <Typography>Cargando...</Typography>}
      {isError && <Typography color="error">Error al cargar jugadores.</Typography>}

      <Grid container spacing={2}>
        {players?.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <GlassCard title={p.nombre}>
              <Typography>Edad: {p.edad}</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Tooltip title="Editar"><IconButton size="small" onClick={() => handleOpen(p)}><EditIcon /></IconButton></Tooltip>
                <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => deletePlayer(p.id)}><DeleteIcon /></IconButton></Tooltip>
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      <ModalForm
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={editing ? 'Editar Jugador' : 'Nuevo Jugador'}
        validationSchema={null}
        renderFields={(methods) => (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <label>Nombre</label>
              <input {...methods.register('nombre')} />
            </Box>
            <Box>
              <label>Edad</label>
              <input type="number" {...methods.register('edad')} />
            </Box>
            <Box>
              <label>Equipo ID</label>
              <input type="number" {...methods.register('equipoId')} />
            </Box>
          </Box>
        )}
      />
    </Box>
  );
};

export default Players;
