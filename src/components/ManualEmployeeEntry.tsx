import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Employee {
  id_badge_number: string;
  name: string;
  department: string;
}

interface ManualEmployeeEntryProps {
  onEmployeeAdded: () => void;
}

const ManualEmployeeEntry: React.FC<ManualEmployeeEntryProps> = ({ onEmployeeAdded }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>({
    id_badge_number: '',
    name: '',
    department: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRLSWarning, setShowRLSWarning] = useState(false);
  const { toast } = useToast();

  const addEmployeeToList = () => {
    if (!currentEmployee.id_badge_number || !currentEmployee.name || !currentEmployee.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicates in current list
    const isDuplicate = employees.some(emp => 
      emp.id_badge_number.toUpperCase() === currentEmployee.id_badge_number.toUpperCase()
    );

    if (isDuplicate) {
      toast({
        title: "Duplicate Entry",
        description: "This ID Badge Number is already in the list",
        variant: "destructive"
      });
      return;
    }

    setEmployees([...employees, {
      ...currentEmployee,
      id_badge_number: currentEmployee.id_badge_number.toUpperCase()
    }]);
    
    setCurrentEmployee({ id_badge_number: '', name: '', department: '' });
    
    toast({
      title: "Employee Added",
      description: "Employee added to the list. Click 'Submit All' to save to database."
    });
  };

  const removeEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const submitAllEmployees = async () => {
    if (employees.length === 0) {
      toast({
        title: "No Data",
        description: "Please add at least one employee",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const employee of employees) {
      try {
        const { error } = await supabase
          .from('employees')
          .insert([employee]);

        if (error) {
          if (error.code === '42501') {
            // RLS policy violation
            setShowRLSWarning(true);
            errors.push(`RLS Policy Error for ${employee.id_badge_number}`);
          } else if (error.code === '23505') {
            // Duplicate key
            errors.push(`Duplicate ID: ${employee.id_badge_number}`);
          } else {
            errors.push(`${employee.id_badge_number}: ${error.message}`);
          }
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        errorCount++;
        errors.push(`${employee.id_badge_number}: Unexpected error`);
      }
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      toast({
        title: "Partial Success",
        description: `${successCount} employees added successfully. ${errorCount} failed.`
      });
      
      // Remove successful entries
      if (errorCount === 0) {
        setEmployees([]);
      }
      
      onEmployeeAdded();
    } else {
      toast({
        title: "All Failed",
        description: `Failed to add any employees. Check console for details.`,
        variant: "destructive"
      });
    }

    if (errors.length > 0) {
      console.error('Employee insertion errors:', errors);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Manual Employee Entry
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add employees one by one as a workaround for Excel import issues.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {showRLSWarning && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Database Policy Issue Detected:</strong> The database is blocking INSERT operations due to Row Level Security policies. 
              This is the same issue affecting Excel imports. Consider switching to the MSSQL alternative database for full functionality.
            </AlertDescription>
          </Alert>
        )}

        {/* Add Employee Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor="badge">ID Badge Number</Label>
            <Input
              id="badge"
              value={currentEmployee.id_badge_number}
              onChange={(e) => setCurrentEmployee({
                ...currentEmployee,
                id_badge_number: e.target.value
              })}
              placeholder="MTI001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Employee Name</Label>
            <Input
              id="name"
              value={currentEmployee.name}
              onChange={(e) => setCurrentEmployee({
                ...currentEmployee,
                name: e.target.value
              })}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept">Department</Label>
            <Input
              id="dept"
              value={currentEmployee.department}
              onChange={(e) => setCurrentEmployee({
                ...currentEmployee,
                department: e.target.value
              })}
              placeholder="IT Department"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addEmployeeToList} className="w-full">
              Add to List
            </Button>
          </div>
        </div>

        {/* Employee List */}
        {employees.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Employees to Add ({employees.length})</h3>
              <div className="space-x-2">
                <Button 
                  onClick={() => setEmployees([])} 
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Clear All
                </Button>
                <Button 
                  onClick={submitAllEmployees} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Submit All
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-3 bg-gray-100 font-semibold text-sm">
                <div>ID Badge</div>
                <div>Name</div>
                <div>Department</div>
                <div>Action</div>
              </div>
              {employees.map((employee, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t hover:bg-gray-50">
                  <div className="font-mono text-sm">{employee.id_badge_number}</div>
                  <div>{employee.name}</div>
                  <div>{employee.department}</div>
                  <div>
                    <Button 
                      onClick={() => removeEmployee(index)}
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Fill in the employee details and click "Add to List"</li>
            <li>Review all entries in the list below</li>
            <li>Click "Submit All" to save all employees to the database</li>
            <li>If database errors occur, successful entries will be saved and failed ones will remain in the list</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualEmployeeEntry;