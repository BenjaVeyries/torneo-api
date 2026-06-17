// src/pages/Participants.tsx
import React from 'react';
import { Box, Grid, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import ModalForm from '../components/ModalForm';
import { useParticipants } from '../hooks/useParticipants';
import { useCreateParticipant, useUpdateParticipant, useDeleteParticipant } from '../hooks/useParticipants';

const Participants: React.FC = () => {
  const { data: participants, isLoading, refetch } = useParticipants();
  const { mutate: create } = useCreateParticipant();
  const { mutate: update } = useUpdateParticipant();
  const { mutate: remove } = useDeleteParticipant();

  const [open, setOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null);

  const handleOpen = (item?: any) => {
    setEditItem(item ?? null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSubmit = (values: any) => {
    if (editItem) {
      update({ id: editItem.id, participant: values });
    } else {
      create(values);
    }
    handleClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h4" component="h1">Participantes</Typography>
        </Grid>
        <Grid item>
          <Tooltip title="Refrescar">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <AnimatedButton startIcon={<AddIcon />} onClick={() => handleOpen()}>Nuevo</AnimatedButton>
        </Grid>
      </Grid>

      {isLoading && <Typography>Cargando...</Typography>}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {participants?.map(p => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <GlassCard title={p.nombre}>
              <Typography>Edad: {p.edad}</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Tooltip title="Editar"><IconButton onClick={() => handleOpen(p)}><EditIcon /></IconButton></Tooltip>
                <Tooltip title="Eliminar"><IconButton onClick={() => remove(p.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      <ModalForm
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={editItem ? 'Editar Participante' : 'Nuevo Participante'}
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

export default Participants;
