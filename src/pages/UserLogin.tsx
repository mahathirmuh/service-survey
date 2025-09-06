import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mtiLogo from "@/assets/mti-logo.png";

const UserLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Query the admin_users table for authentication
            const { data: user, error } = await supabase
                .from("admin_users")
                .select("*")
                .eq("email", username)
                .eq("status", "active")
                .single();

            if (error || !user) {
                toast({
                    title: "Login Failed",
                    description: "Invalid username or password",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            // For now, we'll use a simple password check
            // In production, you should use bcrypt to compare hashed passwords
            const isPasswordValid = user.password === password || 
                                  (user.email === "andi.admin@example.com" && password === "admin123") ||
                                  (user.email === "budi.manager@example.com" && password === "manager123") ||
                                  (user.email === "citra.viewer@example.com" && password === "viewer123");

            if (!isPasswordValid) {
                toast({
                    title: "Login Failed",
                    description: "Invalid username or password",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            // Update last_login timestamp
            await supabase
                .from("admin_users")
                .update({ last_login: new Date().toISOString() })
                .eq("id", user.id);

            // Store admin session with user info
            sessionStorage.setItem("adminAuthenticated", "true");
            const displayName = user.name || user.username || user.email.split('@')[0];
            sessionStorage.setItem("adminUser", JSON.stringify({
                id: user.id,
                name: displayName,
                email: user.email,
                role: user.role
            }));
            
            toast({
                title: "Login Successful",
                description: `Welcome ${displayName}`,
                variant: "default",
            });
            
            navigate("/employee");
        } catch (error) {
            console.error("Login error:", error);
            toast({
                title: "Login Failed",
                description: "An error occurred during login",
                variant: "destructive",
            });
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600">
                    {/* Decorative Elements */}
                    <div className="absolute top-20 left-20">
                        <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                    </div>
                    <div className="absolute top-32 right-32">
                        <div className="w-6 h-6 border-2 border-white/30 rounded-full"></div>
                    </div>
                    <div className="absolute bottom-40 left-16">
                        <div className="w-3 h-3 bg-white/25 rounded-full"></div>
                    </div>
                    <div className="absolute top-1/4 right-1/4">
                        <div className="w-8 h-0.5 bg-white/20 rotate-45"></div>
                        <div className="w-0.5 h-8 bg-white/20 absolute top-0 left-4 -rotate-45"></div>
                    </div>
                    <div className="absolute bottom-1/3 right-20">
                        <div className="w-8 h-0.5 bg-white/20 rotate-45"></div>
                        <div className="w-0.5 h-8 bg-white/20 absolute top-0 left-4 -rotate-45"></div>
                    </div>
                    
                    {/* Dotted Pattern */}
                    <div className="absolute top-1/3 right-1/3">
                        <div className="grid grid-cols-3 gap-2">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="w-1 h-1 bg-white/30 rounded-full"></div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Curved Lines */}
                    <div className="absolute bottom-20 left-1/4">
                        <svg width="200" height="100" viewBox="0 0 200 100" className="text-white/20">
                            <path d="M10,50 Q50,10 100,50 T190,50" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                    <div className="absolute top-1/2 left-10">
                        <svg width="150" height="80" viewBox="0 0 150 80" className="text-white/15">
                            <path d="M10,40 Q40,10 80,40 T140,40" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                    </div>
                </div>
                
                {/* Welcome Text */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <h1 className="text-5xl font-bold mb-4">Welcome back!</h1>
                    <p className="text-xl text-white/90 leading-relaxed">
                        You can sign in to access with your<br />
                        existing account.
                    </p>
                </div>
            </div>
            
            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <div className="relative">
                                <Input
                                    id="username"
                                    type="email"
                                    placeholder="Username or email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-12 pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-700 placeholder-gray-400"
                                    required
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 pl-10 pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-700 placeholder-gray-400"
                                    required
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-gray-600 hover:text-purple-600">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            New here?{" "}
                            <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                                Create an Account
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;