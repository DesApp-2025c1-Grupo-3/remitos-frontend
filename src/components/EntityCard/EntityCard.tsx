import { Box, Button, Card, Grid, Tooltip, Typography } from "@mui/material";
import { Edit, Eye, Trash2 } from "lucide-react";
import { ReactNode } from "react";

type Field = {
    label: string;
    value: ReactNode;
    isLong?: boolean;
    extend?: boolean;
};

type EntityCardProps = {
    icon: ReactNode;
    title: string;
    subtitle?: ReactNode;
    fields: Field[];
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function EntityCard({ title, subtitle, icon, fields, onView, onEdit, onDelete }: EntityCardProps) {
    return (
        <Card sx={{ 
            width: '100%', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
            <Box sx={{ 
                p: 2.5, 
                backgroundColor: '#F3F4F6', 
                width: '100%', 
                minHeight: '96px',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #E5E7EB' 
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', width: 'max-content' }}>
                    <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', 
                        backgroundColor: '#E65F2B', 
                        color: 'white', 
                        height: 'max-content', 
                        width: 'max-content', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        {icon}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', gap: 0.5 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.10rem', color: '#5A5A65' }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography sx={{ fontSize: '0.815rem', color: 'text.secondary' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
            <Box>
                <Grid container spacing={2} sx={{ p: 2.5, pb: 0 }}>
                    {fields.map((field, index) => (
                        <Grid item xs={field.extend ? 12 : 6} key={index}>
                            <Typography variant="body2" color="text.secondary">
                                {field.label}
                            </Typography>
                            {!field.isLong ? (
                                <Typography
                                    variant="h6" 
                                    fontWeight={600} 
                                    sx={{ fontSize: '0.90rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                >
                                    {field.value}
                                </Typography>
                            ) : (
                                <Tooltip 
                                    title={field.value} 
                                    placement="bottom-start"
                                    slotProps={{
                                        popper: {
                                        modifiers: [
                                            {
                                            name: 'offset',
                                            options: {
                                                offset: [0, -14],
                                            },
                                        },],},
                                    }}
                                >
                                    <Typography
                                        variant="h6" 
                                        fontWeight={600} 
                                        sx={{ 
                                            fontSize: '0.90rem',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {field.value}
                                    </Typography>
                                </Tooltip>
                            )}
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {onView ? (
                   <Button
                        variant="outlined"
                        onClick={onView}
                        sx={{ textTransform: 'none', color: 'text.primary',backgroundColor:"grey.100" , borderColor: 'grey.200', fontWeight: 600, "&:hover": { borderColor: 'grey.700', backgroundColor:"grey.100"} }}
                        startIcon={<Eye size={16} />}
                    >
                        Detalles
                    </Button> 
                ) : (<Box /> 
                )}
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {onEdit && (
                        <Button
                            variant="outlined"
                            onClick={onEdit}
                            sx={{ textTransform: 'none', color: '#214BD3', borderColor: '#AFD1FF', backgroundColor: '#DBEAFE', fontWeight: 600, "&:hover": { borderColor: '#214BD3', backgroundColor: '#D0E3FF' } }}
                            startIcon={<Edit size={16} color="#214BD3" />}
                        >
                            Editar
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="outlined"
                            onClick={onDelete}
                            sx={{ textTransform: 'none', color: '#FF3535', borderColor: '#FF9292', backgroundColor: 'rgba(255, 53, 53, 0.25)', fontWeight: 600, "&:hover": {  borderColor: '#FF3535', backgroundColor: 'rgba(255, 53, 53, 0.35)' } }}
                            startIcon={<Trash2 size={16} color="#FF3535"/>}
                        >
                            Eliminar
                        </Button>
                    )}
                </Box>
            </Box>
        </Card>
    );
}

