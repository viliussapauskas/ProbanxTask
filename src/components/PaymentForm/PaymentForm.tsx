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
  SelectChangeEvent,
} from "@mui/material";
import * as yup from "yup";
import { useDebouncedCallback } from "use-debounce";
import {
  accountSelectDisplayPropsStyles,
  menuItemStyles,
  helperTextStyles,
  submitButtonWrapperStyles,
  languageSelectStyles,
  languageSelectWrapperStyles,
} from "./styles";
import { fetchIsPayeeAccountValid } from "../../api";
import { PAYER_ACCOUNTS } from "../../../constants";
import { useState } from "react";
import { allLanguages, formatNumberByLocale, Language } from "../../utils";

export const PAYEE_ACCOUNT_REQUIRED_MESSAGE = "Payee account is required.";
export const PAYEE_ACCOUNT_INVALID_MESSAGE = "Payee account is invalid.";

export const PaymentForm = () => {
  const validatePayeeAccount = async (value: string) => {
    if (!value) {
      setFieldError("payeeAccount", PAYEE_ACCOUNT_REQUIRED_MESSAGE);
      return false;
    }
    try {
      const isValid = await fetchIsPayeeAccountValid(value);
      if (!isValid) {
        setFieldError("payeeAccount", PAYEE_ACCOUNT_INVALID_MESSAGE);
        return false;
      } else {
        setFieldError("payeeAccount", "");
        return true;
      }
    } catch (error) {
      setFieldError("payeeAccount", "Error validating account.");
      console.error("Validation error:", error);
      return false;
    }
  };

  const debouncedValidatePayeeAccount = useDebouncedCallback(
    validatePayeeAccount,
    300
  );

  const validationSchema = yup.object().shape({
    payerAccount: yup.string().required("Payer Account is required."),
    payee: yup
      .string()
      .required("Payee name is required.")
      .max(70, "Payee name cannot exceed 70 characters."),
    payeeAccount: yup
      .string()
      .required(PAYEE_ACCOUNT_REQUIRED_MESSAGE)
      .test(
        "is-valid-payee-account",
        PAYEE_ACCOUNT_INVALID_MESSAGE,
        async (value) => {
          const isValid = await debouncedValidatePayeeAccount(value);
          return isValid ?? false;
        }
      ),
    amount: yup
      .number()
      .required("Amount is required.")
      .min(0.01)
      .test(
        "check-amount-validity",
        "Amount must be less than or equal to the account balance.",
        function (value) {
          const currentBalance = getCurrentBalance();

          if (!currentBalance) {
            return this.createError({
              message: "Payer account must be selected first.",
            });
          }
          if (value > currentBalance) {
            return this.createError({
              message: "Insufficient funds.",
            });
          }

          return true;
        }
      ),
    purpose: yup
      .string()
      .required("Purpose is required.")
      .min(3, "Purpose must have at least 3 characters.")
      .max(135, "Purpose must be less than 135 characters."),
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

      console.log("---------Submitting these values------");
      console.log("Payer account", payerAccount); // Would make sense to send the ID (values.payerAccount) to the endpoint
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

  const [language, setLanguage] = useState<Language>("EN");

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setLanguage(event.target.value as Language);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="form">
      <Box sx={languageSelectWrapperStyles}>
        <Select
          data-testid="language-select-input"
          value={language}
          onChange={handleLanguageChange}
          sx={languageSelectStyles}
        >
          {allLanguages.map((lang) => (
            <MenuItem data-testid={lang} key={lang} value={lang}>
              {lang}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <FormControl fullWidth>
        <InputLabel id="payer-account-label">Account</InputLabel>
        <Select
          SelectDisplayProps={{ style: accountSelectDisplayPropsStyles }}
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
                  {formatNumberByLocale(account.balance, language)}
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
              component="span"
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
                {formatNumberByLocale(currentBalance, language)}
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
