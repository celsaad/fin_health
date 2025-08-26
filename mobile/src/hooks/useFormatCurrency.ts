function useFormatCurrency() {
  return (amount: number) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };
}

export default useFormatCurrency;
