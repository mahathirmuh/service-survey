import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield } from "lucide-react";
import mtiLogo from "@/assets/mti-logo.png";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (username === "admin" && password === "T$1ngsh4n@24") {
            // Store admin session
            sessionStorage.setItem("adminAuthenticated", "true");
            
            toast({
                title: "Login Successful",
                description: "Welcome to the Admin Employee Panel",
                variant: "default",
            });
            
            navigate("/dashboard");
        } else {
            toast({
                title: "Login Failed",
                description: "Invalid username or password",
                variant: "destructive",
            });
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader className="space-y-4 pb-6">
                        <div className="flex justify-center">
                            <img src={mtiLogo} alt="MTI Logo" className="h-16 w-auto" />
                        </div>
                        <div className="text-center space-y-2">
                            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                                <Shield className="h-6 w-6 text-purple-600" />
                                Admin Portal
                            </CardTitle>
                            <p className="text-gray-600">Employee Survey Management System</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter admin username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter admin password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
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

                            <Button
                                type="submit"
                                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                        </form>
                        
                        <div className="mt-6 text-center">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/")}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                ← Back to Survey
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;