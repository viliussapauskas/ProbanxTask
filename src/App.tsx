import {
  Card,
  CardContent,
  Box,
  Typography,
  Theme,
  SxProps,
} from "@mui/material";
import { PaymentForm } from "./components";

// Box styles
const boxStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  padding: 2,
};

// Card styles
const cardStyles: SxProps<Theme> = {
  maxWidth: 500,
  width: "100%",
  borderRadius: 3,
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
};

const App = () => {
  return (
    <Box sx={boxStyles}>
      <Card sx={cardStyles} data-testid="card">
        <CardContent>
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            Payment
          </Typography>
          <PaymentForm />
        </CardContent>
      </Card>
    </Box>
  );
};

export default App;
