import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Edit, Trash2, LogOut, Users, Shield, Search, Upload, Download } from "lucide-react";
import mtiLogo from "@/assets/mti-logo.png";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
    const [isImporting, setIsImporting] = useState(false);
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

    // Excel Export Function
    const handleExportToExcel = () => {
        try {
            // Prepare data for export
            const exportData = employees.map(emp => ({
                'ID Badge Number': emp.id_badge_number,
                'Employee Name': emp.name,
                'Department': emp.department,
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
                    'Department': 'Human Resources'
                },
                {
                    'ID Badge Number': 'MTI002',
                    'Employee Name': 'Jane Smith',
                    'Department': 'ICT Department'
                },
                {
                    'ID Badge Number': 'MTI003',
                    'Employee Name': 'Bob Johnson',
                    'Department': 'Environmental Department'
                }
            ];

            // Create instructions data
            const instructionsData = [
                { 'Instructions': 'HOW TO USE THIS TEMPLATE:' },
                { 'Instructions': '' },
                { 'Instructions': '1. Use the "Employee Template" sheet to add your data' },
                { 'Instructions': '2. DELETE the sample rows before adding your data' },
                { 'Instructions': '3. Fill in ALL three columns for each employee:' },
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
                { wch: 30 }  // Department
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

                    // Find the actual values
                    let idBadge = '';
                    let name = '';
                    let department = '';

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

                    console.log(`Row ${rowNum} extracted:`, { idBadge, name, department });

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
                        'ICT': 'ICT Department',
                        'ICT Department': 'ICT Department',
                        'ICT Dept': 'ICT Department',
                        'Information Technology': 'ICT Department',
                        'IT': 'ICT Department',
                        
                        'HR': 'Human Resources',
                        'Human Resource': 'Human Resources',
                        'Human Resources': 'Human Resources',
                        'HR Dept': 'Human Resources',
                        
                        'Environment': 'Environmental Department',
                        'Environmental': 'Environmental Department',
                        'Environmental Department': 'Environmental Department',
                        'Environmental Dept': 'Environmental Department',
                        'Env': 'Environmental Department',
                        
                        'External Affair': 'External Affair Department',
                        'External Affairs': 'External Affair Department',
                        'External Affair Department': 'External Affair Department',
                        'External Affairs Department': 'External Affair Department',
                        'EA': 'External Affair Department',
                        
                        'Finance': 'Finance Department',
                        'Finance Department': 'Finance Department',
                        'Finance Dept': 'Finance Department',
                        'Fin': 'Finance Department',
                        
                        'Supply Chain': 'Supply Chain Management',
                        'Supply Chain Management': 'Supply Chain Management',
                        'SCM': 'Supply Chain Management',
                        'Supply': 'Supply Chain Management',
                        
                        'Personal Data': 'Personal Data',
                        'Personal Data Dept': 'Personal Data',
                        'PD': 'Personal Data',
                        
                        'OHS': 'OHS Department',
                        'OHS Department': 'OHS Department',
                        'OHS Dept': 'OHS Department',
                        'Occupational Health': 'OHS Department',
                        'Safety': 'OHS Department',
                        
                        'Maintenance': 'Maintenance Department',
                        'Maintenance Department': 'Maintenance Department',
                        'Maintenance Dept': 'Maintenance Department',
                        'Maint': 'Maintenance Department'
                    };

                    const mappedDepartment = departmentMap[trimmedDepartment] || trimmedDepartment;
                    
                    if (!departments.includes(mappedDepartment)) {
                        errors.push(`Row ${rowNum}: Invalid department '${trimmedDepartment}'. Valid departments: ${departments.join(', ')}`);
                        return;
                    }

                    validEmployees.push({
                        id_badge_number: formattedIdBadge,
                        name: String(name).trim(),
                        department: mappedDepartment
                    });

                    console.log(`Row ${rowNum} validated successfully:`, {
                        id_badge_number: formattedIdBadge,
                        name: String(name).trim(),
                        department: mappedDepartment
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
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleImportFromExcel}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isImporting}
                                    />
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        disabled={isImporting}
                                    >
                                        <Upload className="h-4 w-4" />
                                        {isImporting ? "Importing..." : "Import Excel"}
                                    </Button>
                                </div>

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