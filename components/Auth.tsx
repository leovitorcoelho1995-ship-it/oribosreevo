
import React, { useState } from 'react';

import { supabase } from '../services/supabaseClient';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          throw new Error("As senhas não coincidem.");
        }
        if (formData.password.length < 6) {
          throw new Error("A senha deve ter no mínimo 6 caracteres.");
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });

        if (signUpError) throw signUpError;
        alert("Cadastro realizado! Verifique seu e-mail ou faça login.");
        setIsRegistering(false);

      } else {
        // Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || "Erro na autenticação.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // Keep Demo Access for ease of testing if keys fail
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md p-8 glass rounded-2xl border border-white/10 z-10 relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent inline-block">
            ORIBOS REEVO
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {isRegistering ? 'Crie sua conta operacional' : 'Acesse seu dashboard de gestão'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs font-bold uppercase tracking-wide text-center">
              {error}
            </div>
          )}

          {isRegistering && (
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none transition-all"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">E-mail</label>
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none transition-all"
              placeholder="exemplo@oribos.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Senha</label>
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Confirmar Senha</label>
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none transition-all"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-sm hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processando...' : (isRegistering ? 'Cadastrar Agora' : 'Entrar no Sistema')}
            </button>

            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-3 bg-white/5 border border-white/10 text-gray-300 rounded-lg font-medium text-sm hover:bg-white/10 transition-all"
            >
              Acesso Demo
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-gray-400 hover:text-orange-400 text-xs transition-colors"
          >
            {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Registre-se aqui'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
