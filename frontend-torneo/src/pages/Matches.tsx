// src/pages/Matches.tsx
import React, { useState } from 'react';
import { Box, Grid, Typography, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import ModalForm from '../components/ModalForm';
import { useMatches } from '../hooks/useMatches';
import * as yup from 'yup';

const matchSchema = yup.object({
  torneoId: yup.number().required(),
  equipoLocalId: yup.number().required(),
  equipoVisitanteId: yup.number().required(),
  fecha: yup.date().required(),
  marcadorLocal: yup.number().nullable(),
  marcadorVisitante: yup.number().nullable(),
});

const Matches: React.FC = () => {
  const { data: matches = [], isLoading, isError, refetch, create, update, remove } = useMatches();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const handleOpen = (match?: any) => {
    setEditing(match ?? null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSubmit = (values: any) => {
    if (editing) {
      update({ id: editing.id, data: values });
    } else {
      create(values);
    }
    handleClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Grid item>
          <Typography variant="h4" component="h1">Partidos</Typography>
        </Grid>
        <Grid item>
          <Tooltip title="Refrescar">
            <IconButton onClick={() => refetch()}><RefreshIcon /></IconButton>
          </Tooltip>
          <AnimatedButton startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Nuevo Partido
          </AnimatedButton>
        </Grid>
      </Grid>

      {isLoading && <Typography>Cargando partidos...</Typography>}
      {isError && <Typography color="error">Error al cargar partidos.</Typography>}

      <TableContainer component={Paper} sx={{ background: 'transparent', backdropFilter: 'blur(8px)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Torneo</TableCell>
              <TableCell>Local</TableCell>
              <TableCell>Visitante</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>{m.id}</TableCell>
                <TableCell>{m.torneoId}</TableCell>
                <TableCell>{m.equipoLocalId}</TableCell>
                <TableCell>{m.equipoVisitanteId}</TableCell>
                <TableCell>{new Date(m.fecha).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar"><IconButton size="small" onClick={() => handleOpen(m)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => remove(m.id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalForm
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={editing ? 'Editar Partido' : 'Nuevo Partido'}
        validationSchema={matchSchema}
        renderFields={(methods) => (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <label>Torneo ID</label>
              <input type="number" {...methods.register('torneoId')} />
            </Box>
            <Box>
              <label>Equipo Local ID</label>
              <input type="number" {...methods.register('equipoLocalId')} />
            </Box>
            <Box>
              <label>Equipo Visitante ID</label>
              <input type="number" {...methods.register('equipoVisitanteId')} />
            </Box>
            <Box>
              <label>Fecha</label>
              <input type="date" {...methods.register('fecha')} />
            </Box>
            <Box>
              <label>Marcador Local</label>
              <input type="number" {...methods.register('marcadorLocal')} />
            </Box>
            <Box>
              <label>Marcador Visitante</label>
              <input type="number" {...methods.register('marcadorVisitante')} />
            </Box>
          </Box>
        )}
      />
    </Box>
  );
};

export default Matches;
