import { Button } from "@/components/ui/button";
import { HardHat } from "lucide-react";
import heroImg from "@assets/hero.jpg"; // Assuming static asset availability or fallback
// Using an industrial unsplash image for the hero section
// HTML comment for Unsplash: 
// <!-- construction site sunset crane -->

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Hero */}
      <div className="lg:w-1/2 relative overflow-hidden bg-slate-900 flex flex-col justify-between p-8 lg:p-12 text-white">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" 
            alt="Construction Site" 
            className="w-full h-full object-cover"
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-0" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="font-display font-bold text-xl">B</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">Botello Builders</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
            Building the Future,<br />
            Managing the Present.
          </h1>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed">
            The complete management system for construction professionals. Track projects, inventory, and labor in one unified platform.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500 font-medium">
          © 2024 Botello Builders Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <div className="space-y-4 pt-4">
            <Button 
              size="lg" 
              className="w-full h-14 text-base font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform duration-200"
              onClick={() => window.location.href = "/api/login"}
            >
              <HardHat className="mr-2 h-5 w-5" />
              Sign In with Replit
            </Button>
            
            <div className="text-center text-xs text-muted-foreground pt-4">
              Authorized personnel only. Contact IT for access issues.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
