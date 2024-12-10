import { fireEvent, render, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { PAYEE_ACCOUNT_REQUIRED_MESSAGE, PaymentForm } from "./PaymentForm";

it("should render the form correctly", () => {
  const { getByTestId } = render(<PaymentForm />);

  // Assert presence of key elements
  expect(getByTestId("form")).toBeInTheDocument();
  expect(getByTestId("language-select-input")).toBeInTheDocument();
  expect(getByTestId("payer-account-select")).toBeInTheDocument();
  expect(getByTestId("payee-input")).toBeInTheDocument();
  expect(getByTestId("payee-account-input")).toBeInTheDocument();
  expect(getByTestId("amount-input")).toBeInTheDocument();
  expect(getByTestId("purpose-input")).toBeInTheDocument();
  expect(getByTestId("submit-button")).toBeInTheDocument();
});

it("should show validation errors on all fields when submitting with empty values", async () => {
  const { getByTestId, getByText } = render(<PaymentForm />);
  // Submit the form
  const submitButton = getByTestId("submit-button");
  fireEvent.click(submitButton);

  // Assert that error messages are shown for all fields
  await waitFor(() => {
    expect(getByText(PAYEE_ACCOUNT_REQUIRED_MESSAGE)).toBeInTheDocument();
    expect(getByText("Payee name is required.")).toBeInTheDocument();
    expect(getByText("Amount is required.")).toBeInTheDocument();
    expect(getByText("Purpose is required.")).toBeInTheDocument();
  });
});
