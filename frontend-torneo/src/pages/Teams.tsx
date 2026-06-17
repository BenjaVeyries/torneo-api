// src/pages/Teams.tsx
import React, { useState } from 'react';
import { Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTeams } from '../hooks/useTeams';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import ModalForm from '../components/ModalForm';

const Teams: React.FC = () => {
  const { data: teams = [], isLoading, refetch, createTeam, updateTeam, deleteTeam } = useTeams();
  const [open, setOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<any>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const handleClose = () => setOpen(false);
  const handleSubmit = (values: any) => {
    if (editTeam) {
      updateTeam({ id: editTeam.id, team: values });
      setSnack({ open: true, message: 'Equipo actualizado' });
    } else {
      createTeam(values);
      setSnack({ open: true, message: 'Equipo creado' });
    }
    setOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar este equipo?')) {
      await deleteTeam(id);
      setSnack({ open: true, message: 'Equipo eliminado' });
    }
  };

  return (
    <Grid container spacing={2} justifyContent="center" sx={{ p: 2 }}>
      <Grid item xs={12} md={10}>
        <GlassCard title="Equipos">
          <Box display="flex" justifyContent="space-between" mb={2}>
            <AnimatedButton onClick={() => { setEditTeam(null); setOpen(true); }}>Nuevo Equipo</AnimatedButton>
            <IconButton onClick={() => refetch()} color="primary" aria-label="Refresh">
              <RefreshIcon />
            </IconButton>
          </Box>
          {isLoading ? (
            <Box>Loading…</Box>
          ) : (
            <TableContainer component={Paper} sx={{ background: 'transparent', backdropFilter: 'blur(8px)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id} hover>
                      <TableCell>{team.id}</TableCell>
                      <TableCell>{team.nombre}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar"><IconButton size="small" onClick={() => { setEditTeam(team); setOpen(true); }}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleDelete(team.id!)}><DeleteIcon /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </GlassCard>
      </Grid>
    </Grid>
  );
};

export default Teams;

// Snackbar handling
const SnackbarAlert = ({ open, message, onClose }: { open: boolean; message: string; onClose: () => void }) => (
  <Snackbar open={open} autoHideDuration={3000} onClose={onClose} message={message} />
);
