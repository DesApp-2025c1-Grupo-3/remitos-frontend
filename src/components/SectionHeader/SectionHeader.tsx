import { Box, Typography } from "@mui/material";
import ButtonAdd from "../buttons/ButtonAdd";

interface SectionHeaderProps {
  title: string;
  buttonText?: string;
  onAdd?: () => void;
}

export const SectionHeader = ({
  title,
  buttonText,
  onAdd
}: SectionHeaderProps) => {
  const renderButton = buttonText?.trim() !== "" && onAdd;

  return (
    <Box sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: { xs: "flex-start", sm: "center" },
      justifyContent: "space-between",
      gap: 2,
      pt: 3,
      pb: 3,
      mx: 2,
    }}
    >
      <Typography variant="h5" fontWeight={700} sx={{color: "#5a5a65"}}>{title}</Typography>
      {renderButton &&
        <ButtonAdd
          title={buttonText as string}
          onClick={onAdd}
          aria-label={`Añadir nuevo ${title.toLowerCase()}`}
        />
      }
    </Box>
  );
};

