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
import usePagination from "@/hooks/use-pagination";

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

const AdminSubmission = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [submissionFilter, setSubmissionFilter] = useState("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeMenuItem, setActiveMenuItem] = useState("submission");
    const [resultsExpanded, setResultsExpanded] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [sortField, setSortField] = useState<keyof Employee | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const { toast } = useToast();
    const navigate = useNavigate();

    // Filter and sort employees based on search term, department, submission status, and sorting
    const filteredEmployees = employees
        .filter((employee) => {
            const matchesSearch = 
                employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.id_badge_number.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesDepartment = 
                selectedDepartment === "all" || employee.department === selectedDepartment;
            
            const matchesSubmissionStatus = 
                submissionFilter === "all" || employee.status === submissionFilter;
            
            return matchesSearch && matchesDepartment && matchesSubmissionStatus;
        })
        .sort((a, b) => {
            if (!sortField) return 0;
            
            let aValue = a[sortField];
            let bValue = b[sortField];
            
            // Handle null/undefined values
            if (aValue == null) aValue = '';
            if (bValue == null) bValue = '';
            
            // Special handling for dates
            if (sortField === 'created_at') {
                aValue = new Date(aValue as string).getTime();
                bValue = new Date(bValue as string).getTime();
            }
            
            // Convert to string for comparison if not already
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

    // Pagination for submissions
    const submissionPagination = usePagination({
        totalItems: filteredEmployees.length,
        initialPageSize: 10,
    });

    // Get current page data for submission view
    const currentPageSubmissions = submissionPagination.paginateData(filteredEmployees);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const { data: employeesData, error: employeesError } = await supabase
                .from("employees")
                .select("*")
                .order("created_at", { ascending: false });

            if (employeesError) throw employeesError;

            const { data: responsesData, error: responsesError } = await supabase
                .from("survey_responses")
                .select("employee_id, created_at")
                .order("created_at", { ascending: false });

            if (responsesError) throw responsesError;

            const employeesWithStatus = employeesData?.map((employee) => {
                const response = responsesData?.find(
                    (r) => r.employee_id === employee.id
                );
                return {
                    ...employee,
                    status: response ? "Submitted" : "Not Submitted",
                    created_at: response ? response.created_at : employee.created_at,
                };
            }) || [];

            setEmployees(employeesWithStatus);
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

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
            toast({
                title: "Error",
                description: "Failed to logout",
                variant: "destructive",
            });
        }
    };

    const confirmLogout = () => {
        setLogoutDialogOpen(false);
        handleLogout();
    };

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
            return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
        }
        return sortDirection === 'asc' 
            ? <ArrowUp className="h-4 w-4 text-purple-600" />
            : <ArrowDown className="h-4 w-4 text-purple-600" />;
    };

    const handleExportToExcel = () => {
        try {
            const exportData = filteredEmployees.map((employee) => ({
                "ID Badge": employee.id_badge_number,
                "Name": employee.name,
                "Department": employee.department,
                "Level": employee.level || "Non Managerial",
                "Submission Date": employee.status === 'Submitted' 
                    ? new Date(employee.created_at).toLocaleDateString()
                    : '-',
                "Status": employee.status || "Not Submitted",
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Submissions");

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const fileName = `survey_submissions_${new Date().toISOString().split('T')[0]}.xlsx`;
            saveAs(data, fileName);

            toast({
                title: "Success",
                description: "Survey submission report exported successfully",
            });
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast({
                title: "Error",
                description: "Failed to export report",
                variant: "destructive",
            });
        }
    };

    // Calculate statistics
    const totalEmployees = employees.length;
    const submittedCount = employees.filter(emp => emp.status === 'Submitted').length;
    const notSubmittedCount = totalEmployees - submittedCount;
    const completionRate = totalEmployees > 0 ? Math.round((submittedCount / totalEmployees) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 flex flex-col`}>
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
                
                <nav className="flex-1 mt-6 px-3 overflow-y-auto">
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                setActiveMenuItem("dashboard");
                                navigate("/dashboard");
                            }}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeMenuItem === "dashboard"
                                    ? "text-purple-600 bg-purple-50"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            <LayoutDashboard className="mr-3 h-4 w-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setActiveMenuItem("submission");
                            }}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeMenuItem === "submission"
                                    ? "text-purple-600 bg-purple-50"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            <FileText className="mr-3 h-4 w-4" />
                            Submission
                        </button>
                        {/* Results Menu with Sub-items */}
                        <div>
                            <button
                                onClick={() => {
                                    setResultsExpanded(!resultsExpanded);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeMenuItem.includes("results")
                                        ? "text-purple-600 bg-purple-50"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center">
                                    <BarChart3 className="mr-3 h-4 w-4" />
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
                                <div className="ml-6 mt-1 space-y-1">
                                    <button
                                        onClick={() => {
                                            setActiveMenuItem("results-managerial");
                                            navigate("/results/managerial");
                                        }}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            activeMenuItem === "results-managerial"
                                                ? "text-purple-600 bg-purple-50"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Users className="mr-3 h-4 w-4" />
                                        Managerial
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveMenuItem("results-non-managerial");
                                            navigate("/results/non-managerial");
                                        }}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            activeMenuItem === "results-non-managerial"
                                                ? "text-purple-600 bg-purple-50"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Shield className="mr-3 h-4 w-4" />
                                        Non Managerial
                                    </button>
                                </div>
                            )}
                        </div>
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
                                    <img src={mtiLogo} alt="MTI Logo" className="h-10 w-auto" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            <FileText className="h-6 w-6 text-purple-600" />
                                            Survey Submission Status
                                        </h1>
                                        <p className="text-sm text-gray-500">Survey Completion Tracking</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-20 p-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600 text-xl">👥</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Submitted</p>
                                    <p className="text-2xl font-bold text-green-600">{submittedCount}</p>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-green-600 text-xl">✅</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Not Submitted</p>
                                    <p className="text-2xl font-bold text-red-600">{notSubmittedCount}</p>
                                </div>
                                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <span className="text-red-600 text-xl">❌</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                                    <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600 text-xl">📊</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submission Status Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="text-xl font-semibold">Survey Submission Status</CardTitle>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={handleExportToExcel}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    disabled={employees.length === 0}
                                >
                                    <Download className="h-4 w-4" />
                                    Export Report
                                </Button>
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
                            <Select value={submissionFilter} onValueChange={setSubmissionFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Submitted">Submitted</SelectItem>
                                    <SelectItem value="Not Submitted">Not Submitted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Loading submission status...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16 text-center">
                                                No.
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50 select-none"
                                                onClick={() => handleSort('id_badge_number')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    ID Badge
                                                    {getSortIcon('id_badge_number')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50 select-none"
                                                onClick={() => handleSort('name')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Name
                                                    {getSortIcon('name')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50 select-none"
                                                onClick={() => handleSort('department')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Department
                                                    {getSortIcon('department')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50 select-none"
                                                onClick={() => handleSort('level')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Level
                                                    {getSortIcon('level')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50 select-none"
                                                onClick={() => handleSort('created_at')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Submission Date
                                                    {getSortIcon('created_at')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer hover:bg-gray-50 select-none"
                                                onClick={() => handleSort('status')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Status
                                                    {getSortIcon('status')}
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentPageSubmissions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                    {filteredEmployees.length === 0 ? "No employees found" : "No employees on this page"}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentPageSubmissions.map((employee, index) => (
                                                <TableRow key={employee.id}>
                                                    <TableCell className="text-center text-sm text-gray-600">
                                                        {submissionPagination.state.startIndex + index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {employee.id_badge_number}
                                                    </TableCell>
                                                    <TableCell>{employee.name}</TableCell>
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
                                                        {employee.status === 'Submitted' 
                                                            ? new Date(employee.created_at).toLocaleDateString()
                                                            : '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            employee.status === 'Submitted' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {employee.status || 'Not Submitted'}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        
                        {/* Pagination Controls */}
                        {filteredEmployees.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {submissionPagination.state.startIndex + 1}-{Math.min(submissionPagination.state.endIndex + 1, filteredEmployees.length)} of {filteredEmployees.length} employees
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Page {submissionPagination.state.currentPage} of {submissionPagination.state.totalPages}
                                    </div>
                                </div>
                                <Pagination
                                    currentPage={submissionPagination.state.currentPage}
                                    totalPages={submissionPagination.state.totalPages}
                                    onPageChange={submissionPagination.actions.setPage}
                                    pageSize={submissionPagination.state.pageSize}
                                    totalItems={filteredEmployees.length}
                                    onPageSizeChange={submissionPagination.actions.setPageSize}
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
                 </div>
             </div>
         </div>
    );
};

export default AdminSubmission;