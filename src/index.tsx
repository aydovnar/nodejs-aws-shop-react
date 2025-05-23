import React from "react";
import { createRoot } from "react-dom/client";
import App from "~/components/App/App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { MutationCache, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { theme } from "~/theme";
import ToastProvider from "~/components/ToastProvider/ToastProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: Infinity },
  },
  mutationCache: new MutationCache({
    onError: (error: any) => {
      window.dispatchEvent(
        new CustomEvent("global-toast", {
          detail: { message: error.message, severity: "error" },
        })
      );
    },
  }),
});

(async () => {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    worker.start({ onUnhandledRequest: "bypass" });
  }

  const container = document.getElementById("app");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider>
              <App />
            </ToastProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
})();
