import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
import { LogOut, Download, Menu, LayoutDashboard, FileText, BarChart3, Users, Shield, ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import mtiLogo from "@/assets/mti-logo.png";
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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";

interface Employee {
    id: string;
    id_badge_number: string;
    name: string;
    department: string;
    level?: string;
    status?: string;
    created_at: string;
    updated_at: string;
}

const Submission = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeMenuItem, setActiveMenuItem] = useState("submission");
    const [resultsExpanded, setResultsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; direction: 'asc' | 'desc' } | null>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    const itemsPerPage = 10;
    const pagination = usePagination({
        totalItems: filteredEmployees.length,
        initialPageSize: itemsPerPage,
        initialPage: 1
    });
    const paginatedData = pagination.paginateData(filteredEmployees);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        filterEmployees();
    }, [employees, searchTerm, departmentFilter, levelFilter, statusFilter]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            // Fetch employees with their submission status
            const { data: employeesData, error: employeesError } = await supabase
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false });

            if (employeesError) throw employeesError;

            // Fetch all survey responses to determine submission status
            const { data: responsesData, error: responsesError } = await supabase
                .from('survey_responses')
                .select('id_badge_number');

            if (responsesError) throw responsesError;

            // Create a set of badge numbers that have submitted surveys
            const submittedBadgeNumbers = new Set(
                responsesData?.map(response => response.id_badge_number) || []
            );

            // Add status field to employees based on survey submission
            const employeesWithStatus = (employeesData || []).map(employee => ({
                ...employee,
                status: submittedBadgeNumbers.has(employee.id_badge_number) ? 'submitted' : 'not_submitted'
            }));

            setEmployees(employeesWithStatus);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast({
                title: "Error",
                description: "Failed to fetch employees",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filterEmployees = () => {
        let filtered = employees;

        if (searchTerm) {
            filtered = filtered.filter(employee =>
                employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.id_badge_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.department.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (departmentFilter !== "all") {
            filtered = filtered.filter(employee => employee.department === departmentFilter);
        }

        if (levelFilter !== "all") {
            filtered = filtered.filter(employee => employee.level === levelFilter);
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(employee => employee.status === statusFilter);
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredEmployees(filtered);
    };

    const handleSort = (key: keyof Employee) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Employee) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="h-4 w-4" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate("/login");
        } catch (error) {
            console.error('Error logging out:', error);
            toast({
                title: "Error",
                description: "Failed to logout",
                variant: "destructive",
            });
        }
    };

    const exportToExcel = () => {
        const exportData = filteredEmployees.map((employee, index) => ({
            'No.': index + 1,
            'Badge Number': employee.id_badge_number,
            'Name': employee.name,
            'Department': employee.department,
            'Level': employee.level || 'N/A',
            'Status': employee.status === 'submitted' ? 'Submitted' : 'Not Submitted',
            'Created At': new Date(employee.created_at).toLocaleDateString(),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Submissions');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `employee_submissions_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);
    const levels = [...new Set(employees.map(emp => emp.level))].filter(Boolean);

    const totalEmployees = employees.length;
    const submittedCount = employees.filter(emp => emp.status === 'submitted').length;
    const notSubmittedCount = totalEmployees - submittedCount;
    const completionRate = totalEmployees > 0 ? Math.round((submittedCount / totalEmployees) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 flex flex-col`}>
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
                </div>

                <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
                        {/* 1. Employee */}
                        <button
                            onClick={() => {
                                setActiveMenuItem("dashboard");
                                navigate("/employee");
                            }}
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
                    <AlertDialog>
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
                                <AlertDialogAction onClick={handleLogout}>
                                    Logout
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

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
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Survey Submission Status</h1>
                                <p className="text-sm text-gray-500">Survey Completion Tracking</p>
                            </div>
                        </div>
                        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                    </div>
                    </div>
                </div>

                {/* Content */}
                <div className="w-full p-6 pt-24">
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">Total Employees</p>
                                            <p className="text-2xl font-bold text-blue-900">{totalEmployees}</p>
                                        </div>
                                        <Users className="h-8 w-8 text-blue-500" />
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Submitted</p>
                                            <p className="text-2xl font-bold text-green-900">{submittedCount}</p>
                                        </div>
                                        <Shield className="h-8 w-8 text-green-500" />
                                    </div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-red-600">Not Submitted</p>
                                            <p className="text-2xl font-bold text-red-900">{notSubmittedCount}</p>
                                        </div>
                                        <Users className="h-8 w-8 text-red-500" />
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                                            <p className="text-2xl font-bold text-purple-900">{completionRate}%</p>
                                        </div>
                                        <BarChart3 className="h-8 w-8 text-purple-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                                <Input
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="md:col-span-2"
                                />
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map(dept => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={levelFilter} onValueChange={setLevelFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Levels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        {levels.map(level => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="not_submitted">Not Submitted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Table */}
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-16">No.</TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('id_badge_number')}
                                                            className="h-auto p-0 font-semibold hover:bg-transparent text-gray-700 hover:text-gray-900"
                                                        >
                                                            Badge Number
                                                            {getSortIcon('id_badge_number')}
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('name')}
                                                            className="h-auto p-0 font-semibold hover:bg-transparent text-gray-700 hover:text-gray-900"
                                                        >
                                                            Name
                                                            {getSortIcon('name')}
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('department')}
                                                            className="h-auto p-0 font-semibold hover:bg-transparent text-gray-700 hover:text-gray-900"
                                                        >
                                                            Department
                                                            {getSortIcon('department')}
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('level')}
                                                            className="h-auto p-0 font-semibold hover:bg-transparent text-gray-700 hover:text-gray-900"
                                                        >
                                                            Level
                                                            {getSortIcon('level')}
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('status')}
                                                            className="h-auto p-0 font-semibold hover:bg-transparent text-gray-700 hover:text-gray-900"
                                                        >
                                                            Status
                                                            {getSortIcon('status')}
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('created_at')}
                                                            className="h-auto p-0 font-semibold hover:bg-transparent text-gray-700 hover:text-gray-900"
                                                        >
                                                            Created At
                                                            {getSortIcon('created_at')}
                                                        </Button>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedData.map((employee, index) => (
                                                    <TableRow key={employee.id}>
                                                        <TableCell className="font-medium">
                                                            {(pagination.state.currentPage - 1) * itemsPerPage + index + 1}
                                                        </TableCell>
                                                        <TableCell>{employee.id_badge_number}</TableCell>
                                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                                        <TableCell>{employee.department}</TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                employee.level === 'Managerial' 
                                                                    ? 'bg-blue-100 text-blue-800' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {employee.level || 'N/A'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                employee.status === 'submitted' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {employee.status === 'submitted' ? 'Submitted' : 'Not Submitted'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(employee.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {pagination.state.totalPages > 1 && (
                                        <div className="flex justify-center">
                                            <Pagination
                                                currentPage={pagination.state.currentPage}
                                                totalPages={pagination.state.totalPages}
                                                onPageChange={pagination.actions.setPage}
                                                totalItems={pagination.state.totalItems}
                                                pageSize={pagination.state.pageSize}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Submission;