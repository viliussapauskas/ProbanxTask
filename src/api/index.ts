export const isPayeeAccountValid = async (accountNumber: string) => {
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
    if (error instanceof Error) {
      console.error("Fetch error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return false;
  }
};
