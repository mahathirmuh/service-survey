import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ZoomIn, X } from "lucide-react";
import mtiLogo from "@/assets/mti-logo.png";
import {
    departmentSections,
    getSectionsForDepartment,
    getImageForSection,
    getImageDescriptionForSection,
    getOverviewForSection,
} from "@/data/images";

interface SectionQuestions {
    question1: string;
    question2: string;
    feedback: string;
}

interface FormData {
    name: string;
    idBadgeNumber: string;
    email: string;
    department: string;
    environmental_section: string;
    environmental_sections: { [sectionName: string]: SectionQuestions };
    external_section: string;
    external_sections: { [sectionName: string]: SectionQuestions };
    hr_section: string;
    hr_sections: { [sectionName: string]: SectionQuestions };
    scm_section: string;
    scm_sections: { [sectionName: string]: SectionQuestions };
}

// Enhanced FeedbackTextarea component with additional features
    const FeedbackTextarea = React.memo(
        ({
            value,
            onChange,
        }: {
            value: string;
            onChange: (val: string) => void;
        }) => {
            const [localValue, setLocalValue] = useState(value);
            const [charCount, setCharCount] = useState(value.length);
            const [isFocused, setIsFocused] = useState(false);
            const maxLength = 500;
            
            useEffect(() => {
                setLocalValue(value);
                setCharCount(value.length);
            }, [value]);
            
            const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const newValue = e.target.value;
                if (newValue.length <= maxLength) {
                    setLocalValue(newValue);
                    setCharCount(newValue.length);
                }
            };
            
            const handleBlur = () => {
                onChange(localValue);
                setIsFocused(false);
            };
            
            const handleFocus = () => {
                setIsFocused(true);
            };
            
            const getCharCountColor = () => {
                if (charCount >= maxLength * 0.9) return "text-red-500";
                if (charCount >= maxLength * 0.7) return "text-red-400";
                return "text-muted-foreground";
            };
            
            return (
                <div className="space-y-2">
                    <textarea
                        value={localValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        placeholder="Share any additional comments, suggestions for improvement, or specific feedback about the service..."
                        className={`w-full min-h-[120px] rounded-md border px-3 py-2 text-sm transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none ${
                            localValue.trim() === ""
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus-visible:border-red-500"
                                : "border-green-300 bg-green-50 focus:border-green-500 focus-visible:border-green-500"
                        }`}
                        maxLength={maxLength}
                    />
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-4">
                            <span className={`${getCharCountColor()} font-medium`}>
                                {charCount}/{maxLength} characters
                            </span>
                            {localValue.trim() !== "" && (
                                <span className="text-green-600 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Feedback provided
                                </span>
                            )}
                        </div>
                        {isFocused && (
                            <span className="text-blue-500 text-xs animate-pulse">
                                Your feedback is valuable to us
                            </span>
                        )}
                    </div>
                    {/* Feedback Guidelines */}
                    <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                        <p className="font-semibold text-blue-700 mb-1">💡 Feedback Guidelines:</p>
                        <ul className="space-y-1 text-blue-600">
                            <li>• Share specific examples of good or poor service</li>
                            <li>• Suggest improvements or new features</li>
                            <li>• Mention any issues or challenges you faced</li>
                            <li>• Highlight what worked well for you</li>
                        </ul>
                    </div>
                </div>
            );
        }
    );

