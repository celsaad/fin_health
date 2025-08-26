import { Colors } from "../constants/Colors";

export function getNumericalValueTextColor(amount: number) {
  if (amount > 0) return Colors.light.positive;
  if (amount < 0) return Colors.light.negative;
  return Colors.light.neutral;
}
