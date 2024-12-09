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
  InputAdornment,
} from "@mui/material";
import * as yup from "yup";
import "./App.css";
import { payerAccounts } from "../constants";
import EuroIcon from "@mui/icons-material/Euro";

const App = () => {
  const isPayeeAccountValid = async (
    accountNumber: string
  ): Promise<boolean> => {
    let timeoutId: number;

    const debouncedValidation = async () => {
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

  const getCurrentBalance = () => {
    return payerAccounts?.find((x) => x.id === values.payerAccount)?.balance;
  };

  const validationSchema = yup.object().shape({
    purpose: yup
      .string()
      .required("Purpose is required")
      .min(3, "Purpose has to have at least 3 characters")
      .max(137, "Purpose has to have less than 137"),
    payerAccount: yup.string().required("Payer Account is required"),
    payee: yup.string().required("Payee is required").max(70),
  });

  const validatePayeeAccount = (value: string) => {
    // Your custom validation logic here
    if (!value || value.length < 10) {
      return "Payee Account must be at least 10 characters long";
    }
    return null; // Validation passed
  };

  const validateAmount = (value: number) => {
    console.log("validating amount", value);

    // Your custom validation logic, considering payerAccount
    if (!value || value <= 0) {
      return "Amount must be a positive number";
    }

    const currentBalance = getCurrentBalance();
    if (!currentBalance) {
      return "Balance not avaialble";
    }

    if (value > currentBalance) {
      return "Insuficient funds";
    }
    // Additional validation based on payerAccount, if needed
    return null; // Validation passed
  };

  const {
    values,
    errors,
    handleSubmit,
    isSubmitting,
    // handleChange,
    handleBlur,
    touched,
    setFieldValue,
    setFieldError,
  } = useFormik({
    initialValues: {
      amount: "",
      payeeAccount: "",
      purpose: "",
      payerAccount: payerAccounts[0]?.id,
      payee: "",
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema,
    onSubmit: (values) => {
      console.log("Submitting these values", values);
    },
  });

  const validateField = (fieldValue: string) => {
    try {
      schema.validateSync(fieldValue, { abortEarly: false });
      return null; // Validation passed
    } catch (error) {
      return error.errors; // Return an array of validation errors
    }
  };

  const handleChange = (event: unknown) => {
    const { name, value } = event.target;

    let errors;

    if (name === "payeeAccount") {
      errors = validatePayeeAccount(value);
    } else if (name === "amount") {
      errors = validateAmount(value);
    } else {
      // Use Yup validation for other fields
      errors = validateField(value, validationSchema.shape()[name]);
    }

    // Update the form values and errors
    setFieldValue(name, value);
    setFieldError(name, errors);
  };

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
                //  Add helper text
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
              helperText={
                <span
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{errors?.amount}</span>
                  <span style={{ color: "grey" }}>
                    Your balance is{" "}
                    {
                      payerAccounts?.find((x) => x.id === values.payerAccount)
                        ?.balance
                    }
                  </span>
                </span>
              }
              slotProps={{
                input: {
                  // endAdornment÷
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* <EuroIcon /> */}€
                    </InputAdornment>
                  ),
                },
              }}
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