const SurveyForm = () => {
    const emptySectionQuestions = useMemo(
        () => ({
            question1: "",
            question2: "",
            feedback: "",
        }),
        []
    );

    const [formData, setFormData] = useState<FormData>({
        name: "",
        idBadgeNumber: "",
        email: "",
        department: "",
        environmental_section: "",
        environmental_sections: {},
        external_section: "",
        external_sections: {},
        hr_section: "",
        hr_sections: {},
        scm_section: "",
        scm_sections: {},
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [idError, setIdError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
    const [previousIdBadge, setPreviousIdBadge] = useState("");
    const [previousEmail, setPreviousEmail] = useState("");
    const { toast } = useToast();

    // Initialize previous values when component mounts
    useEffect(() => {
        setPreviousIdBadge(formData.idBadgeNumber);
        setPreviousEmail(formData.email);
    }, []);

    const updateFormData = (field: keyof FormData, value: string) => {
        if (field === "idBadgeNumber") {
            const cleanValue = value.replace(/\s/g, "").toUpperCase();
            setFormData((prev) => ({ ...prev, idBadgeNumber: cleanValue }));
            return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validateEmployeeData = async (idBadge?: string, email?: string) => {
        setIdError("");
        const cleanIdBadge = (idBadge || formData.idBadgeNumber).replace(/\s/g, "").toUpperCase();
        const cleanEmail = (email || formData.email).trim();
        
        // Check if both fields are provided
        if (!cleanIdBadge || !cleanEmail) return;
        
        // Validate ID Badge format
        if (!/^MTI/.test(cleanIdBadge)) {
            setIdError("ID Badge Number must start with 'MTI'");
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            setEmailError("Please enter a valid email address");
            return;
        }
        
        if (cleanIdBadge.length > 3) {
            try {
                const { data: employee } = await supabase
                    .from("employees")
                    .select("id, name, department, id_badge_number")
                    .eq("id_badge_number", cleanIdBadge)
                    .maybeSingle();
                    
                if (!employee) {
                    setIdError(
                        "ID Badge Number is not registered. Please double check and try again. If error persists, please contact HR Team."
                    );
                    return;
                }
                
                // Note: Email validation against employee records is not available
                // as the employees table doesn't store email addresses
                
                // Clear any existing email error if validation passes
                setEmailError("");
                
                // Auto-fill name and department if both ID and email are valid
                setFormData((prev) => ({
                    ...prev,
                    name: employee.name,
                    department: employee.department,
                    idBadgeNumber: cleanIdBadge,
                }));
            } catch (error) {
                console.error("Error validating employee data:", error);
            }
        }
    };
    
    const validateIdBadge = async (value: string) => {
        // Update the ID badge value first
        const cleanValue = value.replace(/\s/g, "").toUpperCase();
        
        // Check if content is being deleted (new value is shorter than previous)
        if (cleanValue.length < previousIdBadge.length) {
            // Clear name and department when content is deleted
            setFormData((prev) => ({ 
                ...prev, 
                idBadgeNumber: cleanValue,
                name: "",
                department: ""
            }));
        } else {
            setFormData((prev) => ({ ...prev, idBadgeNumber: cleanValue }));
        }
        
        // Update previous value
        setPreviousIdBadge(cleanValue);
        
        // Then validate both ID and email together with current values
        setTimeout(() => validateEmployeeData(cleanValue, formData.email), 100);
    };
    
    const validateEmail = async (value: string) => {
        // Check if content is being deleted (new value is shorter than previous)
        if (value.length < previousEmail.length) {
            // Clear name and department when content is deleted
            setFormData((prev) => {
                const newFormData = { 
                    ...prev, 
                    email: value,
                    name: "",
                    department: ""
                };
                // Then validate both ID and email together with current values
                setTimeout(() => validateEmployeeData(newFormData.idBadgeNumber, value), 100);
                return newFormData;
            });
        } else {
            // Update the email value first
            setFormData((prev) => {
                const newFormData = { ...prev, email: value };
                // Then validate both ID and email together with current values
                setTimeout(() => validateEmployeeData(newFormData.idBadgeNumber, value), 100);
                return newFormData;
            });
        }
        
        // Update previous value
        setPreviousEmail(value);
    };

    const updateDepartmentQuestions = useCallback(
        (
            dept: "environmental" | "external" | "hr" | "scm",
            section: string,
            field: keyof SectionQuestions,
            value: string
        ) => {
            setFormData((prev) => ({
                ...prev,
                [`${dept}_sections`]: {
                    ...(
                        (prev[`${dept}_sections` as keyof FormData] as {
                            [key: string]: SectionQuestions;
                        }) || {}
                    ),
                    [section]: {
                        ...(
                            (prev[`${dept}_sections` as keyof FormData] as {
                                [key: string]: SectionQuestions;
                            })?.[section] || {}
                        ),
                        [field]: value,
                    },
                },
            }));
        },
        []
    );

    // Section change handlers
    const handleSectionChange = useCallback(
        (
            deptSectionsKey: keyof FormData,
            deptSectionKey: keyof FormData,
            value: string
        ) => {
            setFormData((prev) => {
                const sections = prev[deptSectionsKey] as {
                    [key: string]: SectionQuestions;
                };
                if (!sections[value]) {
                    return {
                        ...prev,
                        [deptSectionKey]: value,
                        [deptSectionsKey]: {
                            ...sections,
                            [value]: emptySectionQuestions,
                        },
                    };
                }
                return {
                    ...prev,
                    [deptSectionKey]: value,
                };
            });
        },
        [emptySectionQuestions]
    );

    // Create specific handlers reusing generic one:
    const handleEnvironmentalSectionChange = useCallback(
        (value: string) =>
            handleSectionChange("environmental_sections", "environmental_section", value),
        [handleSectionChange]
    );
    const handleExternalSectionChange = useCallback(
        (value: string) => handleSectionChange("external_sections", "external_section", value),
        [handleSectionChange]
    );
    const handleHrSectionChange = useCallback(
        (value: string) => handleSectionChange("hr_sections", "hr_section", value),
        [handleSectionChange]
    );
    const handleSCMSectionChange = useCallback(
        (value: string) => handleSectionChange("scm_sections", "scm_section", value),
        [handleSectionChange]
    );

    // Question change handlers
    const handleQuestionChange = useCallback(
        (
            deptSectionKey: keyof FormData,
            selectedSection: string,
            field: keyof SectionQuestions,
            value: string
        ) => {
            if (!selectedSection) return;
            updateDepartmentQuestions(deptSectionKey.toString().split("_")[0] as any, selectedSection, field, value);
        },
        [updateDepartmentQuestions]
    );

    const handleEnvironmentalQuestionChange = useCallback(
        (field: keyof SectionQuestions, value: string) => {
            handleQuestionChange("environmental_sections", formData.environmental_section, field, value);
        },
        [handleQuestionChange, formData.environmental_section]
    );

    const handleExternalQuestionChange = useCallback(
        (field: keyof SectionQuestions, value: string) => {
            handleQuestionChange("external_sections", formData.external_section, field, value);
        },
        [handleQuestionChange, formData.external_section]
    );

    const handleHrQuestionChange = useCallback(
        (field: keyof SectionQuestions, value: string) => {
            handleQuestionChange("hr_sections", formData.hr_section, field, value);
        },
        [handleQuestionChange, formData.hr_section]
    );

    const handleSCMQuestionChange = useCallback(
        (field: keyof SectionQuestions, value: string) => {
            handleQuestionChange("scm_sections", formData.scm_section, field, value);
        },
        [handleQuestionChange, formData.scm_section]
    );

    // Form validation
    const isFormValid = useCallback(() => {
        const requiredFields = ["name", "idBadgeNumber", "email", "department"];
        const areRequiredFieldsFilled = requiredFields.every(
            (field) => formData[field as keyof FormData]?.toString().trim().length !== 0
        );
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(formData.email.trim());
        const departments = ["hr", "environmental", "external", "scm"] as const;
        const allDepartmentsComplete = departments.every((dept) => {
            const sections = formData[`${dept}_sections` as keyof FormData] as {
                [key: string]: SectionQuestions;
            };
            return Object.values(sections).some(
                (section) => section.question1 && section.question2
            );
        });
        const isIdBadgeNumberValid =
            /^MTI/.test(formData.idBadgeNumber.trim()) && !idError;
        return areRequiredFieldsFilled && allDepartmentsComplete && isIdBadgeNumberValid && isEmailValid;
    }, [formData, idError]);

    // Get missing questions for better error display
    function getMissingQuestions(formData: FormData) {
        const missing: string[] = [];
        const departments = ["hr", "environmental", "external", "scm"] as const;
        const questionLabels = {
            question1: "Question 1",
            question2: "Question 2",
        };
        departments.forEach((dept) => {
            const sections = formData[`${dept}_sections` as keyof FormData] as {
                [key: string]: SectionQuestions;
            };
            Object.entries(sections).forEach(([sectionName, questions]) => {
                (["question1", "question2"] as (keyof SectionQuestions)[]).forEach((q) => {
                    if (!questions[q] || questions[q].trim() === "") {
                        missing.push(
                            `${dept.toUpperCase()} - ${sectionName} - ${questionLabels[q]}`
                        );
                    }
                });
            });
        });
        return missing;
    }

    // Submit handler
    const handleSubmit = async () => {
        // First validate missing fields before submitting
        const missingQuestions = getMissingQuestions(formData);
        if (missingQuestions.length > 0) {
            toast({
                title: "Incomplete Survey",
                description: (
                    <div>
                        <p>Please fill the following unanswered questions:</p>
                        <ul className="list-disc pl-5 mt-2 max-h-40 overflow-auto text-sm">
                            {missingQuestions.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ),
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);
        try {
            // Validate employee and get level
            const { data: employee } = await supabase
                .from("employees")
                .select("id, level")
                .eq("id_badge_number", formData.idBadgeNumber)
                .maybeSingle();
            if (!employee) {
                setIdError(
                    "ID Badge Number is not registered. Please double check and try again. If error persists, please contact HR Team."
                );
                toast({
                    title: "Invalid ID Badge Number",
                    description:
                        "ID Badge Number is not registered. Please double check and try again. If error persists, please contact HR Team.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }
            // Check for existing survey
            const { data: existing } = await supabase
                .from("survey_responses")
                .select("id")
                .eq("id_badge_number", formData.idBadgeNumber)
                .maybeSingle();
            if (existing) {
                setIdError(
                    "This ID Badge Number has already submitted a survey. If this is a mistake, please contact HR Team."
                );
                toast({
                    title: "Duplicate Submission",
                    description:
                        "This ID Badge Number has already submitted a survey. If this is a mistake, please contact HR Team.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }
            // Prepare insert data with default values for all required columns
            const insertData: any = {
                name: formData.name,
                id_badge_number: formData.idBadgeNumber,
                email: formData.email,
                department: formData.department,
                level: (employee as any).level || 'Non Managerial', // Store level at time of submission
                
                // Default values for all required HR columns
                hr_documentcontrol_question1: 0,
                hr_documentcontrol_question2: 0,
                hr_itsupport_question1: 0,
                hr_itsupport_question2: 0,
                hr_itfield_question1: 0,
                hr_itfield_question2: 0,
                hr_siteservice_question1: 0,
                hr_siteservice_question2: 0,
                hr_peopledev_question1: 0,
                hr_peopledev_question2: 0,
                hr_comben_question1: 0,
                hr_comben_question2: 0,
                hr_translator_question1: 0,
                hr_translator_question2: 0,
                hr_talentacquisition_question1: 0,
                hr_talentacquisition_question2: 0,
                hr_ir_question1: 0,
                hr_ir_question2: 0,
                
                // Default values for all required Environmental columns
                environmental_monitoring_question1: 0,
                environmental_monitoring_question2: 0,
                environmental_management_question1: 0,
                environmental_management_question2: 0,
                environmental_audit_question1: 0,
                environmental_audit_question2: 0,
                environmental_study_question1: 0,
                environmental_study_question2: 0,
                
                // Default values for all required External columns
                external_communityrelations_question1: 0,
                external_communityrelations_question2: 0,
                
                // Default values for all required SCM columns (including obsolete ones)
                scm_logistic_question1: 0,
                scm_logistic_question2: 0,
                scm_warehouse_question1: 0,
                scm_warehouse_question2: 0,
                scm_inventory_question1: 0,
                scm_inventory_question2: 0,
                scm_procurement_question1: 0,
                scm_procurement_question2: 0,
            };
            const deptConfig = [
                { formKey: "hr_sections", prefix: "hr", deptName: "Human Resources" },
                {
                    formKey: "environmental_sections",
                    prefix: "environmental",
                    deptName: "Environmental",
                },
                {
                    formKey: "external_sections",
                    prefix: "external",
                    deptName: "External Affair",
                },
                {
                    formKey: "scm_sections",
                    prefix: "scm",
                    deptName: "Supply Chain Management",
                },
            ];
            deptConfig.forEach(({ formKey, prefix, deptName }) => {
                const sectionsInForm = formData[formKey as keyof FormData] as {
                    [key: string]: SectionQuestions;
                };
                const deptSections =
                    departmentSections[deptName as keyof typeof departmentSections];
                if (!deptSections) return;
                const sectionToDbKey: { [key: string]: string } = {
                    "Monitoring": "monitoring",
                    "Management": "management",
                    "Audit & Compulsory": "audit",
                    "Study & Project": "study",
                    "Document Control": "documentcontrol",
                    "ICT System & Support": "itsupport",
                    "ICT Infrastructure & Network Security": "itfield",
                    "Site Service": "siteservice",
                    "People Development": "peopledev",
                    "Compensation & Benefit": "comben",
                    "Translator": "translator",
                    "Talent Acquisition": "talentacquisition",
                    "Industrial Relation": "ir",
                    "Asset Protection": "assetprotection",
                    "Community Relations": "communityrelations",
                    "Government Relations": "govrel",

                    "Logistic & Distribution": "logistic",
                    "Warehouse & Inventory": "warehouse",
                };
                sectionsInForm &&
                    Object.entries(sectionsInForm).forEach(([sectionLabel, sectionData]) => {
                        const dbKey = sectionToDbKey[sectionLabel];
                        if (!dbKey) {
                            console.warn(
                                `No dbKey mapping for section '${sectionLabel}' in department '${deptName}'`
                            );
                            return;
                        }
                        if (sectionData.question1 && sectionData.question2) {
                            insertData[`${prefix}_${dbKey}_question1`] = parseInt(
                                sectionData.question1
                            );
                            insertData[`${prefix}_${dbKey}_question2`] = parseInt(
                                sectionData.question2
                            );
                            insertData[`${prefix}_${dbKey}_feedback`] = sectionData.feedback || null;
                        }
                    });
            });
            // Try to insert with email first, fallback without email if column doesn't exist
            let { error } = await supabase.from("survey_responses").insert(insertData);
            
            // If email column doesn't exist, try without it
            if (error && (error.code === "PGRS7204" || error.message?.includes("Could not find the 'email' column"))) {
                console.warn("Email column not found, inserting without email field");
                const { email, ...insertDataWithoutEmail } = insertData;
                const { error: retryError } = await supabase.from("survey_responses").insert(insertDataWithoutEmail);
                if (retryError) throw retryError;
            } else if (error) {
                throw error;
            }
            
            // Update employee status to 'Submitted'
            // Note: Employee status tracking is not available as the employees table
            // doesn't have a status column. Survey submission is tracked in survey_responses table.
            
            // Auto-route based on employee level
            const employeeLevel = (employee as any).level;
            let redirectUrl = '/results'; // Default for admin
            
            if (employeeLevel === 'Managerial') {
                redirectUrl = '/results/managerial';
            } else if (employeeLevel === 'Non Managerial') {
                redirectUrl = '/results/non-managerial';
            }
            
            setIsSubmitted(true);
            toast({
                title: "Survey Submitted Successfully!",
                description: "Thank you for your feedback. Redirecting to results...",
            });
            
            // Redirect after a short delay
            setTimeout(() => {
                window.open(redirectUrl, '_blank');
            }, 2000);
        } catch (error: any) {
            console.error("Error submitting survey:", error);
            
            // Handle missing email column error (database schema issue)
            if (error?.code === "PGRS7204" || error?.message?.includes("Could not find the 'email' column")) {
                toast({
                    title: "Database Configuration Error",
                    description: (
                        <div>
                            <p>There's a database configuration issue. Please contact the system administrator.</p>
                            <p className="text-xs mt-2 text-muted-foreground">Error: Missing email column in survey_responses table</p>
                        </div>
                    ),
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }
            
            /*
              If error code 23502 (NOT NULL violation),
              show missing questions instead of generic error.
            */
            if (error?.code === "23502") {
                const missingQuestions = getMissingQuestions(formData);
                if (missingQuestions.length > 0) {
                    toast({
                        title: "Incomplete Survey",
                        description: (
                            <div>
                                <p>Please fill the following unanswered questions:</p>
                                <ul className="list-disc pl-5 mt-2 max-h-40 overflow-auto text-sm">
                                    {missingQuestions.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ),
                        variant: "destructive",
                    });
                    setIsSubmitting(false);
                    return;
                }
            }
            // Generic error toast fallback
            toast({
                title: "Submission Error",
                description: (
                    <div>
                        <p>
                            There was an error submitting your survey. Please ensure all fields are filled.
                        </p>
                    </div>
                ),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4 animate-fade-in">
                <Card className="w-full max-w-2xl text-center shadow-2xl animate-scale-in">
                    <CardContent className="p-12">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4 animate-scale-in">
                                <svg
                                    className="w-10 h-10 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-primary mb-4">Thank You!</h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            Your survey has been submitted successfully. We appreciate your
                            valuable feedback.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-4">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                <span>Redirecting to your results page...</span>
                            </div>
                            <p className="text-sm text-muted-foreground">You will be automatically redirected to view your relevant results.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // DepartmentTab component memoized to prevent unnecessary re-renders
    const DepartmentTab = React.memo(
        ({
            deptKey,
            deptName,
            section,
            questions,
            onSectionChange,
            onQuestionChange,
        }: {
            deptKey: "hr" | "environmental" | "external" | "scm";
            deptName: string;
            section: string;
            questions: SectionQuestions;
            onSectionChange: (value: string) => void;
            onQuestionChange: (field: keyof SectionQuestions, value: string) => void;
        }) => {
            const sections = getSectionsForDepartment(deptName);

            // Memoize image URLs and overview text to prevent unnecessary re-renders/flickers
            const teamImageSrc = useMemo(
                () => getImageForSection(deptName, section, "team"),
                [deptName, section]
            );
            const resultImageSrc = useMemo(
                () => getImageForSection(deptName, section, "result"),
                [deptName, section]
            );
            const overviewText = useMemo(
                () => getOverviewForSection(deptName, section),
                [deptName, section]
            );

            return (
                <div className="p-8 animate-fade-in">
                    <div className="space-y-6">
                        {/* Section Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Select Section to Evaluate <span className="text-destructive">*</span>
                            </Label>
                            <Select value={section} onValueChange={onSectionChange}>
                                <SelectTrigger className={`h-11 transition-all duration-200 focus:scale-105 ${
                                    section === "" 
                                        ? "border-red-400 bg-red-50" 
                                        : "border-green-400 bg-green-50"
                                }`}>
                                    <SelectValue placeholder="Select section to evaluate" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((sectionName) => (
                                        <SelectItem key={sectionName} value={sectionName}>
                                            {sectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {section && (
                            <>
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-primary tracking-wide flex items-center">
                                            <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                                            {section} Overview
                                        </h3>
                                        {/* Grid for Team Picture + Work Summary */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Team Picture */}
                                            {teamImageSrc && (
                                                <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer border border-slate-200">
                                                    <div
                                                        className="relative group cursor-pointer"
                                                        onClick={() => setEnlargedImage(teamImageSrc)}
                                                    >
                                                        <img
                                                            src={teamImageSrc}
                                                            alt={`${section} Team Picture`}
                                                            className="w-full h-48 object-cover rounded-lg mb-4 transition-all duration-300 group-hover:brightness-75 shadow-md"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <ZoomIn className="h-8 w-8 text-white" />
                                                        </div>
                                                    </div>
                                                    <h4 className="font-bold text-lg text-primary mb-3 tracking-wide">{section} Team Picture</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium tracking-wide text-justify">
                                                        {getImageDescriptionForSection(deptName, section, "team")}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Work Summary */}
                                            {resultImageSrc && (
                                                <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-slate-200">
                                                    <div
                                                        className="relative group cursor-pointer"
                                                        onClick={() => setEnlargedImage(resultImageSrc)}
                                                    >
                                                        <img
                                                            src={resultImageSrc}
                                                            alt={`${section} Work Summary`}
                                                            className="w-full h-48 object-cover rounded-lg mb-4 transition-all duration-300 group-hover:brightness-75 shadow-md"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <ZoomIn className="h-8 w-8 text-white" />
                                                        </div>
                                                    </div>
                                                    <h4 className="font-bold text-lg text-primary mb-3 tracking-wide">{section} Work Summary</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium tracking-wide text-justify">
                                                        {getImageDescriptionForSection(deptName, section, "result")}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Move this OUTSIDE the grid */}
                                        {overviewText && (
                                            <div className="mt-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-8 max-w-4xl border border-slate-200 shadow-sm">
                                                <h4 className="font-bold text-xl text-primary mb-4 tracking-wide flex items-center">
                                                    <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                                                    Role Overview
                                                </h4>
                                                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-medium tracking-wide text-justify">
                                                    {overviewText}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Questions Section */}
                                <div className="mt-8 space-y-6 max-w-4xl">
                                    <h3 className="text-xl font-bold text-primary tracking-wide flex items-center">
                                        <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                                        {section} Evaluation
                                    </h3>
                                    {/* Question 1 */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">
                                            1. Please rate the level of criticality of {section} towards your department.{" "}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <RadioGroup
                                            value={questions.question1 || ""}
                                            onValueChange={(value) => onQuestionChange("question1", value)}
                                            className={`flex space-x-4 p-3 rounded-md transition-all duration-200 ${
                                                questions.question1 === "" 
                                                    ? "bg-red-50 border border-red-200" 
                                                    : "bg-green-50 border border-green-200"
                                            }`}
                                        >
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <div key={rating} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={rating.toString()} id={`${deptKey}_q1_${rating}`} />
                                                    <Label htmlFor={`${deptKey}_q1_${rating}`} className="text-sm">
                                                        {rating}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                        <div className="text-xs text-muted-foreground space-y-1 mt-2 p-3 bg-gray-50 rounded-md border-l-4 border-gray-400">
                                            <p className="font-semibold text-gray-700 mb-2">Rating Description - Critical Level:</p>
                                            <p><span className="font-medium">5 = Extremely Critical:</span> My department cannot function effectively without this service</p>
                                            <p><span className="font-medium">4 = Very Critical:</span> The service significantly impacts my department performance</p>
                                            <p><span className="font-medium">3 = Moderately Critical:</span> The service has a noticeable impact on my department</p>
                                            <p><span className="font-medium">2 = Somewhat Critical:</span> The service has a minor impact on my department</p>
                                            <p><span className="font-medium">1 = Not Critical:</span> The service has little to no impact on my department</p>
                                        </div>
                                    </div>
                                    {/* Question 2 */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">
                                            2. How would you rate the service quality of {section} towards your department?{" "}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <RadioGroup
                                            value={questions.question2 || ""}
                                            onValueChange={(value) => onQuestionChange("question2", value)}
                                            className={`flex space-x-4 p-3 rounded-md transition-all duration-200 ${
                                                questions.question2 === "" 
                                                    ? "bg-red-50 border border-red-200" 
                                                    : "bg-green-50 border border-green-200"
                                            }`}
                                        >
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <div key={rating} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={rating.toString()} id={`${deptKey}_q2_${rating}`} />
                                                    <Label htmlFor={`${deptKey}_q2_${rating}`} className="text-sm">
                                                        {rating}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                        <div className="text-xs text-muted-foreground space-y-1 mt-2 p-3 bg-gray-50 rounded-md border-l-4 border-blue-400">
                                            <p className="font-semibold text-gray-700 mb-2">Rating Description - Service Quality Level:</p>
                                            <p><span className="font-medium">5 = Excellent:</span> Service exceeds expectations consistently</p>
                                            <p><span className="font-medium">4 = Good:</span> Service meets expectations and occasionally exceeds them</p>
                                            <p><span className="font-medium">3 = Average:</span> Service meets expectations but lacks in some areas</p>
                                            <p><span className="font-medium">2 = Poor:</span> Service frequently falls short of expectations</p>
                                            <p><span className="font-medium">1 = Very Poor:</span> Service is consistently below acceptable standards</p>
                                        </div>
                                    </div>
                                    {/* Feedback */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center">
                                            <span className="mr-2">💬</span>
                                            Additional Feedback
                                            <span className="text-destructive ml-1">*</span>
                                        </Label>
                                        <FeedbackTextarea
                                            value={questions.feedback || ""}
                                            onChange={(val) => onQuestionChange("feedback", val)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );
        }
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-t-lg shadow-lg p-6 border-b animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img src={mtiLogo} alt="MTI Logo" className="h-12 w-auto animate-scale-in" />
                            <div>
                                <h1 className="text-2xl font-bold text-primary">Employee Survey Satisfaction</h1>
                                <p className="text-secondary font-medium">Support Service Division</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Image Enlargement Dialog */}
                <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
                    <DialogContent className="max-w-4xl w-full h-[80vh] bg-black/90 p-4 border-none">
                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full" onClick={() => setEnlargedImage(null)}>
                            <X className="h-6 w-6" />
                        </Button>
                        {/* Scrollable wrapper */}
                        <div className="w-full h-full overflow-auto flex items-center justify-center">
                            <img src={enlargedImage} alt="Enlarged view" className="object-contain" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Form Content */}
                <Card className="rounded-t-none shadow-2xl animate-fade-in">
                    <CardContent className="p-0">
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="grid w-full grid-cols-5 rounded-none bg-muted h-14">
                                <TabsTrigger
                                    value="personal"
                                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                                >
                                    Personal Data
                                </TabsTrigger>
                                <TabsTrigger
                                    value="environmental"
                                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                                >
                                    Environmental
                                </TabsTrigger>
                                <TabsTrigger
                                    value="external"
                                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                                >
                                    External Affair
                                </TabsTrigger>
                                <TabsTrigger
                                    value="hr"
                                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                                >
                                    HR
                                </TabsTrigger>
                                <TabsTrigger
                                    value="scm"
                                    className="text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                                >
                                    SCM
                                </TabsTrigger>
                            </TabsList>
                            {/* Personal Data Tab */}
                            <TabsContent value="personal" className="p-8 animate-fade-in">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="idBadge" className="text-sm font-medium">
                                            ID Badge Number <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="idBadge"
                                            placeholder="Enter your ID badge number (e.g., MTI123456)"
                                            value={formData.idBadgeNumber}
                                            onChange={(e) => validateIdBadge(e.target.value)}
                                            onBlur={(e) => validateIdBadge(e.target.value)}
                                            className={`h-11 transition-colors duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                                idError 
                                                    ? "border-destructive focus:border-destructive focus-visible:border-destructive" 
                                                    : formData.idBadgeNumber.trim() === ""
                                                        ? "border-red-400 bg-red-50 focus:border-red-500 focus-visible:border-red-500"
                                                        : "border-green-400 bg-green-50 focus:border-green-500 focus-visible:border-green-500"
                                            }`}
                                        />
                                        {idError && <p className="text-sm text-destructive animate-fade-in">{idError}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email Address <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email address (e.g., john.doe@mti.com.my)"
                                            value={formData.email}
                                            onChange={(e) => validateEmail(e.target.value)}
                                            className={`h-11 transition-colors duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                                                emailError
                                                    ? "border-destructive focus:border-destructive focus-visible:border-destructive"
                                                    : formData.email.trim() === ""
                                                        ? "border-red-400 bg-red-50 focus:border-red-500 focus-visible:border-red-500"
                                                        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
                                                            ? "border-green-400 bg-green-50 focus:border-green-500 focus-visible:border-green-500"
                                                            : "border-red-400 bg-red-50 focus:border-red-500 focus-visible:border-red-500"
                                            }`}
                                        />
                                        {emailError && <p className="text-sm text-destructive animate-fade-in">{emailError}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Full Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="Full Name"
                                            value={formData.name}
                                            disabled={true}
                                            className="h-11 bg-muted cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="text-sm font-medium">
                                            Department <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="department"
                                            placeholder="Department"
                                            value={formData.department}
                                            disabled={true}
                                            className="h-11 bg-muted cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                            {/* Environmental Tab */}
                            <TabsContent value="environmental">
                                <DepartmentTab
                                    deptKey="environmental"
                                    deptName="Environmental"
                                    section={formData.environmental_section}
                                    questions={
                                        formData.environmental_sections[formData.environmental_section] ??
                                        emptySectionQuestions
                                    }
                                    onSectionChange={handleEnvironmentalSectionChange}
                                    onQuestionChange={handleEnvironmentalQuestionChange}
                                />
                            </TabsContent>
                            {/* External Tab */}
                            <TabsContent value="external">
                                <DepartmentTab
                                    deptKey="external"
                                    deptName="External Affair"
                                    section={formData.external_section}
                                    questions={
                                        formData.external_sections[formData.external_section] ?? emptySectionQuestions
                                    }
                                    onSectionChange={handleExternalSectionChange}
                                    onQuestionChange={handleExternalQuestionChange}
                                />
                            </TabsContent>
                            {/* HR Tab */}
                            <TabsContent value="hr">
                                <DepartmentTab
                                    deptKey="hr"
                                    deptName="Human Resources"
                                    section={formData.hr_section}
                                    questions={formData.hr_sections[formData.hr_section] ?? emptySectionQuestions}
                                    onSectionChange={handleHrSectionChange}
                                    onQuestionChange={handleHrQuestionChange}
                                />
                            </TabsContent>
                            {/* SCM Tab */}
                            <TabsContent value="scm">
                                <DepartmentTab
                                    deptKey="scm"
                                    deptName="Supply Chain Management"
                                    section={formData.scm_section}
                                    questions={formData.scm_sections[formData.scm_section] ?? emptySectionQuestions}
                                    onSectionChange={handleSCMSectionChange}
                                    onQuestionChange={handleSCMQuestionChange}
                                />
                            </TabsContent>
                        </Tabs>
                        {/* Submit Button */}
                        <div className="p-8 border-t bg-muted/30">
                            <Button
                                onClick={handleSubmit}
                                disabled={!isFormValid() || isSubmitting}
                                className="w-full h-12 text-lg font-medium relative overflow-hidden group"
                                size="lg"
                            >
                                <span className="relative z-10">
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Submitting Survey...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <span className="mr-2">📋</span>
                                            Submit Survey
                                        </div>
                                    )}
                                </span>
                                {!isSubmitting && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                )}
                            </Button>
                            
                            {!isFormValid() && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-800 text-center flex items-center justify-center">
                                        <span className="mr-2">⚠️</span>
                                        Please enter a valid ID Badge Number, email address, and complete all department evaluations.
                                    </p>
                                </div>
                            )}
                            
                            {isFormValid() && !isSubmitting && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm text-green-800 text-center flex items-center justify-center">
                                        <span className="mr-2">✅</span>
                                        Survey is complete and ready to submit!
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SurveyForm;
