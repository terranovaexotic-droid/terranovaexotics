import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#121212",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            color: "#F5F5F5",
          },
        }}
      />
    </>
  );
}