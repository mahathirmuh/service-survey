import React, { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, LogOut, Users, Shield, Search, Upload, Download, LayoutDashboard, Menu, BarChart3, FileText, ChevronDown, ChevronRight, Grid3X3, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

const AdminDashboard = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [submissionFilter, setSubmissionFilter] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [resultsExpanded, setResultsExpanded] = useState(false);
    const [activeMenuItem, setActiveMenuItem] = useState(() => {
        // Check if we're coming from the results page with submission intent
        const urlParams = new URLSearchParams(window.location.search);
        const menu = urlParams.get('menu') || "dashboard";
        // If we're on a results sub-page, expand the results menu
        if (menu.includes('results')) {
            setResultsExpanded(true);
        }
        return menu;
    });
    const [formData, setFormData] = useState({
        id_badge_number: "",
        name: "",
        department: "",
        level: "Non Managerial",
    });
    
    // Bulk selection state
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [bulkFormData, setBulkFormData] = useState({
        department: "",
        level: "",
    });
    
    // Sorting state
    const [sortField, setSortField] = useState<keyof Employee | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    
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

    // Check authentication and session timeout
    useEffect(() => {
        const checkSession = () => {
            const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
            const loginTime = sessionStorage.getItem("adminLoginTime");
            
            if (!isAuthenticated) {
                navigate("/login");
                return;
            }
            
            if (loginTime) {
                const loginTimestamp = new Date(loginTime).getTime();
                const currentTime = new Date().getTime();
                const sessionDuration = currentTime - loginTimestamp;
                const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
                
                if (sessionDuration > fifteenMinutes) {
                    sessionStorage.removeItem("adminAuthenticated");
                    sessionStorage.removeItem("adminLoginTime");
                    toast({
                        title: "Session Expired",
                        description: "Your session has expired. Please login again.",
                        variant: "destructive",
                    });
                    navigate("/login");
                }
            }
        };
        
        // Check session immediately
        checkSession();
        
        // Set up interval to check session every minute
        const sessionCheckInterval = setInterval(checkSession, 60000);
        
        return () => clearInterval(sessionCheckInterval);
    }, [navigate, toast]);

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

    useEffect(() => {
        fetchEmployees();
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
    }, [employees, searchTerm, selectedDepartment, submissionFilter, sortField, sortDirection]);

    const handleLogout = () => {
        sessionStorage.removeItem("adminAuthenticated");
        sessionStorage.removeItem("adminLoginTime");
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

    const resetForm = () => {
        setFormData({
            id_badge_number: "",
            name: "",
            department: "",
            level: "Non Managerial",
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
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

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
            setBulkFormData({ department: "", level: "" });

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
            // Create template data with sample rows
            const templateData = [
                {
                    'ID Badge Number': 'MTI001',
                    'Employee Name': 'John Doe',
                    'Department': 'Human Resources',
                    'Level': 'Non Managerial'
                },
                {
                    'ID Badge Number': 'MTI002',
                    'Employee Name': 'Jane Smith',
                    'Department': 'ICT Department',
                    'Level': 'Managerial'
                },
                {
                    'ID Badge Number': 'MTI003',
                    'Employee Name': 'Bob Johnson',
                    'Department': 'Environmental Department',
                    'Level': 'Non Managerial'
                }
            ];

            // Create instructions data
            const instructionsData = [
                { 'Instructions': 'HOW TO USE THIS TEMPLATE:' },
                { 'Instructions': '' },
                { 'Instructions': '1. Use the "Employee Template" sheet to add your data' },
                { 'Instructions': '2. DELETE the sample rows before adding your data' },
                { 'Instructions': '3. Fill in ALL four columns for each employee:' },
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
                { 'Instructions': '• Remove sample data before importing' },
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
                    const possibleDeptColumns = ['Department', 'Dept', 'Department Name', 'Dep'];
                    const possibleLevelColumns = ['Level', 'Employee Level', 'Position Level', 'Management Level'];

                    // Find the actual values
                    let idBadge = '';
                    let name = '';
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

                    console.log(`Row ${rowNum} extracted:`, { idBadge, name, department, level });

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
                        level: level
                    });

                    console.log(`Row ${rowNum} validated successfully:`, {
                        id_badge_number: formattedIdBadge,
                        name: String(name).trim(),
                        department: mappedDepartment,
                        level: level
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
                            onClick={() => setActiveMenuItem("dashboard")}
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
                                navigate("/admin/submission");
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
                                            navigate("/admin/results/managerial");
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
                                            navigate("/admin/results/non-managerial");
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
                                        </h1>
                                        <p className="text-gray-600">
                                            {activeMenuItem === "dashboard" && "Employee Management System"}
                                            {activeMenuItem === "submission" && "Survey Completion Tracking"}
                                        </p>
                                    </div>
                                </div>
                                <div className="lg:hidden">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {activeMenuItem === "dashboard" && "Employee Dashboard"}
                                        {activeMenuItem === "submission" && "Survey Status"}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full p-6 pt-24">
                {/* Stats Cards */}
                {activeMenuItem === "dashboard" && (
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
                )}

                {/* Submission Stats Cards */}
                {activeMenuItem === "submission" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                                <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                                <FileText className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {employees.filter(emp => emp.status === 'Submitted').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Not Submitted</CardTitle>
                                <FileText className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {employees.filter(emp => emp.status === 'Not Submitted').length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                                <BarChart3 className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {employees.length > 0 
                                        ? Math.round((employees.filter(emp => emp.status === 'Submitted').length / employees.length) * 100)
                                        : 0}%
                                </div>
                            </CardContent>
                        </Card>
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
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                                    onClick={() => handleSort('id_badge_number')}
                                                >
                                                    <div className="flex items-center">
                                                        ID Badge
                                                        {getSortIcon('id_badge_number')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    <div className="flex items-center">
                                                        Name
                                                        {getSortIcon('name')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                                    onClick={() => handleSort('department')}
                                                >
                                                    <div className="flex items-center">
                                                        Department
                                                        {getSortIcon('department')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                                    onClick={() => handleSort('level')}
                                                >
                                                    <div className="flex items-center">
                                                        Level
                                                        {getSortIcon('level')}
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                                    onClick={() => handleSort('created_at')}
                                                >
                                                    <div className="flex items-center">
                                                        Created
                                                        {getSortIcon('created_at')}
                                                    </div>
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
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleBulkEdit}>
                        Update {selectedEmployees.size} Employee{selectedEmployees.size > 1 ? 's' : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
);
};

export default AdminDashboard;