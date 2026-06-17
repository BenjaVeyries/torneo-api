// src/components/ModalForm.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface ModalFormProps<TFormValues> {
  open: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<TFormValues>;
  title?: string;
  // The schema for validation; if omitted, no validation is applied.
  validationSchema?: yup.ObjectSchema<any>;
  // Render function for the form fields; receives RHF methods via FormProvider.
  renderFields: (methods: ReturnType<typeof useForm<TFormValues>>) => React.ReactNode;
}

export function ModalForm<TFormValues extends Record<string, any>>(props: ModalFormProps<TFormValues>) {
  const { open, onClose, onSubmit, title, validationSchema, renderFields } = props;
  const methods = useForm<TFormValues>({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    mode: 'onSubmit',
  });

  const handleSubmit: SubmitHandler<TFormValues> = (data) => {
    onSubmit(data);
    methods.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <DialogContent>{renderFields(methods)}</DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}

// Example usage (not exported):
// const tournamentSchema = yup.object({ nombre: yup.string().required(), fechaInicio: yup.date().required() });
// <ModalForm<Tournament>
//   open={show}
//   onClose={() => setShow(false)}
//   onSubmit={handleCreate}
//   title="Crear Torneo"
//   validationSchema={tournamentSchema}
//   renderFields={(methods) => (
//     <Box display="flex" flexDirection="column" gap={2}>
//       <TextField label="Nombre" {...methods.register('nombre')} />
//       <TextField label="Fecha Inicio" type="date" {...methods.register('fechaInicio')} />
//     </Box>
//   )}
// />
