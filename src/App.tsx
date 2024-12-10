import React, { useCallback, useEffect } from "react";
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

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const App = () => {
  const isPayeeAccountValid = async (accountNumber: string) => {
    try {
      const response = await fetch(
        `https://matavi.eu/validate/?iban=${accountNumber}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const { valid } = await response.json();
      return valid;
    } catch (error) {
      console.error("Fetch error:", error?.message);
      return false;
    }
  };

  const validatePayeeAccount = async (value: string) => {
    if (!value) {
      setFieldError("payeeAccount", "Payee account is required");
      return false;
    }

    try {
      const isValid = await isPayeeAccountValid(value);
      if (!isValid) {
        setFieldError("payeeAccount", "Payee account is invalid");
        return false;
      } else {
        setFieldError("payeeAccount", "");
        return true;
      }
    } catch (error) {
      setFieldError("payeeAccount", "Error validating account");
      console.error("Validation error:", error);
      return false;
    }
  };

  const validationSchema = yup.object().shape({
    purpose: yup
      .string()
      .required("Purpose is required")
      .min(3, "Purpose must have at least 3 characters")
      .max(137, "Purpose must be less than 137 characters"),
    payerAccount: yup.string().required("Payer Account is required"),
    payee: yup.string().required("Payee is required").max(70),
  });

  const formik = useFormik({
    initialValues: {
      amount: "",
      payeeAccount: "",
      purpose: "",
      payerAccount: payerAccounts[0]?.id,
      payee: "",
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: () => {},
  });

  const {
    setFieldValue,
    setFieldError,
    handleBlur,
    values,
    errors,
    isSubmitting,
  } = formik;

  const getCurrentBalance = () => {
    return payerAccounts?.find((x) => x.id === values.payerAccount)?.balance;
  };

  const validateAmount = (value) => {
    if (!value || value <= 0) {
      setFieldError("amount", "Amount must be a positive number");
      return false;
    }

    const currentBalance = getCurrentBalance();
    if (currentBalance === undefined) {
      setFieldError("amount", "Balance not available");
      return false;
    }

    if (value > currentBalance) {
      console.log("------");
      console.log("value", value);
      console.log("currentBalance", currentBalance);
      console.log("------");
      setFieldError("amount", "Insufficient funds");
      return false;
    }

    setFieldError("amount", "");
    return true; // Clear error if validation passes
  };

  const debouncedValidatePayeeAccount = useCallback(
    debounce(async (value: string) => {
      if (!value) {
        setFieldError("payeeAccount", "Payee account is required");
        return;
      }
      const isValid = await isPayeeAccountValid(value);
      if (!isValid) {
        setFieldError("payeeAccount", "Payee account is invalid");
      } else {
        setFieldError("payeeAccount", "");
      }
      return isValid;
    }, 500),
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFieldValue(name, value);

    if (name === "payeeAccount") {
      debouncedValidatePayeeAccount(value);
    } else if (name === "amount") {
      validateAmount(value);
    } else {
      try {
        validationSchema.validateSyncAt(name, { [name]: value });
        setFieldError(name, "");
      } catch (error) {
        setFieldError(name, error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAmountValid = validateAmount(values.amount);
    const isPayeeAccountValid = await validatePayeeAccount(values.payeeAccount);
    const isPurposeValid = !errors.purpose;
    const isPayeeValid = !errors.payee;

    console.log("isAmountValid", isAmountValid);
    console.log("isPayeeAccountValid", isPayeeAccountValid);
    console.log("isPurposeValid", isPurposeValid);
    console.log("isPayeeValid", isPayeeValid);

    if (
      !isAmountValid ||
      !isPayeeAccountValid ||
      !isPurposeValid ||
      !isPayeeValid
    ) {
      return;
    }

    console.log("Submitting these values", values);
  };

  useEffect(() => {
    if (values.amount) {
      validateAmount(values.amount);
    }
  }, [values.payerAccount]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card sx={{ maxWidth: 500 }} data-testid="card">
        <CardContent>
          <form onSubmit={handleSubmit} data-testid="form">
            <FormControl fullWidth>
              <InputLabel id="payer-account-label">Account</InputLabel>
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
                error={!!errors.payerAccount}
                data-testid="payer-account-select"
              >
                {payerAccounts.map((account) => (
                  <MenuItem
                    key={account?.id}
                    value={account.id}
                    style={{ justifyContent: "space-between" }}
                    data-testid={`payer-account-option-${account.id}`}
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
              error={!!errors.payee}
              helperText={errors.payee}
              data-testid="payee-input"
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
              error={!!errors.payeeAccount}
              helperText={errors.payeeAccount}
              data-testid="payee-account-input"
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
              error={!!errors.amount}
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
                  endAdornment: (
                    <InputAdornment position="end">€</InputAdornment>
                  ),
                },
              }}
              data-testid="amount-input"
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
              error={!!errors.purpose}
              helperText={errors.purpose}
              data-testid="purpose-input"
            />
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                data-testid="submit-button"
              >
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
