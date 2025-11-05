import { Dialog, DialogContent, DialogTitle, Button, DialogActions, Typography } from "@mui/material";
import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar"
}: ConfirmDialogProps) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" autoFocus sx={{color: '#fff', fontWeight: 600, textTransform: 'none', boxShadow: 'none', backgroundColor: '#d32f2f', "&:hover": {backgroundColor: "#c62828", boxShadow: 'none'} }}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

