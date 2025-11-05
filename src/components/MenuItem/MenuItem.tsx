import { Popover, Typography, ListItemButton, ListItemIcon, ListItemText, List } from "@mui/material";
import { Edit, Ellipsis, Trash2, Eye } from "lucide-react";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface MenuItemProps {
    handleOpenDialog: () => void;
    id: string | number;
    children?: React.ReactNode;
    handleOpenDetails?: () => void;
    module?: string;
}

export default function MenuItem({ handleOpenDialog, id, children, handleOpenDetails, module }: MenuItemProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const pathParts = location.pathname.split("/");
    const currentModule = pathParts[1];

    const resolvedModule = module ?? currentModule;

    return (
        <div className="relative h-full flex items-center justify-center">
            <button 
                onClick={handleClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    outline: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
                <Ellipsis style={{ color: '#6B7280', width: '20px', height: '20px' }}/>
            </button>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        elevation: 2,
                        style: {
                            borderRadius: 8,
                            minWidth: 100,
                            paddingTop: 8,
                            paddingBottom: 8,
                            border: '1px solid #E5E7EB'
                        }
                    }
                }}
            >
                <Typography variant="subtitle2" align="center" sx={{ px: 2, pb: 1, fontWeight: "bold", fontSize: 12 }}>
                    Acciones
                </Typography>
                <List dense disablePadding>
                    <ListItemButton
                        onClick={() => {
                            navigate(`/${resolvedModule}/editar/${id ?? ""}`);
                            handleClose();
                        }}
                        sx={{ gap: 1, px: 2 }}
                    >
                        <ListItemIcon sx={{ minWidth: 20 }}>
                            <Edit size={16} color="#2563EB" />
                        </ListItemIcon>
                        <ListItemText primary="Editar" primaryTypographyProps={{ fontSize: 13, color: "#2563EB" }} />
                    </ListItemButton>

                    <ListItemButton
                        onClick={() => {
                            handleOpenDialog();
                            handleClose();
                        }}
                        sx={{ gap: 1, px: 2 }}
                    >
                        <ListItemIcon sx={{ minWidth: 20 }}>
                            <Trash2 size={16} color="#DC2626" />
                        </ListItemIcon>
                        <ListItemText primary="Eliminar" primaryTypographyProps={{ fontSize: 13, color: "#DC2626" }} />
                    </ListItemButton>

                    {children && handleOpenDetails && (
                        <ListItemButton
                            onClick={() => {
                                handleOpenDetails();
                                handleClose();
                            }}
                            sx={{ gap: 1, px: 2 }}
                        >
                            <ListItemIcon sx={{ minWidth: 20 }}>
                                {children}
                            </ListItemIcon>
                            <ListItemText primary="Detalles" primaryTypographyProps={{ fontSize: 13, color: "#4B5563" }} />
                        </ListItemButton>
                    )}
                </List>
            </Popover>
        </div>
    );
}

