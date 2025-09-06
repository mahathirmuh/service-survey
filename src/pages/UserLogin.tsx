import React, { useState, useEffect } from "react";
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
    const [rememberMe, setRememberMe] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Load saved credentials on component mount
    useEffect(() => {
        const savedCredentials = localStorage.getItem('rememberedCredentials');
        if (savedCredentials) {
            try {
                const { username: savedUsername, rememberMe: savedRememberMe } = JSON.parse(savedCredentials);
                if (savedRememberMe) {
                    setUsername(savedUsername);
                    setRememberMe(true);
                }
            } catch (error) {
                console.error('Error loading saved credentials:', error);
                localStorage.removeItem('rememberedCredentials');
            }
        }
    }, []);

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

            // Handle remember me functionality
            if (rememberMe) {
                localStorage.setItem('rememberedCredentials', JSON.stringify({
                    username: username,
                    rememberMe: true
                }));
            } else {
                localStorage.removeItem('rememberedCredentials');
            }

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
            {/* Left Side - Decorative Background */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
                {/* Enhanced Animated Background Elements */}
                <div className="absolute inset-0">
                    {/* Primary Particle System */}
                    <div className="absolute top-10 left-10 w-3 h-3 bg-white/30 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0s', animationDuration: '3s', filter: 'blur(0.5px)'}}></div>
                    <div className="absolute top-20 right-20 w-2 h-2 bg-white/40 rounded-full animate-bounce shadow-md" style={{animationDelay: '1s', animationDuration: '4s', filter: 'blur(0.3px)'}}></div>
                    <div className="absolute bottom-32 left-16 w-4 h-4 bg-white/25 rounded-full animate-bounce shadow-xl" style={{animationDelay: '2s', animationDuration: '5s', filter: 'blur(0.7px)'}}></div>
                    <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-white/35 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.5s', animationDuration: '3.5s', filter: 'blur(0.4px)'}}></div>
                    <div className="absolute bottom-20 right-10 w-3 h-3 bg-white/30 rounded-full animate-bounce shadow-md" style={{animationDelay: '1.5s', animationDuration: '4.5s', filter: 'blur(0.5px)'}}></div>
                    
                    {/* Secondary Particle Layer */}
                    <div className="absolute top-32 left-20 w-1.5 h-1.5 bg-cyan-300/40 rounded-full animate-bounce" style={{animationDelay: '0.3s', animationDuration: '2.8s'}}></div>
                    <div className="absolute bottom-40 right-32 w-2.5 h-2.5 bg-pink-300/30 rounded-full animate-bounce" style={{animationDelay: '1.8s', animationDuration: '4.2s'}}></div>
                    <div className="absolute top-2/3 left-32 w-1 h-1 bg-yellow-300/50 rounded-full animate-bounce" style={{animationDelay: '2.3s', animationDuration: '3.7s'}}></div>
                    
                    {/* Enhanced Pulsing Circles with Glow */}
                    <div className="absolute top-16 right-32 w-8 h-8 border-2 border-white/40 rounded-full animate-ping shadow-2xl" style={{animationDelay: '0s', boxShadow: '0 0 20px rgba(255,255,255,0.3)'}}></div>
                    <div className="absolute bottom-40 left-20 w-6 h-6 border border-white/30 rounded-full animate-ping shadow-xl" style={{animationDelay: '2s', boxShadow: '0 0 15px rgba(255,255,255,0.2)'}}></div>
                    <div className="absolute top-2/3 right-16 w-10 h-10 border-2 border-white/35 rounded-full animate-ping shadow-2xl" style={{animationDelay: '1s', boxShadow: '0 0 25px rgba(255,255,255,0.25)'}}></div>
                    
                    {/* Dynamic Floating Lines with Gradient */}
                    <div className="absolute top-24 left-32 w-16 h-1 bg-gradient-to-r from-white/30 to-transparent transform rotate-45 animate-pulse shadow-lg"></div>
                    <div className="absolute bottom-28 right-24 w-12 h-0.5 bg-gradient-to-l from-white/40 to-transparent transform -rotate-12 animate-pulse shadow-md" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-1/2 left-8 w-20 h-0.5 bg-gradient-to-r from-transparent via-white/25 to-transparent transform rotate-12 animate-pulse shadow-lg" style={{animationDelay: '2s'}}></div>
                    
                    {/* Enhanced Dotted Pattern with Stagger */}
                    <div className="absolute top-32 right-40">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse shadow-sm"></div>
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse shadow-sm" style={{animationDelay: '0.5s'}}></div>
                            <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse shadow-sm" style={{animationDelay: '1s'}}></div>
                            <div className="w-1.5 h-1.5 bg-white/35 rounded-full animate-pulse shadow-sm" style={{animationDelay: '1.5s'}}></div>
                            <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse shadow-sm" style={{animationDelay: '2s'}}></div>
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse shadow-sm" style={{animationDelay: '0.3s'}}></div>
                        </div>
                    </div>
                    
                    {/* Enhanced Curved Lines with Glow */}
                    <svg className="absolute bottom-16 left-24 w-24 h-24 text-white/30 drop-shadow-lg" viewBox="0 0 100 100">
                        <path d="M10,90 Q50,10 90,90" stroke="currentColor" strokeWidth="2" fill="none" 
                              strokeDasharray="10,5" className="animate-dash" style={{filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))'}} />
                    </svg>
                    <svg className="absolute top-40 right-12 w-20 h-20 text-white/35 drop-shadow-md" viewBox="0 0 100 100">
                        <path d="M20,80 Q60,20 80,80" stroke="currentColor" strokeWidth="1.5" fill="none" 
                              strokeDasharray="8,4" className="animate-dash" style={{animationDelay: '1s', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.2))'}} />
                    </svg>
                    
                    {/* Premium Floating Elements with Interaction */}
                    <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-gradient-to-r from-white/30 to-white/15 rounded-full animate-bounce transform hover:scale-125 transition-all duration-300 shadow-xl cursor-pointer" style={{animationDelay: '0.8s', animationDuration: '6s', boxShadow: '0 0 15px rgba(255,255,255,0.2)'}}></div>
                    <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-gradient-to-l from-white/35 to-white/20 rounded-full animate-bounce transform hover:scale-150 transition-all duration-300 shadow-lg cursor-pointer" style={{animationDelay: '2.2s', animationDuration: '5.5s', boxShadow: '0 0 12px rgba(255,255,255,0.25)'}}></div>
                    
                    {/* Advanced Orbiting System */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative w-32 h-32">
                            <div className="absolute top-0 left-1/2 w-2 h-2 bg-white/40 rounded-full transform -translate-x-1/2 animate-spin shadow-lg" style={{animationDuration: '8s', boxShadow: '0 0 8px rgba(255,255,255,0.3)'}}></div>
                            <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white/30 rounded-full transform -translate-x-1/2 animate-spin shadow-xl" style={{animationDuration: '12s', animationDirection: 'reverse', boxShadow: '0 0 10px rgba(255,255,255,0.25)'}}></div>
                            <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-cyan-300/50 rounded-full transform -translate-y-1/2 animate-spin" style={{animationDuration: '6s'}}></div>
                            <div className="absolute right-0 top-1/2 w-2.5 h-2.5 bg-pink-300/40 rounded-full transform -translate-y-1/2 animate-spin" style={{animationDuration: '10s', animationDirection: 'reverse'}}></div>
                        </div>
                    </div>
                    
                    {/* Interactive Morphing Shapes */}
                    <div className="absolute top-20 left-1/2 w-8 h-8 bg-white/20 transform rotate-45 animate-pulse hover:rotate-180 hover:scale-110 transition-all duration-1000 shadow-lg cursor-pointer" style={{animationDelay: '1.5s', boxShadow: '0 0 10px rgba(255,255,255,0.2)'}}></div>
                    <div className="absolute bottom-32 right-1/4 w-6 h-6 bg-white/25 rounded-full animate-pulse hover:rounded-none hover:rotate-45 transition-all duration-700 shadow-md cursor-pointer" style={{animationDelay: '3s', boxShadow: '0 0 8px rgba(255,255,255,0.15)'}}></div>
                    
                    {/* Enhanced Gradient Orbs with Glow */}
                    <div className="absolute top-1/3 right-20 w-12 h-12 bg-gradient-radial from-white/40 via-white/15 to-transparent rounded-full animate-pulse shadow-2xl" style={{animationDelay: '0.7s', animationDuration: '4s', boxShadow: '0 0 30px rgba(255,255,255,0.2)'}}></div>
                    <div className="absolute bottom-1/3 left-12 w-16 h-16 bg-gradient-radial from-white/30 via-white/10 to-transparent rounded-full animate-pulse shadow-2xl" style={{animationDelay: '2.5s', animationDuration: '6s', boxShadow: '0 0 40px rgba(255,255,255,0.15)'}}></div>
                    
                    {/* Advanced Particle Trail System */}
                    <div className="absolute top-12 left-1/4">
                        <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0s'}}></div>
                            <div className="w-1.5 h-1.5 bg-white/45 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-1.5 h-1.5 bg-white/35 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.3s'}}></div>
                            <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                    
                    {/* Enhanced Breathing Elements */}
                    <div className="absolute bottom-12 right-1/3 w-10 h-10 border-2 border-white/35 rounded-full animate-breathe shadow-lg" style={{boxShadow: '0 0 15px rgba(255,255,255,0.2)'}}></div>
                    <div className="absolute top-2/3 left-20 w-8 h-8 border border-white/40 rounded-full animate-breathe shadow-md" style={{animationDelay: '1.5s', boxShadow: '0 0 10px rgba(255,255,255,0.15)'}}></div>
                    
                    {/* Premium Staggered Grid Animation */}
                    <div className="absolute bottom-40 right-32">
                        <div className="grid grid-cols-4 gap-1">
                            {Array.from({length: 16}).map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse shadow-sm hover:bg-white/50 transition-colors" 
                                     style={{animationDelay: `${i * 0.1}s`, boxShadow: '0 0 3px rgba(255,255,255,0.2)'}}></div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Floating Constellation */}
                    <div className="absolute top-1/4 right-1/4">
                        <div className="relative w-20 h-20">
                            <div className="absolute top-0 left-0 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                            <div className="absolute top-2 right-4 w-1 h-1 bg-white/35 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                            <div className="absolute bottom-4 left-6 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                            <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                            <svg className="absolute inset-0 w-full h-full text-white/20" viewBox="0 0 80 80">
                                <path d="M10,10 L30,20 L50,30 L70,70" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="2,2" className="animate-dash" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                {/* Welcome Text */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <h1 className="text-5xl font-bold mb-4">Service Survey Portal</h1>
                    <p className="text-xl text-white/90 leading-relaxed">
                        Access the employee management system<br />
                        and survey analytics dashboard.
                    </p>
                </div>
            </div>
            
            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-hidden">
                {/* Subtle Particle Animation for Login Form */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Floating Micro Particles */}
                    <div className="absolute top-20 left-20 w-1 h-1 bg-purple-200/40 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
                    <div className="absolute top-32 right-24 w-0.5 h-0.5 bg-purple-300/50 rounded-full animate-bounce" style={{animationDelay: '1.2s', animationDuration: '3.5s'}}></div>
                    <div className="absolute bottom-40 left-16 w-1.5 h-1.5 bg-purple-100/60 rounded-full animate-bounce" style={{animationDelay: '2.1s', animationDuration: '5s'}}></div>
                    <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-indigo-200/45 rounded-full animate-bounce" style={{animationDelay: '0.8s', animationDuration: '4.2s'}}></div>
                    <div className="absolute bottom-24 right-20 w-1 h-1 bg-purple-200/35 rounded-full animate-bounce" style={{animationDelay: '1.7s', animationDuration: '3.8s'}}></div>
                    
                    {/* Gentle Pulsing Rings */}
                    <div className="absolute top-16 right-32 w-4 h-4 border border-purple-200/30 rounded-full animate-ping" style={{animationDelay: '0s', animationDuration: '6s'}}></div>
                    <div className="absolute bottom-32 left-24 w-3 h-3 border border-indigo-200/25 rounded-full animate-ping" style={{animationDelay: '3s', animationDuration: '8s'}}></div>
                    
                    {/* Subtle Gradient Lines */}
                    <div className="absolute top-28 left-32 w-8 h-0.5 bg-gradient-to-r from-purple-200/20 to-transparent transform rotate-12 animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-36 right-28 w-6 h-0.5 bg-gradient-to-l from-indigo-200/25 to-transparent transform -rotate-6 animate-pulse" style={{animationDelay: '2.5s'}}></div>
                    
                    {/* Floating Constellation */}
                    <div className="absolute top-1/4 left-1/4">
                        <div className="relative w-12 h-12">
                            <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-purple-300/40 rounded-full animate-pulse"></div>
                            <div className="absolute top-1 right-2 w-0.5 h-0.5 bg-purple-200/35 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                            <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-indigo-200/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                            <svg className="absolute inset-0 w-full h-full text-purple-200/15" viewBox="0 0 48 48">
                                <path d="M6,6 L12,8 L18,12 L24,24" stroke="currentColor" strokeWidth="0.3" fill="none" strokeDasharray="1,1" className="animate-dash" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Orbiting Elements */}
                    <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2">
                        <div className="relative w-16 h-16">
                            <div className="absolute top-0 left-1/2 w-0.5 h-0.5 bg-purple-300/50 rounded-full transform -translate-x-1/2 animate-spin" style={{animationDuration: '12s'}}></div>
                            <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-indigo-200/40 rounded-full transform -translate-x-1/2 animate-spin" style={{animationDuration: '16s', animationDirection: 'reverse'}}></div>
                        </div>
                    </div>
                    
                    {/* Breathing Dots */}
                    <div className="absolute bottom-16 left-1/3 w-2 h-2 border border-purple-200/25 rounded-full animate-breathe" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-2/3 right-16 w-1.5 h-1.5 border border-indigo-200/30 rounded-full animate-breathe" style={{animationDelay: '4s'}}></div>
                    
                    {/* Particle Trail */}
                    <div className="absolute top-12 right-1/3">
                        <div className="flex space-x-0.5">
                            <div className="w-0.5 h-0.5 bg-purple-300/50 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                            <div className="w-0.5 h-0.5 bg-purple-300/40 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-0.5 h-0.5 bg-purple-300/30 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-0.5 h-0.5 bg-purple-300/20 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                        </div>
                    </div>
                    
                    {/* Morphing Shape */}
                    <div className="absolute bottom-1/4 left-20 w-3 h-3 bg-purple-100/30 transform rotate-45 animate-pulse hover:rotate-90 transition-transform duration-1000 cursor-pointer" style={{animationDelay: '3s'}}></div>
                    
                    {/* Gradient Orb */}
                    <div className="absolute top-1/3 left-12 w-6 h-6 bg-gradient-radial from-purple-200/20 via-purple-100/10 to-transparent rounded-full animate-pulse" style={{animationDelay: '1.5s', animationDuration: '5s'}}></div>
                </div>
                
                <div className="w-full max-w-md relative z-10">
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
                        
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>
                    

                </div>
            </div>
        </div>
    );
};

export default UserLogin;