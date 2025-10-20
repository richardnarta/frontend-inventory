import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from 'lucide-react';
import { login } from '@/service/auth';
import { toast } from "sonner";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login({ username, password });
      if (response.error) {
         throw new Error(response.message || 'Login failed');
      }
      toast.success('Login successful!');
      // A small delay to let the user see the success message
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-500 dark:text-blue-300">InventoryApp</CardTitle>
          <CardDescription>Masukkan kredensial anda untuk mengakses dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button className="bg-blue-500 font-semibold hover:bg-blue-600 w-full mt-12"type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              <span>{isLoading ? 'Please wait...' : 'Login'}</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

