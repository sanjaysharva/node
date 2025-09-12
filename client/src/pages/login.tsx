import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { loginWithDiscord } from "@/lib/auth";
import { Shield, Users, Zap } from "lucide-react";
import Navbar from "@/components/navbar";

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    loginWithDiscord(rememberMe);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your Smart Serve account to access exclusive features
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Benefits Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">What you get with an account:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Join and manage Discord servers</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Complete quests and earn coins</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Submit and review servers</span>
                </div>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                data-testid="checkbox-remember-me"
              />
              <Label 
                htmlFor="remember-me" 
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Keep me signed in for 90 days
              </Label>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              size="lg"
              data-testid="button-login-discord"
            >
              <i className="fab fa-discord mr-2 text-lg"></i>
              Continue with Discord
            </Button>

            {/* Security Note */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>🔒 Your login is secured with Discord OAuth</p>
              <p>We only access your basic profile information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}