import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

// Context
import { AuthProvider } from "./context/AuthContext";

// Routes
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter> {/* ✅ FIXED POSITION */}
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}