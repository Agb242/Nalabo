import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-gray-200 dark:border-gray-700">
        <DialogHeader className="sr-only">
          <DialogTitle>{mode === "login" ? "Connexion" : "Inscription"}</DialogTitle>
          <DialogDescription>
            {mode === "login" ? "Connectez-vous à votre compte" : "Créez un nouveau compte"}
          </DialogDescription>
        </DialogHeader>
        {mode === "login" ? (
          <LoginForm onToggleForm={toggleMode} />
        ) : (
          <RegisterForm onToggleForm={toggleMode} />
        )}
      </DialogContent>
    </Dialog>
  );
}