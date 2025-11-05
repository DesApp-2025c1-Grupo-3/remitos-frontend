import { Button, SxProps } from "@mui/material";
import { Plus } from "lucide-react";

interface ButtonAddProps {
    title: string;
    onClick?: () => void;
    sx?: SxProps;
}

export default function ButtonAdd({ title, onClick, sx }: ButtonAddProps) {
    return (
        <Button 
            variant="contained" 
            startIcon={<Plus size={16}/>} 
            onClick={onClick}
            sx={{
                textTransform: "none",
                "&:hover": {
                    backgroundColor: "#C94715",
                    boxShadow: "none",
                },
                boxShadow: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                ...sx,
                width: { xs: "100%", sm: "max-content" },
            }}
        >
             {title}
        </Button>
    );
}

