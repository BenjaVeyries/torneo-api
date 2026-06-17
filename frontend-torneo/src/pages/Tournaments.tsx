// src/pages/Tournaments.tsx
import React, { useState } from 'react';
import { Box, Grid, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AnimatedButton } from '../components/AnimatedButton';
import { GlassCard } from '../components/GlassCard';
import { ModalForm } from '../components/ModalForm';
import { useTournaments, useCreateTournament, useUpdateTournament, useDeleteTournament } from '../hooks/useTournaments';
import * as yup from 'yup';

const tournamentSchema = yup.object({
  nombre: yup.string().required('Nombre es requerido'),
  fechaInicio: yup.date().required('Fecha de inicio es requerida'),
  fechaFin: yup.date().nullable(),
  descripcion: yup.string().nullable(),
});

export const Tournaments: React.FC = () => {
  const { data: tournaments, isLoading, isError, refetch } = useTournaments();
  const createMutation = useCreateTournament();
  const updateMutation = useUpdateTournament();
  const deleteMutation = useDeleteTournament();

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<null | any>(null); // holds tournament to edit

  const handleOpen = () => {
    setEditing(null);
    setOpenModal(true);
  };

  const handleEdit = (t: any) => {
    setEditing(t);
    setOpenModal(true);
  };

  const handleSubmit = (data: any) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
    setOpenModal(false);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3" component="h1">
          Torneos
        </Typography>
        <IconButton onClick={() => refetch()} disabled={isLoading} aria-label="Refresh" size="large">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3} mb={2}>
        <Grid item xs={12}>
          <AnimatedButton variant="contained" onClick={handleOpen}>
            Nuevo Torneo
          </AnimatedButton>
        </Grid>
      </Grid>

      {isLoading && <Typography>Cargando torneos...</Typography>}
      {isError && <Typography color="error">Error al cargar torneos.</Typography>}

      {tournaments?.length ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Inicio</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tournaments.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.nombre}</TableCell>
                  <TableCell>{new Date(t.fechaInicio).toLocaleDateString()}</TableCell>
                  <TableCell>{t.fechaFin ? new Date(t.fechaFin).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{t.descripcion ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEdit(t)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleDelete(t.id!)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No hay torneos registrados.</Typography>
      )}

      <ModalForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
        title={editing ? 'Editar Torneo' : 'Nuevo Torneo'}
        validationSchema={tournamentSchema}
        renderFields={(methods) => (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <label>Nombre</label>
              <input {...methods.register('nombre')} />
            </Box>
            <Box>
              <label>Fecha Inicio</label>
              <input type="date" {...methods.register('fechaInicio')} />
            </Box>
            <Box>
              <label>Fecha Fin</label>
              <input type="date" {...methods.register('fechaFin')} />
            </Box>
            <Box>
              <label>Descripción</label>
              <textarea rows={3} {...methods.register('descripcion')} />
            </Box>
          </Box>
        )}
      />
    </Box>
  );
};

export default Tournaments;
