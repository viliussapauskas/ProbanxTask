import { Card, CardContent, Box, Theme, SxProps } from "@mui/material";
import "./App.css";
import { PaymentForm } from "./components";

// Box styles
const boxStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
};

// Card styles
const cardStyles: SxProps<Theme> = {
  maxWidth: 500,
};

const App = () => {
  return (
    <Box sx={boxStyles}>
      <Card sx={cardStyles} data-testid="card">
        <CardContent>
          <PaymentForm />
        </CardContent>
      </Card>
    </Box>
  );
};

export default App;
