import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { logout as logoutService } from "../configurations/services/auth.js";

export default function LogoutButton({
  className = "w-full flex items-center gap-3 bg-dark dark:bg-slate-700 dark:hover:bg-slate-600 p-4 rounded-lg dark:border-slate-700 border border-slate-200 transition-all text-left",
  label = "Déconnexion",
  description = "Se déconnecter de votre compte",
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutService();
    navigate("/logout");
  };

  return (
    <button onClick={handleLogout} className={className}>
      <LogOut size={20} className="text-slate-700 dark:text-slate-200" />
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </button>
  );
}