import { useFormik } from "formik";
import {
  Select,
  TextField,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  InputAdornment,
  Typography,
} from "@mui/material";
import * as yup from "yup";
import { useDebouncedCallback } from "use-debounce";
import {
  selectDisplayPropsStyles,
  menuItemStyles,
  helperTextStyles,
  submitButtonWrapperStyles,
} from "./styles";
import { fetchIsPayeeAccountValid } from "../../api";
import { PAYER_ACCOUNTS } from "../../../constants";
import { useState } from "react";

export const PaymentForm = () => {
  const validatePayeeAccount = async (value: string) => {
    if (!value) {
      setFieldError("payeeAccount", "Payee account is required");
      return false;
    }
    try {
      const isValid = await fetchIsPayeeAccountValid(value);
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

  const debouncedValidatePayeeAccount = useDebouncedCallback(
    validatePayeeAccount,
    300
  );

  const validationSchema = yup.object().shape({
    purpose: yup
      .string()
      .required("Purpose is required")
      .min(3, "Purpose must have at least 3 characters")
      .max(135, "Purpose must be less than 135 characters"),
    payerAccount: yup.string().required("Payer Account is required"),
    payee: yup.string().required("Payee is required").max(70),
    amount: yup
      .number()
      .required("Amount is required")
      .min(0.01)
      .test(
        "check-amount-validity",
        "Amount must be less than or equal to the account balance",
        function (value) {
          const currentBalance = getCurrentBalance();

          if (!currentBalance) {
            return this.createError({
              message: "Payer account must be selected first",
            });
          }

          if (value > currentBalance) {
            return this.createError({
              message: `Amount cannot exceed the current balance of ${currentBalance}`,
            });
          }

          return true;
        }
      ),
    payeeAccount: yup
      .string()
      .required("Payee account is required")
      .test(
        "is-valid-payee-account",
        "Payee account is invalid",
        async (value) => {
          const isValid = await debouncedValidatePayeeAccount(value);
          return isValid ?? false;
        }
      ),
  });

  const formik = useFormik({
    initialValues: {
      amount: "",
      payeeAccount: "",
      purpose: "",
      payerAccount: PAYER_ACCOUNTS[0]?.id,
      payee: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const payerAccount = PAYER_ACCOUNTS.find(
        (x) => x.id === values.payerAccount
      )?.iban;

      console.log("SUBMITING THESE", values);
      console.log("---------Submitting these values------");
      console.log("Payer account", payerAccount);
      console.log("Payee", values.payee);
      console.log("Payee account", values.payeeAccount);
      console.log("Amount", values.amount);
      console.log("Purpose", values.purpose);
      console.log("--------------------------------------");
      setSubmitting(false);
    },
  });

  const {
    setFieldError,
    handleBlur,
    values,
    errors,
    isSubmitting,
    handleSubmit,
    handleChange,
    setSubmitting,
  } = formik;

  const getCurrentBalance = (): number | undefined => {
    return PAYER_ACCOUNTS?.find((x) => x.id === values.payerAccount)?.balance;
  };

  const currentBalance = PAYER_ACCOUNTS?.find(
    (x) => x.id === values.payerAccount
  )?.balance;

  return (
    <form onSubmit={handleSubmit} data-testid="form">
      <FormControl fullWidth>
        <InputLabel id="payer-account-label">Account</InputLabel>
        <Select
          SelectDisplayProps={{ style: selectDisplayPropsStyles }}
          value={values.payerAccount}
          label="Account"
          id="payerAccount"
          name="payerAccount"
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.payerAccount}
          data-testid="payer-account-select"
        >
          {PAYER_ACCOUNTS.map((account) => (
            <MenuItem
              key={account?.id}
              value={account.id}
              style={menuItemStyles}
              data-testid={`payer-account-option-${account.id}`}
            >
              <span>{`${account.iban}`}</span>
              <span>
                <Typography
                  color={account.balance < 0 ? "error" : "inherit"}
                  component={"span"}
                  variant="inherit"
                >
                  {account.balance}
                </Typography>{" "}
                EUR
              </span>
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
          <span style={helperTextStyles}>
            <span>{errors?.amount}</span>
            <Typography
              component={"span"}
              variant="inherit"
              color="textSecondary"
            >
              Your balance is{" "}
              <Typography
                color={
                  currentBalance != null && currentBalance < 0
                    ? "error"
                    : "inherit"
                }
                component="span"
                variant="inherit"
              >
                {currentBalance}
              </Typography>
            </Typography>
          </span>
        }
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">€</InputAdornment>,
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
      <Box sx={submitButtonWrapperStyles}>
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
  );
};
