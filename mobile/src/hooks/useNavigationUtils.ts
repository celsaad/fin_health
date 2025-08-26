import { router } from "expo-router";

export function useNavigationUtils() {
  function back() {
    router.back();
  }

  return {
    back,
  };
}
