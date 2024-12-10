import { SxProps, Theme } from "@mui/material";

// Language select styles
export const languageSelectStyles: SxProps<Theme> = {
  marginBottom: "1rem",
};

// Account select display styles
export const accountSelectDisplayPropsStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

// MenuItem styles
export const menuItemStyles: React.CSSProperties = {
  justifyContent: "space-between",
};

// Amount helper text styles
export const helperTextStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

// Submit button wrapper styles
export const submitButtonWrapperStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  mt: 2,
};
