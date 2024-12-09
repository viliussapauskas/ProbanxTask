import { useFormik } from "formik";
import {
  Select,
  TextField,
  Card,
  CardContent,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import * as yup from "yup";
import "./App.css";
import { useRef } from "react";
import { payerAccounts } from "../constants";

const App = () => {
  // const isPayeeAccountValid = async (accountNumber: string) => {
  //   try {
  //     ref.current++;
  //     console.log(`Request count: ${ref.current}`);
  //     const response = await fetch(
  //       // "https://matavi.eu/validate/?iban=LT307300010172619164"
  //       `https://matavi.eu/validate/?iban=${accountNumber}`
  //     );
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     console.log("Response data:", data.valid);
  //     return data.valid;
  //   } catch (error) {
  //     console.error("Fetch error:", error?.message);
  //   }
  // };

  // let requestCount = 0;
  const ref = useRef(0);

  const isPayeeAccountValid = async (
    accountNumber: string
  ): Promise<boolean> => {
    let timeoutId: number;

    const debouncedValidation = async () => {
      ref.current++;
      console.log(`Request count: ${ref.current}`);

      try {
        const response = await fetch(
          `https://matavi.eu/validate/?iban=${accountNumber}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Response data:", data.valid);
        return data.valid;
      } catch (error) {
        console.error("Fetch error:", error?.message);
      }
    };

    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await debouncedValidation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  };

  const validationSchema = yup.object().shape({
    amount: yup.number().required("Amount is required").max(
      // currentBalance,
      100,
      `Amount cannot exceed your current balance of ${3}`
    ),
    payeeAccount: yup
      .string()
      .required("Payee Account is required")
      .test("is-valid-payee", "Payee Account is invalid", async (value) => {
        if (!value) return false;
        try {
          const isValid = await isPayeeAccountValid(value);
          return isValid;
        } catch (error) {
          console.error("Error validating payee account:", error);
          return false;
        }
      }),
    purpose: yup
      .string()
      .required("Purpose is required")
      .min(3, "Purpose has to have at least 3 characters")
      .max(137, "Purpose has to have less than 137"),
    payerAccount: yup.string().required("Payer Account is required"),
    payee: yup.string().required("Payee is required").max(70),
  });

  const {
    values,
    errors,
    handleSubmit,
    isSubmitting,
    handleChange,
    handleBlur,
    touched,
  } = useFormik({
    initialValues: {
      amount: "",
      payeeAccount: "",
      purpose: "",
      payerAccount: payerAccounts[0]?.id,
      payee: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Submitting these values", values);
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card sx={{ maxWidth: 500 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Account</InputLabel>
              <Select
                SelectDisplayProps={{
                  style: { display: "flex", justifyContent: "space-between" },
                }}
                value={values.payerAccount}
                label="Account"
                id="payerAccount"
                name="payerAccount"
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.payerAccount && !!errors.payerAccount}
                // Maybe add helper text
              >
                {payerAccounts.map((account) => (
                  <MenuItem
                    key={account?.id}
                    value={account.id}
                    style={{ justifyContent: "space-between" }}
                  >
                    <span>{`${account.iban}`}</span>
                    <span>{`${account.balance} EUR`}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Payee"
              name="payee"
              margin="normal"
              id="payee"
              value={values.payee}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.payee && !!errors.payee}
              helperText={touched.payee && errors.payee}
            />
            <TextField
              fullWidth
              id="payeeAccount"
              label="Payee Account"
              name="payeeAccount"
              margin="normal"
              value={values.payeeAccount}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.payeeAccount && !!errors.payeeAccount}
              helperText={touched.payeeAccount && errors.payeeAccount}
            />
            <TextField
              fullWidth
              id="amount"
              label="Amount"
              name="amount"
              type="number"
              margin="normal"
              value={values.amount}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.amount && !!errors.amount}
              helperText={touched.amount && errors.amount}
            />

            <TextField
              fullWidth
              label="Purpose"
              name="purpose"
              margin="normal"
              id="purpose"
              value={values.purpose}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.purpose && !!errors.purpose}
              helperText={touched.purpose && errors.purpose}
            />
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Submit
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default App;
