import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, LogOut, Users, Shield, Search } from "lucide-react";
import mtiLogo from "@/assets/mti-logo.png";

interface Employee {
    id: string;
    id_badge_number: string;
    name: string;
    department: string;
    created_at: string;
    updated_at: string;
}

const departments = [
    "Environmental Department",
    "Finance Department",
    "Human Resources",
    "External Affair Department",
    "Supply Chain Management",
    "Personal Data",
    "ICT Department",
    "OHS Department"
];

const AdminDashboard = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        id_badge_number: "",
        name: "",
        department: "",
    });
    const { toast } = useToast();
    const navigate = useNavigate();

    // Check authentication
    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
        if (!isAuthenticated) {
            navigate("/admin/login");
        }
    }, [navigate]);

    // Fetch employees
    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("employees")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setEmployees(data || []);
            setFilteredEmployees(data || []);
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

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Filter employees
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

        setFilteredEmployees(filtered);
    }, [employees, searchTerm, selectedDepartment]);

    const handleLogout = () => {
        sessionStorage.removeItem("adminAuthenticated");
        sessionStorage.removeItem("adminLoginTime");
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out",
        });
        navigate("/admin/login");
    };

    const resetForm = () => {
        setFormData({
            id_badge_number: "",
            name: "",
            department: "",
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
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                    })
                    .eq("id", editingEmployee.id);

                if (error) throw error;

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
        if (!confirm(`Are you sure you want to delete ${employee.name}?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("employees")
                .delete()
                .eq("id", employee.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Employee deleted successfully",
            });

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img src={mtiLogo} alt="MTI Logo" className="h-10 w-auto" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                    Admin Dashboard
                                </h1>
                                <p className="text-gray-600">Employee Management System</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{employees.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Departments</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(employees.map(emp => emp.department)).size}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredEmployees.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="text-xl font-semibold">Employee Management</CardTitle>
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
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Select
                                                value={formData.department}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, department: value })
                                                }
                                                required
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
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Loading employees...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID Badge</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEmployees.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                    No employees found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredEmployees.map((employee) => (
                                                <TableRow key={employee.id}>
                                                    <TableCell className="font-medium">
                                                        {employee.id_badge_number}
                                                    </TableCell>
                                                    <TableCell>{employee.name}</TableCell>
                                                    <TableCell>{employee.department}</TableCell>
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
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(employee)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;