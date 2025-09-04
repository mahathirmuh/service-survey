import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, LogOut, Users, Shield, Search, Upload, Download, LayoutDashboard, Menu, BarChart3, FileText, ChevronDown, ChevronRight, ChevronUp, Grid3X3, ArrowUpDown, ArrowUp, ArrowDown, Settings, FolderOpen, List, Lock } from "lucide-react";
import mtiLogo from "@/assets/mti-logo.png";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from "@/components/ui/pagination";
import usePagination from "@/hooks/use-pagination";

interface Employee {
    id: string;
    id_badge_number: string;
    name: string;
    department: string;
    level?: string;
    status?: string;
    email?: string;
    created_at: string;
    updated_at: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
    status: string;
    last_login?: string;
    created_at: string;
}

const departments = [
    "AIM Construction",
    "AIM Operation",
    "Environment",
    "External Affair",
    "Finance",
    "Human Resources",
    "Maintenance",
    "Management",
    "Occupational Health and Safety",
    "Pyrite Plant",
    "Supply Chain Management"
];

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [selectedLevel, setSelectedLevel] = useState<string>("all");
    const [submissionFilter, setSubmissionFilter] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [resultsExpanded, setResultsExpanded] = useState(false);
    const [menuManagementExpanded, setMenuManagementExpanded] = useState(false);
    const [activeMenuItem, setActiveMenuItem] = useState(() => {
        // Check current path and URL parameters
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const menu = urlParams.get('menu');
        
        // If we're on the user-management route, set active menu to user-management
        if (currentPath === '/user-management') {
            return 'user-management';
        }
        
        // Otherwise use menu parameter or default to dashboard
        const activeMenu = menu || "dashboard";
        
        // If we're on a results sub-page, expand the results menu
        if (activeMenu.includes('results')) {
            setResultsExpanded(true);
        }
        
        return activeMenu;
    });
    const [formData, setFormData] = useState({
        id_badge_number: "",
        name: "",
        department: "",
        level: "Non Managerial",
        email: "",
    });
    
    // User management state
    const [users, setUsers] = useState<User[]>([]);
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userFormData, setUserFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "Admin",
        status: "Active",
    });
    
    // Bulk selection state
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [bulkFormData, setBulkFormData] = useState({
        department: "",
        level: "",
        email: "",
    });
    
    // Sorting state
    const [sortField, setSortField] = useState<keyof Employee | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    
    // User sorting state
    const [userSortField, setUserSortField] = useState<keyof User | null>(null);
    const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc');
    
    const { toast } = useToast();
    const navigate = useNavigate();

    // Initialize pagination for employee management
    const pagination = usePagination({
        totalItems: filteredEmployees.length,
        initialPageSize: 10,
    });

    // Get current page data for employee management
    const currentPageEmployees = pagination.paginateData(filteredEmployees);
    
    // Initialize pagination for submission status view
    const submissionPagination = usePagination({
        totalItems: filteredEmployees.length,
        initialPageSize: 10,
    });
    
    // Get current page data for submission view
    const currentPageSubmissions = submissionPagination.paginateData(filteredEmployees);
    
    // Sort users based on current sort field and direction
    const sortedUsers = useMemo(() => {
        if (!userSortField) return users;
        
        return [...users].sort((a, b) => {
            let aValue = a[userSortField];
            let bValue = b[userSortField];
            
            // Handle null/undefined values
            if (aValue === null || aValue === undefined) aValue = '';
            if (bValue === null || bValue === undefined) bValue = '';
            
            // Handle date fields
            if (userSortField === 'created_at' || userSortField === 'last_login') {
                aValue = new Date(aValue as string).getTime();
                bValue = new Date(bValue as string).getTime();
            }
            
            // Convert to string for comparison if not already
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) {
                return userSortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return userSortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [users, userSortField, userSortDirection]);
    
    // Initialize pagination for user management
    const userPagination = usePagination({
        totalItems: sortedUsers.length,
        initialPageSize: 10,
    });
    
    // Get current page data for user management
    const currentPageUsers = userPagination.paginateData(sortedUsers);

    // Check authentication
    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [navigate]);

    // Handle route changes to update active menu item
    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath === '/user-management') {
            setActiveMenuItem('user-management');
        } else if (currentPath === '/employee') {
            setActiveMenuItem('dashboard');
        }
    }, [window.location.pathname]);

    // Fetch employees with submission status
    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            // Get all employees with their status from the database
            const { data: employeesData, error: employeesError } = await supabase
                .from("employees")
                .select("*")
                .order("created_at", { ascending: false });

            if (employeesError) throw employeesError;

            // Get all survey responses to double-check and sync status
            const { data: responsesData, error: responsesError } = await supabase
                .from("survey_responses")
                .select("id_badge_number");

            if (responsesError) throw responsesError;

            // Create a set of submitted ID badge numbers for verification
            const submittedIds = new Set(responsesData?.map(r => r.id_badge_number) || []);

            // Sync database status with actual survey responses
            const employeesWithStatus = (employeesData || []).map(employee => {
                const actualStatus = submittedIds.has(employee.id_badge_number) ? 'Submitted' : 'Not Submitted';
                
                // If database status doesn't match actual status, update it
                if (employee.status !== actualStatus) {
                    // Update in background without blocking UI
                    supabase
                        .from('employees')
                        .update({ status: actualStatus })
                        .eq('id', employee.id)
                        .then(({ error }) => {
                            if (error) console.error('Error syncing employee status:', error);
                        });
                }
                
                return {
                    ...employee,
                    status: actualStatus
                };
            });

            setEmployees(employeesWithStatus);
            setFilteredEmployees(employeesWithStatus);
        } catch (error) {
            console.error("Error fetching employees:", error);
            toast({
                title: "Error",
                description: "Failed to fetch employees",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch users from admin_users table
    const fetchUsers = async () => {
        console.log("Starting fetchUsers...");
        try {
            const { data: usersData, error } = await supabase
            .from("admin_users")
            .select("id, username, email, password, role, status, last_login, created_at")
            .order("created_at", { ascending: false });

            console.log("Supabase response:", { usersData, error });

            if (error) {
                console.error("Error fetching users:", error);
                setUsers([]);
                return;
            }

            // Format users data with masked passwords
            const formattedUsers = (usersData || []).map(user => ({
                ...user,
                password: "••••••••", // Mask password for display
                last_login: user.last_login ? formatRelativeTime(user.last_login) : "Never"
            }));

            console.log("Formatted users:", formattedUsers);
            setUsers(formattedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive",
            });
        }
    };

    // Helper function to format relative time
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    };

    useEffect(() => {
        fetchEmployees();
        fetchUsers();
    }, []);

    // Filter and sort employees
    useEffect(() => {
        let filtered = employees;

        if (searchTerm) {
            filtered = filtered.filter(
                (emp) =>
                    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.id_badge_number.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedDepartment !== "all") {
            filtered = filtered.filter((emp) => emp.department === selectedDepartment);
        }

        if (selectedLevel !== "all") {
            filtered = filtered.filter((emp) => emp.level === selectedLevel);
        }

        if (submissionFilter !== "all") {
            filtered = filtered.filter((emp) => emp.status === submissionFilter);
        }

        // Apply sorting
        if (sortField) {
            filtered.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Handle date fields
                if (sortField === 'created_at') {
                    aValue = new Date(aValue as string).getTime();
                    bValue = new Date(bValue as string).getTime();
                }

                // Handle string fields (case-insensitive)
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredEmployees(filtered);
    }, [employees, searchTerm, selectedDepartment, selectedLevel, submissionFilter, sortField, sortDirection]);

    const handleLogout = () => {
        sessionStorage.removeItem("adminAuthenticated");
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out",
        });
        navigate("/login");
    };

    const confirmLogout = () => {
        setLogoutDialogOpen(false);
        handleLogout();
    };

    // Sorting functions
    const handleSort = (field: keyof Employee) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: keyof Employee) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortDirection === 'asc' ? 
            <ArrowUp className="ml-2 h-4 w-4" /> : 
            <ArrowDown className="ml-2 h-4 w-4" />;
    };

    const getUserSortIcon = (field: keyof User) => {
        if (userSortField !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return userSortDirection === 'asc' ? 
            <ArrowUp className="ml-2 h-4 w-4" /> : 
            <ArrowDown className="ml-2 h-4 w-4" />;
    };

    // User sorting functions
    const handleUserSort = (field: keyof User) => {
        if (userSortField === field) {
            setUserSortDirection(userSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setUserSortField(field);
            setUserSortDirection('asc');
        }
    };

    const resetForm = () => {
        setFormData({
            id_badge_number: "",
            name: "",
            department: "",
            level: "Non Managerial",
            email: "",
        });
        setEditingEmployee(null);
    };

    const openDialog = (employee?: Employee) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                id_badge_number: employee.id_badge_number,
                name: employee.name,
                department: employee.department,
                level: employee.level || "Non Managerial",
                email: employee.email || "",
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    // User form functions
    const resetUserForm = () => {
        setUserFormData({
            username: "",
            email: "",
            password: "",
            role: "Admin",
            status: "Active",
        });
        setEditingUser(null);
    };

    const openUserDialog = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setUserFormData({
                username: user.username || "",
                email: user.email,
                password: "", // Don't populate password for security
                role: user.role,
                status: user.status,
            });
        } else {
            resetUserForm();
        }
        setIsUserDialogOpen(true);
    };

    const closeUserDialog = () => {
        setIsUserDialogOpen(false);
        resetUserForm();
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!userFormData.username.trim()) {
            toast({
                title: "Validation Error",
                description: "Username is required",
                variant: "destructive",
            });
            return;
        }
        
        if (!userFormData.email.trim()) {
            toast({
                title: "Validation Error",
                description: "Email is required",
                variant: "destructive",
            });
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userFormData.email)) {
            toast({
                title: "Validation Error",
                description: "Please enter a valid email address",
                variant: "destructive",
            });
            return;
        }
        
        // For new users, validate password requirements
        if (!editingUser) {
            if (!userFormData.password.trim()) {
                toast({
                    title: "Validation Error",
                    description: "Password is required for new users",
                    variant: "destructive",
                });
                return;
            }
            
            const passwordValidation = validatePasswordStrength(userFormData.password);
            if (passwordValidation.strength === 'weak') {
                toast({
                    title: "Weak Password",
                    description: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
                    variant: "destructive",
                });
                return;
            }
        }
        
        // For existing users, validate password if provided
        if (editingUser && userFormData.password.trim()) {
            const passwordValidation = validatePasswordStrength(userFormData.password);
            if (passwordValidation.strength === 'weak') {
                toast({
                    title: "Weak Password",
                    description: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
                    variant: "destructive",
                });
                return;
            }
        }
        
        try {
            if (editingUser) {
                // Check for duplicate username/email (excluding current user)
                const { data: existingUsers } = await supabase
                    .from('admin_users')
                    .select('id, username, email')
                    .neq('id', editingUser.id)
                    .or(`username.eq.${userFormData.username},email.eq.${userFormData.email}`);
                
                if (existingUsers && existingUsers.length > 0) {
                    const duplicateUsername = existingUsers.find(u => u.username === userFormData.username);
                    const duplicateEmail = existingUsers.find(u => u.email === userFormData.email);
                    
                    if (duplicateUsername) {
                        toast({
                            title: "Validation Error",
                            description: "Username already exists",
                            variant: "destructive",
                        });
                        return;
                    }
                    
                    if (duplicateEmail) {
                        toast({
                            title: "Validation Error",
                            description: "Email already exists",
                            variant: "destructive",
                        });
                        return;
                    }
                }
                
                // Update existing user
                // Normalize role and status values to lowercase to prevent check constraint violations
                const normalizedRole = userFormData.role.toLowerCase();
                const normalizedStatus = userFormData.status.toLowerCase();
                
                // Validate normalized values
                const allowedRoles = ['admin', 'manager', 'viewer'];
                const allowedStatuses = ['active', 'inactive'];
                
                if (!allowedRoles.includes(normalizedRole)) {
                    toast({
                        title: "Validation Error",
                        description: `Invalid role. Allowed values: ${allowedRoles.join(', ')}`,
                        variant: "destructive",
                    });
                    return;
                }
                
                if (!allowedStatuses.includes(normalizedStatus)) {
                    toast({
                        title: "Validation Error",
                        description: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
                        variant: "destructive",
                    });
                    return;
                }
                
                const updateData: any = {
                    username: userFormData.username,
                    email: userFormData.email,
                    role: normalizedRole,
                    status: normalizedStatus,
                };
                
                // Only include password if it's provided
                if (userFormData.password.trim()) {
                    updateData.password = userFormData.password;
                }
                
                const { error } = await supabase
                    .from('admin_users')
                    .update(updateData)
                    .eq('id', editingUser.id);
                
                if (error) throw error;
                
                toast({
                    title: "Success",
                    description: "User updated successfully",
                });
            } else {
                // Check for duplicate username/email for new users
                const { data: existingUsers } = await supabase
                    .from('admin_users')
                    .select('username, email')
                    .or(`username.eq.${userFormData.username},email.eq.${userFormData.email}`);
                
                if (existingUsers && existingUsers.length > 0) {
                    const duplicateUsername = existingUsers.find(u => u.username === userFormData.username);
                    const duplicateEmail = existingUsers.find(u => u.email === userFormData.email);
                    
                    if (duplicateUsername) {
                        toast({
                            title: "Validation Error",
                            description: "Username already exists",
                            variant: "destructive",
                        });
                        return;
                    }
                    
                    if (duplicateEmail) {
                        toast({
                            title: "Validation Error",
                            description: "Email already exists",
                            variant: "destructive",
                        });
                        return;
                    }
                }
                
                // Create new user
                // Normalize role and status values to lowercase to prevent check constraint violations
                const normalizedRole = userFormData.role.toLowerCase();
                const normalizedStatus = userFormData.status.toLowerCase();
                
                // Validate normalized values
                const allowedRoles = ['admin', 'manager', 'viewer'];
                const allowedStatuses = ['active', 'inactive'];
                
                if (!allowedRoles.includes(normalizedRole)) {
                    toast({
                        title: "Validation Error",
                        description: `Invalid role. Allowed values: ${allowedRoles.join(', ')}`,
                        variant: "destructive",
                    });
                    return;
                }
                
                if (!allowedStatuses.includes(normalizedStatus)) {
                    toast({
                        title: "Validation Error",
                        description: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
                        variant: "destructive",
                    });
                    return;
                }
                
                console.log('Creating user with data:', {
                    username: userFormData.username,
                    email: userFormData.email,
                    role: normalizedRole,
                    status: normalizedStatus
                });
                
                const { data, error } = await supabase
                    .from('admin_users')
                    .insert({
                        username: userFormData.username,
                        email: userFormData.email,
                        password: userFormData.password,
                        role: normalizedRole,
                        status: normalizedStatus,
                        created_at: new Date().toISOString(),
                        last_login: null
                    })
                    .select();
                
                console.log('Insert result:', { data, error });
                
                if (error) {
                    console.error('Supabase error:', error);
                    
                    // Handle specific database errors
                    if (error.code === '23505') { // Unique constraint violation
                        if (error.message.includes('username')) {
                            toast({
                                title: "Error",
                                description: "Username already exists",
                                variant: "destructive",
                            });
                        } else if (error.message.includes('email')) {
                            toast({
                                title: "Error",
                                description: "Email already exists",
                                variant: "destructive",
                            });
                        } else {
                            toast({
                                title: "Error",
                                description: "User with this information already exists",
                                variant: "destructive",
                            });
                        }
                        return;
                    }
                    
                    throw error;
                }
                
                toast({
                    title: "Success",
                    description: "User created successfully",
                });
            }
            
            closeUserDialog();
            fetchUsers(); // Refresh the users list
        } catch (error) {
            console.error('Error saving user:', error);
            toast({
                title: "Error",
                description: editingUser ? "Failed to update user" : "Failed to create user",
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('admin_users')
                .delete()
                .eq('id', userId);
            
            if (error) throw error;
            
            toast({
                title: "Success",
                description: "User deleted successfully",
            });
            
            fetchUsers(); // Refresh the users list
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: "Error",
                description: "Failed to delete user",
                variant: "destructive",
            });
        }
    };

    // Password strength validation
    const validatePasswordStrength = (password: string) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const score = Object.values(requirements).filter(Boolean).length;
        const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';
        
        return { requirements, score, strength };
    };

    const getPasswordStrengthColor = (strength: string) => {
        switch (strength) {
            case 'weak': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'strong': return 'text-green-600';
            default: return 'text-gray-400';
        }
    };

    const getPasswordStrengthBg = (strength: string) => {
        switch (strength) {
            case 'weak': return 'bg-red-200';
            case 'medium': return 'bg-yellow-200';
            case 'strong': return 'bg-green-200';
            default: return 'bg-gray-200';
        }
    };

    const passwordValidation = validatePasswordStrength(userFormData.password);

    // Bulk selection functions
    const handleSelectEmployee = (employeeId: string) => {
        const newSelected = new Set(selectedEmployees);
        if (newSelected.has(employeeId)) {
            newSelected.delete(employeeId);
        } else {
            newSelected.add(employeeId);
        }
        setSelectedEmployees(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedEmployees.size === filteredEmployees.length) {
            setSelectedEmployees(new Set());
        } else {
            setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)));
        }
    };

    const clearSelection = () => {
        setSelectedEmployees(new Set());
    };

    const handleBulkDelete = async () => {
        try {
            const selectedIds = Array.from(selectedEmployees);
            
            const { error } = await supabase
                .from('employees')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            // Update local state
            setEmployees(prev => prev.filter(emp => !selectedEmployees.has(emp.id)));
            clearSelection();
            setIsBulkDeleteOpen(false);

            toast({
                title: "Success",
                description: `Successfully deleted ${selectedIds.length} employee${selectedIds.length > 1 ? 's' : ''}`,
            });
        } catch (error) {
            console.error('Error deleting employees:', error);
            toast({
                title: "Error",
                description: "Failed to delete employees. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleBulkEdit = async () => {
        try {
            const selectedIds = Array.from(selectedEmployees);
            const updateData: any = {};
            
            // Only include fields that have values
            if (bulkFormData.department) {
                updateData.department = bulkFormData.department;
            }
            if (bulkFormData.level) {
                updateData.level = bulkFormData.level;
            }
            if (bulkFormData.email) {
                updateData.email = bulkFormData.email;
            }

            if (Object.keys(updateData).length === 0) {
                toast({
                    title: "Validation Error",
                    description: "Please select at least one field to update",
                    variant: "destructive",
                });
                return;
            }

            const { error } = await supabase
                .from('employees')
                .update(updateData)
                .in('id', selectedIds);

            if (error) throw error;

            // If level is being updated, sync survey responses for affected employees
            if (updateData.level) {
                const affectedEmployees = employees.filter(emp => selectedEmployees.has(emp.id));
                const badgeNumbers = affectedEmployees.map(emp => emp.id_badge_number);
                
                if (badgeNumbers.length > 0) {
                    const { error: syncError } = await supabase
                        .from('survey_responses')
                        .update({ level: updateData.level })
                        .in('id_badge_number', badgeNumbers);
                    
                    if (syncError) {
                        console.error('Error syncing survey response levels in bulk:', syncError);
                        // Don't throw error here, just log it as it's not critical
                    }
                }
            }

            // Update local state
            setEmployees(prev => prev.map(emp => 
                selectedEmployees.has(emp.id) 
                    ? { ...emp, ...updateData }
                    : emp
            ));
            
            clearSelection();
            setIsBulkEditOpen(false);
            setBulkFormData({ department: "", level: "", email: "" });

            toast({
                title: "Success",
                description: `Successfully updated ${selectedIds.length} employee${selectedIds.length > 1 ? 's' : ''}`,
            });
        } catch (error) {
            console.error('Error updating employees:', error);
            toast({
                title: "Error",
                description: "Failed to update employees. Please try again.",
                variant: "destructive",
            });
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name.trim()) {
            toast({
                title: "Validation Error",
                description: "Employee name is required",
                variant: "destructive",
            });
            return;
        }

        if (!formData.department) {
            toast({
                title: "Validation Error",
                description: "Department selection is required",
                variant: "destructive",
            });
            return;
        }

        // Validate ID badge number format
        if (!formData.id_badge_number.startsWith("MTI")) {
            toast({
                title: "Invalid ID Badge",
                description: "ID Badge Number must start with 'MTI'",
                variant: "destructive",
            });
            return;
        }

        try {
            if (editingEmployee) {
                // Update employee
                const { error } = await supabase
                    .from("employees")
                    .update({
                        id_badge_number: formData.id_badge_number.toUpperCase(),
                        name: formData.name,
                        department: formData.department,
                        level: formData.level,
                        email: formData.email,
                    })
                    .eq("id", editingEmployee.id);

                if (error) throw error;

                // If level changed, sync existing survey responses
                if (editingEmployee.level !== formData.level) {
                    const { error: syncError } = await supabase
                        .from("survey_responses")
                        .update({ level: formData.level })
                        .eq("id_badge_number", formData.id_badge_number.toUpperCase());
                    
                    if (syncError) {
                        console.error('Error syncing survey response levels:', syncError);
                        // Don't throw error here, just log it as it's not critical
                    }
                }

                toast({
                    title: "Success",
                    description: "Employee updated successfully",
                });
            } else {
                // Create new employee
                const { error } = await supabase
                    .from("employees")
                    .insert({
                        id_badge_number: formData.id_badge_number.toUpperCase(),
                        name: formData.name,
                        department: formData.department,
                        level: formData.level,
                        email: formData.email,
                    });

                if (error) {
                    if (error.code === "23505") {
                        toast({
                            title: "Error",
                            description: "ID Badge Number already exists",
                            variant: "destructive",
                        });
                        return;
                    }
                    throw error;
                }

                toast({
                    title: "Success",
                    description: "Employee created successfully",
                });
            }

            closeDialog();
            fetchEmployees();
        } catch (error) {
            console.error("Error saving employee:", error);
            toast({
                title: "Error",
                description: "Failed to save employee",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (employee: Employee) => {
        try {
            console.log("🗑️ Starting deletion for employee:", employee.id_badge_number);
            
            // First, delete any survey responses associated with this employee
            const { data: surveyData, error: surveyError } = await supabase
                .from("survey_responses")
                .delete()
                .eq("id_badge_number", employee.id_badge_number)
                .select();

            if (surveyError) {
                console.error("Error deleting survey responses:", surveyError);
                throw surveyError; // Don't continue if survey deletion fails
            }

            console.log("📊 Deleted survey responses:", surveyData?.length || 0);

            // Then delete the employee record
            const { error: employeeError } = await supabase
                .from("employees")
                .delete()
                .eq("id", employee.id);

            if (employeeError) throw employeeError;

            console.log("👤 Employee deleted successfully");

            toast({
                title: "Success",
                description: `Employee and ${surveyData?.length || 0} associated survey responses deleted successfully`,
            });

            // Dispatch custom event to notify other components about the data change
            console.log("📡 Dispatching surveyDataChanged event");
            window.dispatchEvent(new CustomEvent('surveyDataChanged'));
            
            fetchEmployees();
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast({
                title: "Error",
                description: "Failed to delete employee",
                variant: "destructive",
            });
        }
    };

    // Excel Export Function
    const handleExportToExcel = () => {
        try {
            // Prepare data for export
            const exportData = employees.map(emp => ({
                'ID Badge Number': emp.id_badge_number,
                'Employee Name': emp.name,
                'Email': emp.email || '',
                'Department': emp.department,
                'Level': emp.level || 'Non Managerial',
                'Created Date': new Date(emp.created_at).toLocaleDateString(),
                'Updated Date': new Date(emp.updated_at).toLocaleDateString()
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Set column widths
            const colWidths = [
                { wch: 15 }, // ID Badge Number
                { wch: 25 }, // Employee Name
                { wch: 30 }, // Email
                { wch: 25 }, // Department
                { wch: 15 }, // Level
                { wch: 12 }, // Created Date
                { wch: 12 }  // Updated Date
            ];
            ws['!cols'] = colWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Employees');

            // Generate Excel file and save
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const fileName = `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            saveAs(data, fileName);

            toast({
                title: "Export Successful",
                description: `Employee data exported to ${fileName}`,
            });
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast({
                title: "Export Failed",
                description: "Failed to export employee data",
                variant: "destructive",
            });
        }
    };

    // Download Template Function
    const handleDownloadTemplate = () => {
        try {
            // Create empty template data with headers only
            const templateData = [
                {
                    'ID Badge Number': '',
                    'Employee Name': '',
                    'Email': '',
                    'Department': '',
                    'Level': ''
                }
            ];

            // Create instructions data
            const instructionsData = [
                { 'Instructions': 'HOW TO USE THIS TEMPLATE:' },
                { 'Instructions': '' },
                { 'Instructions': '1. Use the "Employee Template" sheet to add your data' },
                { 'Instructions': '2. Fill in the empty template with your employee data' },
                { 'Instructions': '3. Fill in ALL five columns for each employee:' },
                { 'Instructions': '' },
                { 'Instructions': 'COLUMN REQUIREMENTS:' },
                { 'Instructions': '' },
                { 'Instructions': 'ID Badge Number:' },
                { 'Instructions': '  - Must start with "MTI" (e.g., MTI001, MTI123)' },
                { 'Instructions': '  - Must be unique (no duplicates)' },
                { 'Instructions': '' },
                { 'Instructions': 'Employee Name:' },
                { 'Instructions': '  - Full name of the employee' },
                { 'Instructions': '  - Cannot be empty' },
                { 'Instructions': '' },
                { 'Instructions': 'Department:' },
                { 'Instructions': '  - Must be EXACTLY one of these:' },
                { 'Instructions': '    • Environmental Department' },
                { 'Instructions': '    • Finance Department' },
                { 'Instructions': '    • Human Resources' },
                { 'Instructions': '    • External Affair Department' },
                { 'Instructions': '    • Supply Chain Management' },
                { 'Instructions': '    • Personal Data' },
                { 'Instructions': '    • ICT Department' },
                { 'Instructions': '    • OHS Department' },
                { 'Instructions': '' },
                { 'Instructions': 'Level:' },
                { 'Instructions': '  - Must be either "Managerial" or "Non Managerial"' },
                { 'Instructions': '  - Case sensitive - use exact spelling' },
                { 'Instructions': '' },
                { 'Instructions': 'IMPORTANT NOTES:' },
                { 'Instructions': '• Do not change column headers' },
                { 'Instructions': '• Do not leave any cells empty' },
                { 'Instructions': '• Fill in all required fields before importing' },
                { 'Instructions': '• Save as Excel (.xlsx) format' }
            ];

            // Create workbook and worksheets
            const wb = XLSX.utils.book_new();
            
            // Add instructions sheet
            const instructionsWs = XLSX.utils.json_to_sheet(instructionsData);
            instructionsWs['!cols'] = [{ wch: 60 }];
            XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
            
            // Add template sheet
            const ws = XLSX.utils.json_to_sheet(templateData);
            const colWidths = [
                { wch: 20 }, // ID Badge Number
                { wch: 25 }, // Employee Name
                { wch: 30 }, // Email
                { wch: 30 }, // Department
                { wch: 15 }  // Level
            ];
            ws['!cols'] = colWidths;
            XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');

            // Generate Excel file and save
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            saveAs(data, 'employee_import_template.xlsx');

            toast({
                title: "Template Downloaded",
                description: "Excel template with detailed instructions downloaded successfully",
            });
        } catch (error) {
            console.error("Error downloading template:", error);
            toast({
                title: "Download Failed",
                description: "Failed to download template",
                variant: "destructive",
            });
        }
    };

    // Excel Import Function
    const handleImportFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                console.log("Raw Excel data:", jsonData);

                if (!jsonData || jsonData.length === 0) {
                    toast({
                        title: "Empty File",
                        description: "The Excel file appears to be empty or has no data rows.",
                        variant: "destructive",
                    });
                    setIsImporting(false);
                    return;
                }

                // Validate and process imported data
                const validEmployees: Array<{
                    id_badge_number: string;
                    name: string;
                    department: string;
                    level: string;
                }> = [];

                const errors: string[] = [];
                const duplicatesInFile: string[] = [];
                const seenIds = new Set<string>();

                jsonData.forEach((row: any, index: number) => {
                    const rowNum = index + 2; // Excel row number (accounting for header)
                    
                    console.log(`Processing row ${rowNum}:`, row);
                    
                    // Get all possible column variations
                    const possibleIdColumns = ['ID Badge Number', 'Employee ID', 'ID', 'Badge', 'Employee', 'ID Badge', 'Badge Number'];
                    const possibleNameColumns = ['Employee Name', 'Name', 'Full Name', 'Employee', 'Full_Name', 'EmployeeName'];
                    const possibleEmailColumns = ['Email', 'Email Address', 'E-mail', 'Employee Email', 'Work Email'];
                    const possibleDeptColumns = ['Department', 'Dept', 'Department Name', 'Dep'];
                    const possibleLevelColumns = ['Level', 'Employee Level', 'Position Level', 'Management Level'];

                    // Find the actual values
                    let idBadge = '';
                    let name = '';
                    let email = '';
                    let department = '';
                    let level = '';

                    // Try to find ID Badge
                    for (const col of possibleIdColumns) {
                        if (row[col] && String(row[col]).trim()) {
                            idBadge = String(row[col]).trim();
                            break;
                        }
                    }

                    // Try to find Name
                    for (const col of possibleNameColumns) {
                        if (row[col] && String(row[col]).trim()) {
                            name = String(row[col]).trim();
                            break;
                        }
                    }

                    // Try to find Email
                    for (const col of possibleEmailColumns) {
                        if (row[col] && String(row[col]).trim()) {
                            email = String(row[col]).trim();
                            break;
                        }
                    }

                    // Try to find Department
                    for (const col of possibleDeptColumns) {
                        if (row[col] && String(row[col]).trim()) {
                            department = String(row[col]).trim();
                            break;
                        }
                    }

                    // Try to find Level
                    for (const col of possibleLevelColumns) {
                        if (row[col] && String(row[col]).trim()) {
                            level = String(row[col]).trim();
                            break;
                        }
                    }

                    // Default level if not provided
                    if (!level) {
                        level = 'Non Managerial';
                    }

                    console.log(`Row ${rowNum} extracted:`, { idBadge, name, email, department, level });

                    // Skip completely empty rows
                    if (!idBadge && !name && !department) {
                        console.log(`Skipping empty row ${rowNum}`);
                        return;
                    }

                    // Check for required fields
                    if (!idBadge) {
                        errors.push(`Row ${rowNum}: Missing ID Badge Number`);
                        return;
                    }
                    if (!name) {
                        errors.push(`Row ${rowNum}: Missing Employee Name`);
                        return;
                    }
                    if (!department) {
                        errors.push(`Row ${rowNum}: Missing Department`);
                        return;
                    }

                    // Validate level
                    if (level && !['Managerial', 'Non Managerial'].includes(level)) {
                        errors.push(`Row ${rowNum}: Level must be either 'Managerial' or 'Non Managerial', got '${level}'`);
                        return;
                    }

                    // Validate ID badge format
                    const formattedIdBadge = String(idBadge).toUpperCase().trim();
                    if (!formattedIdBadge.startsWith('MTI')) {
                        errors.push(`Row ${rowNum}: ID Badge '${formattedIdBadge}' must start with 'MTI' (e.g., MTI001, MTI123)`);
                        return;
                    }

                    // Check for duplicates within the file
                    if (seenIds.has(formattedIdBadge)) {
                        duplicatesInFile.push(`Row ${rowNum}: Duplicate ID Badge '${formattedIdBadge}' found in file`);
                        return;
                    }
                    seenIds.add(formattedIdBadge);

                    // Validate department - be more flexible with department names
                    const trimmedDepartment = String(department).trim();
                    const departmentMap: { [key: string]: string } = {
                        // Environment mappings
                        'Environment': 'Environment',
                        'Environmental': 'Environment',
                        'Environmental Department': 'Environment',
                        'Environmental Dept': 'Environment',
                        'Env': 'Environment',
                        
                        // External Affair mappings
                        'External Affair': 'External Affair',
                        'External Affairs': 'External Affair',
                        'External Affair Department': 'External Affair',
                        'External Affairs Department': 'External Affair',
                        'EA': 'External Affair',
                        
                        // Finance mappings
                        'Finance': 'Finance',
                        'Finance Department': 'Finance',
                        'Finance Dept': 'Finance',
                        'Fin': 'Finance',
                        
                        // Human Resources mappings
                        'HR': 'Human Resources',
                        'Human Resource': 'Human Resources',
                        'Human Resources': 'Human Resources',
                        'HR Dept': 'Human Resources',
                        
                        // Maintenance mappings
                        'Maintenance': 'Maintenance',
                        'Maintenance Department': 'Maintenance',
                        'Maintenance Dept': 'Maintenance',
                        'Maint': 'Maintenance',
                        
                        // Management mappings
                        'Management': 'Management',
                        'Management Department': 'Management',
                        'Management Dept': 'Management',
                        'Mgmt': 'Management',
                        
                        // Occupational Health and Safety mappings
                        'OHS': 'Occupational Health and Safety',
                        'OHS Department': 'Occupational Health and Safety',
                        'OHS Dept': 'Occupational Health and Safety',
                        'Occupational Health': 'Occupational Health and Safety',
                        'Occupational Health and Safety': 'Occupational Health and Safety',
                        'Safety': 'Occupational Health and Safety',
                        'Health and Safety': 'Occupational Health and Safety',
                        
                        // Pyrite Plant mappings
                        'Pyrite Plant': 'Pyrite Plant',
                        'Pyrite': 'Pyrite Plant',
                        'Pyrite Plant Department': 'Pyrite Plant',
                        'Pyrite Dept': 'Pyrite Plant',
                        
                        // Supply Chain Management mappings
                        'Supply Chain': 'Supply Chain Management',
                        'Supply Chain Management': 'Supply Chain Management',
                        'SCM': 'Supply Chain Management',
                        'Supply': 'Supply Chain Management',
                        'Supply Chain Dept': 'Supply Chain Management'
                    };

                    const mappedDepartment = departmentMap[trimmedDepartment] || trimmedDepartment;
                    
                    if (!departments.includes(mappedDepartment)) {
                        errors.push(`Row ${rowNum}: Invalid department '${trimmedDepartment}'. Valid departments: ${departments.join(', ')}`);
                        return;
                    }

                    validEmployees.push({
                        id_badge_number: formattedIdBadge,
                        name: String(name).trim(),
                        department: mappedDepartment,
                        level: level,
                        email: email
                    });

                    console.log(`Row ${rowNum} validated successfully:`, {
                        id_badge_number: formattedIdBadge,
                        name: String(name).trim(),
                        department: mappedDepartment,
                        level: level,
                        email: email
                    });
                });

                console.log("Validation results:", {
                    validEmployees: validEmployees.length,
                    errors: errors.length,
                    duplicatesInFile: duplicatesInFile.length
                });

                // Combine all errors
                const allErrors = [...errors, ...duplicatesInFile];

                if (allErrors.length > 0) {
                    // Show only first 10 errors in toast, rest in console
                    const displayErrors = allErrors.slice(0, 10);
                    const remainingCount = allErrors.length - 10;
                    
                    toast({
                        title: "Import Validation Errors",
                        description: `${allErrors.length} errors found. ${remainingCount > 0 ? `Showing first 10, check console for all errors.` : 'Check console for details.'}`,
                        variant: "destructive",
                    });
                    
                    console.error("Import validation errors:", allErrors);
                    console.error("First 10 errors:", displayErrors);
                    
                    setIsImporting(false);
                    return;
                }

                if (validEmployees.length === 0) {
                    toast({
                        title: "No Valid Data",
                        description: "No valid employee records found in the Excel file",
                        variant: "destructive",
                    });
                    setIsImporting(false);
                    return;
                }

                console.log("Proceeding with database operations for", validEmployees.length, "employees");

                // Check for existing employees in database before inserting
                const existingIds = validEmployees.map(emp => emp.id_badge_number);
                const { data: existingEmployees } = await supabase
                    .from('employees')
                    .select('id_badge_number')
                    .in('id_badge_number', existingIds);

                const existingIdSet = new Set(existingEmployees?.map(emp => emp.id_badge_number) || []);
                const newEmployees = validEmployees.filter(emp => !existingIdSet.has(emp.id_badge_number));
                const duplicateEmployees = validEmployees.filter(emp => existingIdSet.has(emp.id_badge_number));

                console.log("Database check results:", {
                    newEmployees: newEmployees.length,
                    duplicateEmployees: duplicateEmployees.length
                });

                let successCount = 0;

                // Insert new employees
                if (newEmployees.length > 0) {
                    console.log("Inserting new employees:", newEmployees);
                    
                    const { data: insertedData, error } = await supabase
                        .from('employees')
                        .insert(newEmployees)
                        .select();

                    if (error) {
                        console.error("Database insert error:", error);
                        throw error;
                    } else {
                        successCount = newEmployees.length;
                        console.log("Successfully inserted:", insertedData);
                    }
                }

                // Report results
                let message = "";
                if (successCount > 0) {
                    message += `Successfully imported ${successCount} new employees. `;
                }
                if (duplicateEmployees.length > 0) {
                    message += `Skipped ${duplicateEmployees.length} duplicate ID badges: ${duplicateEmployees.map(emp => emp.id_badge_number).join(', ')}`;
                }

                if (successCount > 0) {
                    toast({
                        title: "Import Completed",
                        description: message,
                    });
                    fetchEmployees(); // Refresh the employee list
                } else if (duplicateEmployees.length > 0) {
                    toast({
                        title: "Import Completed",
                        description: "All employees already exist in the database",
                        variant: "destructive",
                    });
                }

            } catch (error) {
                console.error("Error importing Excel file:", error);
                toast({
                    title: "Import Failed",
                    description: `Failed to import Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    variant: "destructive",
                });
            } finally {
                setIsImporting(false);
                // Reset file input
                event.target.value = '';
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 flex flex-col`}>
                <div className="flex items-center justify-between h-20 px-6 border-b flex-shrink-0 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <img src={mtiLogo} alt="MTI Logo" className="h-8 w-auto" />
            </div>
            <div className="text-white">
              <div className="text-lg font-bold">Employee Satisfaction</div>
              <div className="text-sm opacity-90">Survey System</div>
            </div>
          </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white hover:bg-white/20"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
                        {/* 1. Employee */}
                        <button
                            onClick={() => setActiveMenuItem("dashboard")}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                                activeMenuItem === "dashboard"
                                    ? "text-purple-600 bg-purple-50 border-l-4 border-purple-600 shadow-md"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
                            }`}
                        >
                            <LayoutDashboard className="mr-3 h-5 w-5" />
                            Employee
                        </button>
                        
                        {/* 2. Submission */}
                        <button
                            onClick={() => {
                                setActiveMenuItem("submission");
                                navigate("/submission");
                            }}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                                activeMenuItem === "submission"
                                    ? "text-purple-600 bg-purple-50 border-l-4 border-purple-600 shadow-md"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
                            }`}
                        >
                            <FileText className="mr-3 h-5 w-5" />
                            Submission
                        </button>
                        
                        {/* 3. User Management */}
                        <button
                            onClick={() => {
                                setActiveMenuItem("user-management");
                                navigate("/user-management");
                            }}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                                activeMenuItem === "user-management"
                                    ? "text-purple-600 bg-purple-50 border-l-4 border-purple-600 shadow-md"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
                            }`}
                        >
                            <Users className="mr-3 h-5 w-5" />
                            User Management
                        </button>
                        
                        {/* 4. Results Menu with Sub-items */}
                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    setResultsExpanded(!resultsExpanded);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                                    activeMenuItem.includes("results")
                                        ? "text-purple-600 bg-purple-50 border-l-4 border-purple-600 shadow-md"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm border-l-4 border-transparent"
                                }`}
                            >
                                <div className="flex items-center">
                                    <BarChart3 className="mr-3 h-5 w-5" />
                                    Results
                                </div>
                                {resultsExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                            
                            {/* Sub-menu items */}
                            {resultsExpanded && (
                                <div className="ml-4 mt-2 space-y-1 border-l-2 border-purple-100 pl-4">
                                    <button
                                        onClick={() => {
                                            setActiveMenuItem("results-managerial");
                                            navigate("/results/managerial");
                                        }}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                            activeMenuItem === "results-managerial"
                                                ? "text-purple-600 bg-purple-50 shadow-sm"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Shield className="mr-3 h-4 w-4" />
                                        Managerial
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveMenuItem("results-non-managerial");
                                            navigate("/results/non-managerial");
                                        }}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                            activeMenuItem === "results-non-managerial"
                                                ? "text-purple-600 bg-purple-50 shadow-sm"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Users className="mr-3 h-4 w-4" />
                                        Non Managerial
                                    </button>
                                </div>
                            )}
                        </div>
                </nav>
                
                {/* Logout Button at Bottom */}
                <div className="p-3 border-t flex-shrink-0">
                    <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to logout? You will need to login again to access the admin dashboard.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmLogout}>
                                    Logout
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 bg-white shadow-sm border-b z-30">
                    <div className="w-full px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                                <div className="lg:flex items-center space-x-4 hidden">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            {activeMenuItem === "dashboard" && (
                                                <>
                                                    <Shield className="h-6 w-6 text-purple-600" />
                                                    Employee Dashboard
                                                </>
                                            )}
                                            {activeMenuItem === "submission" && (
                                                <>
                                                    <FileText className="h-6 w-6 text-purple-600" />
                                                    Survey Submission Status
                                                </>
                                            )}
                                            {activeMenuItem === "user-management" && (
                                <>
                                    <Users className="h-6 w-6 text-purple-600" />
                                    User Management
                                </>
                            )}
                                        </h1>
                                        <p className="text-gray-600">
                                            {activeMenuItem === "dashboard" && "Employee Management System"}
                            {activeMenuItem === "submission" && "Survey Completion Tracking"}
                            {activeMenuItem === "user-management" && "Manage user accounts and permissions"}
                                        </p>
                                    </div>
                                </div>
                                <div className="lg:hidden">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {activeMenuItem === "dashboard" && "Employee"}
                        {activeMenuItem === "submission" && "Survey Status"}
                        {activeMenuItem === "user-management" && "User Management"}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full p-6 pt-24">
                {/* Stats Cards */}
                {activeMenuItem === "dashboard" && (
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">Total Employees</p>
                                            <p className="text-2xl font-bold text-blue-900">{employees.length}</p>
                                        </div>
                                        <Users className="h-8 w-8 text-blue-500" />
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Departments</p>
                                            <p className="text-2xl font-bold text-green-900">
                                                {new Set(employees.map(emp => emp.department)).size}
                                            </p>
                                        </div>
                                        <Shield className="h-8 w-8 text-green-500" />
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">Filtered Results</p>
                                            <p className="text-2xl font-bold text-purple-900">{filteredEmployees.length}</p>
                                        </div>
                                        <Search className="h-8 w-8 text-purple-500" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submission Stats Cards */}
                {activeMenuItem === "submission" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Employees</p>
                                    <p className="text-2xl font-bold text-blue-900">{employees.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Submitted</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {employees.filter(emp => emp.status === 'Submitted').length}
                                    </p>
                                </div>
                                <Shield className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Not Submitted</p>
                                    <p className="text-2xl font-bold text-red-900">
                                        {employees.filter(emp => emp.status === 'Not Submitted').length}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-red-500" />
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {employees.length > 0 
                                            ? Math.round((employees.filter(emp => emp.status === 'Submitted').length / employees.length) * 100)
                                            : 0}%
                                    </p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {activeMenuItem === "dashboard" && (
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <CardTitle className="text-xl font-semibold">Employee Management</CardTitle>
                                <div className="flex flex-wrap gap-2">
                                    {/* Download Template Button */}
                                    <Button
                                        onClick={handleDownloadTemplate}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Template
                                    </Button>

                                    {/* Export Button */}
                                    <Button
                                        onClick={handleExportToExcel}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        disabled={employees.length === 0}
                                    >
                                        <Download className="h-4 w-4" />
                                        Export Excel
                                    </Button>
                                    
                                    {/* Import Button */}
                                    <div className="relative inline-block">
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleImportFromExcel}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={isImporting}
                                        />
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 pointer-events-none"
                                            disabled={isImporting}
                                        >
                                            <Upload className="h-4 w-4" />
                                            {isImporting ? "Importing..." : "Import Excel"}
                                        </Button>
                                    </div>

                                    {/* Bulk Actions Toolbar */}
                                    {selectedEmployees.size > 0 && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                                            <span className="text-sm text-blue-700 font-medium">
                                                {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''} selected
                                            </span>
                                            <Button
                                                onClick={() => setIsBulkEditOpen(true)}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                <Edit className="h-3 w-3" />
                                                Bulk Edit
                                            </Button>
                                            <Button
                                                onClick={() => setIsBulkDeleteOpen(true)}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Bulk Delete
                                            </Button>
                                            <Button
                                                onClick={clearSelection}
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    )}

                                    {/* Add Employee Button */}
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button onClick={() => openDialog()} className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add Employee
                                            </Button>
                                         </DialogTrigger>
                                         <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {editingEmployee ? "Edit Employee" : "Add New Employee"}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="id_badge_number">ID Badge Number</Label>
                                                <Input
                                                    id="id_badge_number"
                                                    placeholder="MTI001"
                                                    value={formData.id_badge_number}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            id_badge_number: e.target.value.toUpperCase(),
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Enter full name"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, name: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="employee@company.com"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, email: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="department">Department</Label>
                                                <Select
                                                    value={formData.department}
                                                    onValueChange={(value) =>
                                                        setFormData({ ...formData, department: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map((dept) => (
                                                            <SelectItem key={dept} value={dept}>
                                                                {dept}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="level">Level</Label>
                                                <Select
                                                    value={formData.level}
                                                    onValueChange={(value) =>
                                                        setFormData({ ...formData, level: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Non Managerial">Non Managerial</SelectItem>
                                                        <SelectItem value="Managerial">Managerial</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={closeDialog}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit">
                                                    {editingEmployee ? "Update" : "Create"}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search by name or ID badge number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="max-w-sm"
                                    />
                                </div>
                                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Filter by department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Filter by level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="Managerial">Managerial</SelectItem>
                                        <SelectItem value="Non Managerial">Non Managerial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">Loading employees...</div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-md border">
                                        <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedEmployees.has(emp.id))}
                                                        onCheckedChange={handleSelectAll}
                                                        aria-label="Select all employees"
                                                    />
                                                </TableHead>
                                                <TableHead className="w-16 text-center">
                                                    No.
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('id_badge_number')}
                                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                                    >
                                                        ID Badge
                                                        {getSortIcon('id_badge_number')}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('name')}
                                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                                    >
                                                        Name
                                                        {getSortIcon('name')}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('email')}
                                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                                    >
                                                        Email
                                                        {getSortIcon('email')}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('department')}
                                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                                    >
                                                        Department
                                                        {getSortIcon('department')}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('level')}
                                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                                    >
                                                        Level
                                                        {getSortIcon('level')}
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('created_at')}
                                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                                    >
                                                        Created At
                                                        {getSortIcon('created_at')}
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentPageEmployees.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                        {filteredEmployees.length === 0 ? "No employees found" : "No employees on this page"}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                currentPageEmployees.map((employee, index) => (
                                                    <TableRow key={employee.id}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedEmployees.has(employee.id)}
                                                                onCheckedChange={() => handleSelectEmployee(employee.id)}
                                                                aria-label={`Select ${employee.name}`}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm text-gray-600">
                                                            {pagination.state.startIndex + index + 1}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {employee.id_badge_number}
                                                        </TableCell>
                                                        <TableCell>{employee.name}</TableCell>
                                                        <TableCell>{employee.email || '-'}</TableCell>
                                                        <TableCell>{employee.department}</TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                employee.level === 'Managerial' 
                                                                    ? 'bg-blue-100 text-blue-800' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {employee.level || 'Non Managerial'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(employee.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openDialog(employee)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="group relative text-red-600 hover:text-white border-red-200 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
                                                        >
                                                            <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="sm:max-w-lg border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/30 rounded-lg" />
                                                        <div className="relative z-10">
                                                            <AlertDialogHeader className="text-center pb-6">
                                                                <div className="mx-auto mb-6 relative">
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur-xl opacity-20 animate-pulse" />
                                                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 border-4 border-white shadow-lg">
                                                                        <Trash2 className="h-10 w-10 text-red-600 animate-bounce" style={{animationDuration: '2s'}} />
                                                                    </div>
                                                                </div>
                                                                <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                                                                    Delete Employee
                                                                </AlertDialogTitle>
                                                                <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-4" />
                                                                <AlertDialogDescription className="text-base text-gray-700 leading-relaxed">
                                                                    Are you sure you want to delete{' '}
                                                                    <span className="font-bold text-gray-900 px-2 py-1 bg-gray-100 rounded-md">{employee.name}</span>?
                                                                    <br /><br />
                                                                    <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-r-lg p-4 shadow-sm">
                                                                        <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                                                                        <div className="flex items-start space-x-3">
                                                                            <div className="flex-shrink-0 p-1 bg-amber-100 rounded-full">
                                                                                <Shield className="h-5 w-5 text-amber-600" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <h4 className="text-sm font-semibold text-amber-800 mb-1">⚠️ Critical Warning</h4>
                                                                                <p className="text-sm text-amber-700 leading-relaxed">
                                                                                    This action will <strong>permanently delete</strong> all survey responses associated with this employee. This operation is <strong>irreversible</strong> and cannot be undone.
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                                                                <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                                                                    <span className="mr-2">✕</span>
                                                                    Cancel
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    onClick={() => handleDelete(employee)}
                                                                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-red-500/25 focus:ring-4 focus:ring-red-500/20 order-1 sm:order-2 transition-all duration-300 hover:scale-105 font-semibold"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2 animate-pulse" />
                                                                    Delete Employee
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </div>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                            
                            {/* Pagination Controls */}
                            {filteredEmployees.length > 0 && (
                                <div className="mt-6 border-t pt-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                                        <div className="text-sm text-gray-600">
                                            Showing {pagination.state.startIndex + 1}-{Math.min(pagination.state.endIndex + 1, filteredEmployees.length)} of {filteredEmployees.length} employees
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Page {pagination.state.currentPage} of {pagination.state.totalPages}
                                        </div>
                                    </div>
                                    <Pagination
                                        currentPage={pagination.state.currentPage}
                                        totalPages={pagination.state.totalPages}
                                        onPageChange={pagination.actions.setPage}
                                        pageSize={pagination.state.pageSize}
                                        totalItems={filteredEmployees.length}
                                        onPageSizeChange={pagination.actions.setPageSize}
                                        showFirstLast={true}
                                        showPageSizeSelector={true}
                                        pageSizeOptions={[5, 10, 20, 50]}
                                        maxVisiblePages={5}
                                        className="justify-center"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* User Management */}
                {activeMenuItem === "user-management" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                User Account Management
                            </CardTitle>
                            <p className="text-gray-600">Manage admin accounts, roles, and permissions for the system</p>
                        </CardHeader>
                        <CardContent>
                            {/* Action Bar */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-full sm:w-64"
                                        />
                                    </div>
                                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                        <SelectTrigger className="w-full sm:w-48">
                                            <SelectValue placeholder="Filter by role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                            <SelectItem value="Manager">Manager</SelectItem>
                                            <SelectItem value="Viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            onClick={() => openUserDialog()}
                                            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add New User
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {editingUser ? "Edit User" : "Add New User"}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {editingUser ? "Update user account details" : "Create a new user account with password"}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleUserSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="user-username">Name</Label>
                                                <Input
                                                    id="user-username"
                                                    placeholder="Enter username"
                                                    value={userFormData.username}
                                                    onChange={(e) =>
                                                        setUserFormData({ ...userFormData, username: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="user-email">Email Address</Label>
                                                <Input
                                                    id="user-email"
                                                    type="email"
                                                    placeholder="user@company.com"
                                                    value={userFormData.email}
                                                    onChange={(e) =>
                                                        setUserFormData({ ...userFormData, email: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="user-password">Password</Label>
                                                <Input
                                                    id="user-password"
                                                    type="password"
                                                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                                                    value={userFormData.password}
                                                    onChange={(e) =>
                                                        setUserFormData({ ...userFormData, password: e.target.value })
                                                    }
                                                    required={!editingUser}
                                                />
                                                {userFormData.password && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full transition-all duration-300 ${
                                                                        passwordValidation.strength === 'weak' ? 'bg-red-500 w-1/3' :
                                                                        passwordValidation.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                                                                        'bg-green-500 w-full'
                                                                    }`}
                                                                />
                                                            </div>
                                                            <span className={`text-xs font-medium capitalize ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                                                                {passwordValidation.strength}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs space-y-1">
                                                            <div className={passwordValidation.requirements.length ? 'text-green-600' : 'text-gray-400'}>
                                                                ✓ At least 8 characters
                                                            </div>
                                                            <div className={passwordValidation.requirements.uppercase ? 'text-green-600' : 'text-gray-400'}>
                                                                ✓ One uppercase letter
                                                            </div>
                                                            <div className={passwordValidation.requirements.lowercase ? 'text-green-600' : 'text-gray-400'}>
                                                                ✓ One lowercase letter
                                                            </div>
                                                            <div className={passwordValidation.requirements.number ? 'text-green-600' : 'text-gray-400'}>
                                                                ✓ One number
                                                            </div>
                                                            <div className={passwordValidation.requirements.special ? 'text-green-600' : 'text-gray-400'}>
                                                                ✓ One special character
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="user-role">Role</Label>
                                                <Select
                                                    value={userFormData.role}
                                                    onValueChange={(value) =>
                                                        setUserFormData({ ...userFormData, role: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Admin">Admin</SelectItem>
                                                        <SelectItem value="Manager">Manager</SelectItem>
                                                        <SelectItem value="Viewer">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="user-status">Status</Label>
                                                <Select
                                                    value={userFormData.status}
                                                    onValueChange={(value) =>
                                                        setUserFormData({ ...userFormData, status: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Active">Active</SelectItem>
                                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={closeUserDialog}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit">
                                                    {editingUser ? "Update" : "Create"}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Users Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">

                                            <TableHead className="w-16 text-center">
                                                No.
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleUserSort('username')}
                                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                                >
                                                    Name
                                                    {getUserSortIcon('username')}
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleUserSort('email')}
                                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                                >
                                                    Email
                                                    {getUserSortIcon('email')}
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleUserSort('role')}
                                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                                >
                                                    Role
                                                    {getUserSortIcon('role')}
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleUserSort('status')}
                                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                                >
                                                    Status
                                                    {getUserSortIcon('status')}
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleUserSort('last_login')}
                                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                                >
                                                    Last Login
                                                    {getUserSortIcon('last_login')}
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleUserSort('created_at')}
                                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                                >
                                                    Created
                                                    {getUserSortIcon('created_at')}
                                                </Button>
                                            </TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentPageUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentPageUsers.map((user, index) => {
                                const initials = user.username ? user.username.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
                                const roleColors = {
                                    'Admin': 'bg-blue-100 text-blue-800',
                                    'Manager': 'bg-purple-100 text-purple-800',
                                    'Viewer': 'bg-gray-100 text-gray-800'
                                };
                                const statusColors = {
                                    'Active': 'bg-green-100 text-green-800',
                                    'Inactive': 'bg-yellow-100 text-yellow-800',
                                    'Suspended': 'bg-red-100 text-red-800'
                                };
                                
                                return (
                                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">

                                        <TableCell className="text-center text-sm text-gray-500">
                                            {(userPagination.state.currentPage - 1) * userPagination.state.pageSize + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">{user.username || 'Unknown User'}</div>
                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-gray-900">{user.email}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
                                                                {user.role}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[user.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                                                                {user.status === 'Active' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>}
                                                                {user.status}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-gray-900">{user.last_login || 'Never'}</div>
                                                            <div className="text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-gray-500">{new Date(user.created_at).toLocaleDateString()}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openUserDialog(user)}
                                                                    className="group relative text-blue-600 hover:text-white border-blue-200 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                                                                >
                                                                    <Edit className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                                                </Button>

                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="group relative text-red-600 hover:text-white border-red-200 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <div className="flex flex-col items-center text-center space-y-4">
                                                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                                                                <Trash2 className="h-6 w-6 text-red-600" />
                                                                            </div>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                                                                                    Delete User Account
                                                                                </AlertDialogTitle>
                                                                                <AlertDialogDescription className="text-sm text-gray-500 max-w-sm">
                                                                                    Are you sure you want to delete <span className="font-medium text-gray-900">{user.name}</span>? This action cannot be undone and will permanently remove their account and all associated data.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2 w-full">
                                                                                <AlertDialogCancel className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border-gray-300 order-2 sm:order-1">
                                                                                    Cancel
                                                                                </AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-red-500/25 focus:ring-4 focus:ring-red-500/20 order-1 sm:order-2"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4 mr-2 animate-pulse" />
                                                                                    Delete User
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </div>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}





                                    </TableBody>
                                </Table>
                            </div>

                            {/* Bulk Actions */}
                            {selectedEmployees.size > 0 && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-blue-900">
                                                {selectedEmployees.size} user{selectedEmployees.size > 1 ? 's' : ''} selected
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsBulkEditOpen(true)}
                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Bulk Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                            >
                                                <Shield className="h-4 w-4 mr-2" />
                                                Manage Permissions
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsBulkDeleteOpen(true)}
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Selected
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            <div className="mt-6">
                                <Pagination
                                    currentPage={userPagination.state.currentPage}
                                    totalPages={userPagination.state.totalPages}
                                    onPageChange={userPagination.actions.setPage}
                                    pageSize={userPagination.state.pageSize}
                                    totalItems={users.length}
                                    onPageSizeChange={userPagination.actions.setPageSize}
                                    showFirstLast={true}
                                    showPageSizeSelector={true}
                                    pageSizeOptions={[5, 10, 20, 50]}
                                    maxVisiblePages={5}
                                    className="justify-center"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}


            </div>
        </div>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Bulk Delete</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleBulkDelete}>
                        Delete {selectedEmployees.size} Employee{selectedEmployees.size > 1 ? 's' : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Bulk Edit Dialog */}
        <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk Edit Employees</DialogTitle>
                    <DialogDescription>
                        Edit common fields for {selectedEmployees.size} selected employee{selectedEmployees.size > 1 ? 's' : ''}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bulk-department" className="text-right">
                            Department
                        </Label>
                        <Select value={bulkFormData.department} onValueChange={(value) => setBulkFormData(prev => ({ ...prev, department: value }))}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bulk-level" className="text-right">
                            Level
                        </Label>
                        <Select value={bulkFormData.level} onValueChange={(value) => setBulkFormData(prev => ({ ...prev, level: value }))}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Non Managerial">Non Managerial</SelectItem>
                                <SelectItem value="Managerial">Managerial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bulk-email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="bulk-email"
                            type="email"
                            placeholder="Enter email address"
                            className="col-span-3"
                            value={bulkFormData.email}
                            onChange={(e) => setBulkFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="secondary" onClick={handleBulkEdit}>
                        Update {selectedEmployees.size} Employee{selectedEmployees.size > 1 ? 's' : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
);
};

export default EmployeeManagement;