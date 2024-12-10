// import { render, screen } from "@testing-library/react";
// import App from "./App";

// test("renders the Submit button", () => {
//   render(<App />);
//   expect(screen.getByText(/Submit/i)).toBeInTheDocument();
// });

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App Component", () => {
  test("renders all form elements", () => {
    render(<App />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("form")).toBeInTheDocument();
    expect(screen.getByTestId("payer-account-select")).toBeInTheDocument();
    expect(screen.getByTestId("payee-input")).toBeInTheDocument();
    expect(screen.getByTestId("payee-account-input")).toBeInTheDocument();
    expect(screen.getByTestId("amount-input")).toBeInTheDocument();
    expect(screen.getByTestId("purpose-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  test("shows validation errors when submitting an empty form", async () => {
    render(<App />);

    userEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(screen.getByText("Purpose is required")).toBeInTheDocument();
      expect(screen.getByText("Payee is required")).toBeInTheDocument();
      expect(screen.getByText("Payee account is required")).toBeInTheDocument();
    });
  });

  test("accepts input in the fields", async () => {
    render(<App />);

    const payeeInput = screen.getByTestId("payee-input");
    await userEvent.type(payeeInput, "John Doe");
    expect(payeeInput).toHaveValue("John Doe");

    const amountInput = screen.getByTestId("amount-input");
    await userEvent.type(amountInput, "100");
    expect(amountInput).toHaveValue(100);
  });

  test("does not submit if validation fails", async () => {
    render(<App />);

    const amountInput = screen.getByTestId("amount-input");
    await userEvent.type(amountInput, "-50");

    userEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Amount must be a positive number")
      ).toBeInTheDocument();
    });
  });
});
