import React from "react";
import { RelayEnvironmentProvider } from "react-relay";

import environment from "./Environment";

interface RelayProviderProps {
  children: React.ReactNode;
}

export default function RelayProvider({ children }: RelayProviderProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      {children}
    </RelayEnvironmentProvider>
  );
}
