import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { 
  Users, 
  TrendingUp, 
  Award, 
  AlertCircle,
  Download,
  RefreshCw,
  Calendar,
  Building2,
  Star,
  BarChart3,
  LogOut,
  Shield,
  Menu,
  LayoutDashboard,
  FileText,
  ChevronDown,
  ChevronRight,
  Loader2
} from "lucide-react";
import mtiLogo from "@/assets/mti-logo.png";

interface SurveyResponse {
  id: string;
  name: string;
  id_badge_number: string;
  department: string;
  created_at: string;
  level?: string;
  employee_department?: string;
  employee_name?: string;
  employee_email?: string;
  employees?: {
    level: string;
    department: string;
    name: string;
    email?: string;
  };
  [key: string]: any;
}

interface DepartmentStats {
  department: string;
  totalResponses: number;
  averageRating: number;
  sections: {
    [key: string]: {
      averageRating: number;
      responseCount: number;
      ratings: number[];
    };
  };
}

interface OverallStats {
  totalResponses: number;
  averageRating: number;
  completionRate: number;
  topRatedSection: string;
  lowestRatedSection: string;
}

// Enhanced color palette for better accessibility and visual appeal
const COLORS = [
  '#3B82F6', // Blue - Professional and trustworthy
  '#10B981', // Emerald - Success and growth
  '#F59E0B', // Amber - Attention and energy
  '#EF4444', // Red - Urgency and importance
  '#8B5CF6', // Violet - Innovation and creativity
  '#06B6D4', // Cyan - Fresh and modern
  '#F97316', // Orange - Warmth and enthusiasm
  '#84CC16'  // Lime - Nature and balance
];

const SurveyResults = () => {
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
  const [isSubmissionLoading, setIsSubmissionLoading] = useState(false);
  const [isUserManagementLoading, setIsUserManagementLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState("results");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get current user role from session storage
  const getCurrentUserRole = () => {
    try {
      const adminUser = sessionStorage.getItem("adminUser");
      if (adminUser) {
        const user = JSON.parse(adminUser);
        return user.role?.toLowerCase() || 'viewer';
      }
    } catch (error) {
      console.error('Error parsing admin user from session storage:', error);
    }
    return 'viewer';
  };

  const currentUserRole = getCurrentUserRole();

  // Check authentication
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

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

  const departmentMapping = {
    "Human Resources": "hr",
    "Environmental": "environmental", 
    "External Affair": "external",
    "Supply Chain Management": "scm"
  };

  const sectionMapping: { [key: string]: { [key: string]: string } } = {
    "hr": {
      "documentcontrol": "Document Control",
      "itsupport": "ICT System & Support",
      "itfield": "ICT Infrastructure & Network Security",
      "siteservice": "Site Service",
      "peopledev": "People Development",
      "comben": "Compensation & Benefit",
      "translator": "Translator",
      "talentacquisition": "Talent Acquisition",
      "ir": "Industrial Relation"
    },
    "environmental": {
      "monitoring": "Monitoring",
      "management": "Management",
      "audit": "Audit & Compulsory",
      "study": "Study & Project"
    },
    "external": {
      "assetprotection": "Asset Protection",
      "communityrelations": "Community Relations",
      "govrel": "Government Relations"
    },
    "scm": {
      "logistic": "Logistic & Distribution",
      "warehouse": "Warehouse & Inventory",
      "inventory": "Inventory",
      "procurement": "Procurement"
    }
  };

  // Handle route-based filtering and active menu state
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/managerial')) {
      setLevelFilter('Managerial');
      setActiveMenuItem('results-managerial');
      setResultsExpanded(true);
    } else if (path.includes('/non-managerial')) {
      setLevelFilter('Non Managerial');
      setActiveMenuItem('results-non-managerial');
      setResultsExpanded(true);
    } else if (path.includes('/user-management')) {
      setActiveMenuItem('user-management');
      setResultsExpanded(false);
    } else if (path.includes('/results')) {
      setLevelFilter('all');
      setActiveMenuItem('results');
      setResultsExpanded(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchSurveyData();
  }, [levelFilter]);

  // Listen for survey data changes from other components (e.g., when employee is deleted)
  useEffect(() => {
    const handleSurveyDataChanged = () => {
      console.log("📡 Received surveyDataChanged event - refreshing data");
      fetchSurveyData();
    };

    window.addEventListener('surveyDataChanged', handleSurveyDataChanged);

    return () => {
      window.removeEventListener('surveyDataChanged', handleSurveyDataChanged);
    };
  }, []);

  const fetchSurveyData = async (isRefresh = false) => {
    try {
      console.log("🔄 Fetching survey data...");
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Get all survey responses with employee level information using LEFT JOIN on id_badge_number
      // This ensures ALL survey responses are included, even if no matching employee record exists
      // Using manual approach since there's no foreign key constraint
      const { data: surveyData, error: surveyError } = await supabase
        .from("survey_responses")
        .select(`
          *
        `)
        .order("created_at", { ascending: false });

      if (surveyError) throw surveyError;

      // Manually fetch employee data for each survey response
       const enrichedSurveyData = [];
       for (const response of surveyData || []) {
         const { data: employeeData } = await supabase
           .from("employees")
           .select("level, department, name, email")
           .eq("id_badge_number", response.id_badge_number)
           .single();
         
         enrichedSurveyData.push({
           ...response,
           employees: employeeData || null
         });
       }

       console.log("📊 Raw survey responses from database:", surveyData?.length || 0);
      
      // Transform data to include level and email from employees table
      const enrichedData = (enrichedSurveyData || []).map(response => ({
        ...response,
        level: (response.employees?.level || 'Non Managerial').replace('Non-Managerial', 'Non Managerial'),
        employee_department: response.employees?.department || response.department,
        employee_name: response.employees?.name || response.name,
        employee_email: response.employees?.email || ''
      }));

      console.log("📊 Enriched survey responses:", enrichedData?.length || 0);
      
      // Log level distribution
      const levelCounts = enrichedData.reduce((acc, response) => {
        acc[response.level] = (acc[response.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log("📊 Level distribution:", levelCounts);
      
      // Count responses without matching employee records
      const responsesWithoutEmployeeMatch = enrichedData.filter(response => !response.employees).length;
      if (responsesWithoutEmployeeMatch > 0) {
        console.log("⚠️  Survey responses without matching employee records:", responsesWithoutEmployeeMatch);
      }

      // Filter data based on current level filter
      let filteredData = enrichedData;
      if (levelFilter !== 'all') {
        console.log(`🔍 Filtering by level: "${levelFilter}"`);
        filteredData = enrichedData.filter(response => {
          // Handle both formats: 'Non Managerial' and 'Non-Managerial'
          if (levelFilter === 'Non Managerial') {
            return response.level === 'Non Managerial' || response.level === 'Non-Managerial';
          }
          return response.level === levelFilter;
        });
        console.log(`🔍 Filtered results: ${filteredData.length} out of ${enrichedData.length}`);
      }

      console.log("📊 Final filtered survey responses:", filteredData?.length || 0, "(Level filter:", levelFilter, ")");
      console.log("📋 Sample response with level:", filteredData[0] ? {
        name: filteredData[0].name,
        level: filteredData[0].level,
        department: filteredData[0].department,
        hasEmployeeMatch: !!filteredData[0].employees
      } : 'No responses');
      
      setSurveyData(filteredData);
      processStatistics(filteredData);
    } catch (error: any) {
      console.error("Error fetching survey data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch survey results. " + (error.message || 'Please try again.'),
        variant: "destructive",
      });
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Function to convert database column names to proper display names
  const getSectionDisplayName = (sectionKey: string): string => {
    const sectionMapping: { [key: string]: string } = {
      // HR sections
      'documentcontrol': 'Document Control',
      'itsupport': 'ICT System & Support',
      'itfield': 'ICT Infrastructure & Network Security',
      'siteservice': 'Site Service',
      'peopledev': 'People Development',
      'comben': 'Compensation & Benefit',
      'translator': 'Translator',
      'talentacquisition': 'Talent Acquisition',
      'ir': 'Industrial Relation',
      
      // Environmental sections
      'monitoring': 'Monitoring',
      'management': 'Management',
      'audit': 'Audit & Compulsory',
      'study': 'Study & Project',
      
      // External sections
      'assetprotection': 'Asset Protection',
      'communityrelations': 'Community Relations',
      'govrel': 'Government Relations',
      
      // SCM sections
      'logistic': 'Logistic & Distribution',
      'warehouse': 'Warehouse & Inventory',
      'inventory': 'Warehouse & Inventory',
      'procurement': 'Procurement'
    };
    
    return sectionMapping[sectionKey] || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
  };

  const processStatistics = (data: SurveyResponse[]) => {
    console.log("Processing statistics for data:", data);
    
    const deptStats: { [key: string]: DepartmentStats } = {};
    let totalRatings = 0;
    let totalRatingCount = 0;
    const sectionRatings: { [key: string]: number[] } = {};

    // Define all possible rating columns
    const allRatingColumns = [
      // HR columns
      'hr_documentcontrol_question1', 'hr_documentcontrol_question2',
      'hr_itsupport_question1', 'hr_itsupport_question2',
      'hr_itfield_question1', 'hr_itfield_question2',
      'hr_siteservice_question1', 'hr_siteservice_question2',
      'hr_peopledev_question1', 'hr_peopledev_question2',
      'hr_comben_question1', 'hr_comben_question2',
      'hr_translator_question1', 'hr_translator_question2',
      'hr_talentacquisition_question1', 'hr_talentacquisition_question2',
      'hr_ir_question1', 'hr_ir_question2',
      
      // Environmental columns
      'environmental_monitoring_question1', 'environmental_monitoring_question2',
      'environmental_management_question1', 'environmental_management_question2',
      'environmental_audit_question1', 'environmental_audit_question2',
      'environmental_study_question1', 'environmental_study_question2',
      
      // External columns
      'external_assetprotection_question1', 'external_assetprotection_question2',
      'external_communityrelations_question1', 'external_communityrelations_question2',
      'external_govrel_question1', 'external_govrel_question2',
      
      // SCM columns
      'scm_logistic_question1', 'scm_logistic_question2',
      'scm_warehouse_question1', 'scm_warehouse_question2',
      'scm_inventory_question1', 'scm_inventory_question2',
      'scm_procurement_question1', 'scm_procurement_question2'
    ];

    // Process each response
    data.forEach((response) => {
      console.log("Processing response:", response);
      
      const dept = response.department;
      if (!deptStats[dept]) {
        deptStats[dept] = {
          department: dept,
          totalResponses: 0,
          averageRating: 0,
          sections: {}
        };
      }

      deptStats[dept].totalResponses++;

      // Process all rating columns for this response
      for (let i = 0; i < allRatingColumns.length; i += 2) {
        const question1Key = allRatingColumns[i];
        const question2Key = allRatingColumns[i + 1];
        
        const rating1 = response[question1Key];
        const rating2 = response[question2Key];
        
        console.log(`Checking ${question1Key} and ${question2Key}:`, rating1, rating2);
        
        if (rating1 > 0 && rating2 > 0) {
          const avgRating = (rating1 + rating2) / 2;
          console.log("Average rating calculated:", avgRating);
          
          // Extract section name from column name and get proper display name
          const sectionKey = question1Key.replace(/_question1$/, '').replace(/^(hr|environmental|external|scm)_/, '');
          const displaySectionName = getSectionDisplayName(sectionKey);
          
          if (!deptStats[dept].sections[displaySectionName]) {
            deptStats[dept].sections[displaySectionName] = {
              averageRating: 0,
              responseCount: 0,
              ratings: []
            };
          }
          
          deptStats[dept].sections[displaySectionName].ratings.push(avgRating);
          deptStats[dept].sections[displaySectionName].responseCount++;
          
          // For overall stats
          totalRatings += avgRating;
          totalRatingCount++;
          
          if (!sectionRatings[displaySectionName]) {
            sectionRatings[displaySectionName] = [];
          }
          sectionRatings[displaySectionName].push(avgRating);
        }
      }
    });

    console.log("Total ratings:", totalRatings, "Total count:", totalRatingCount);

    // Calculate averages
    Object.values(deptStats).forEach((dept) => {
      let deptTotalRating = 0;
      let deptRatingCount = 0;
      
      Object.values(dept.sections).forEach((section) => {
        const sum = section.ratings.reduce((a, b) => a + b, 0);
        section.averageRating = sum / section.ratings.length;
        deptTotalRating += sum;
        deptRatingCount += section.ratings.length;
      });
      
      dept.averageRating = deptRatingCount > 0 ? deptTotalRating / deptRatingCount : 0;
    });

    // Calculate overall stats
    const overallAverage = totalRatingCount > 0 ? totalRatings / totalRatingCount : 0;
    console.log("Overall average calculated:", overallAverage);
    
    // Helper function to calculate variance
    const calculateVariance = (ratings: number[]) => {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const variance = ratings.reduce((sum, rating) => sum + Math.pow(rating - avg, 2), 0) / ratings.length;
      return variance;
    };

    // Find top rated sections with tie handling
    let topSections: string[] = [];
    let lowestSections: string[] = [];
    let highestAvg = 0;
    let lowestAvg = 5;
    
    // First pass: find highest and lowest averages
    Object.entries(sectionRatings).forEach(([sectionName, ratings]) => {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (avg > highestAvg) {
        highestAvg = avg;
      }
      if (avg < lowestAvg) {
        lowestAvg = avg;
      }
    });

    // Second pass: collect all sections with highest/lowest averages
    Object.entries(sectionRatings).forEach(([sectionName, ratings]) => {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (Math.abs(avg - highestAvg) < 0.001) { // Use small epsilon for floating point comparison
        topSections.push(sectionName);
      }
      if (Math.abs(avg - lowestAvg) < 0.001) {
        lowestSections.push(sectionName);
      }
    });

    // Handle ties for top rated section
    let topSection = "";
    if (topSections.length === 1) {
      topSection = topSections[0];
    } else if (topSections.length > 1) {
      // Tie-breaker 1: Most responses
      const topSectionsByResponses = topSections.map(section => ({
        section,
        responseCount: sectionRatings[section].length
      })).sort((a, b) => b.responseCount - a.responseCount);
      
      const maxResponses = topSectionsByResponses[0].responseCount;
      const topWithMaxResponses = topSectionsByResponses.filter(s => s.responseCount === maxResponses);
      
      if (topWithMaxResponses.length === 1) {
        topSection = topWithMaxResponses[0].section;
      } else {
        // Tie-breaker 2: Lowest variance (most consistent ratings)
        const topWithVariance = topWithMaxResponses.map(s => ({
          section: s.section,
          variance: calculateVariance(sectionRatings[s.section])
        })).sort((a, b) => a.variance - b.variance);
        
        topSection = topWithVariance.length > 1 
          ? topWithVariance.map(s => s.section).join(", ") // Multiple winners after all tie-breakers
          : topWithVariance[0].section;
      }
    }

    // Handle ties for lowest rated section (needs attention)
    let lowestSection = "";
    if (lowestSections.length === 1) {
      lowestSection = lowestSections[0];
    } else if (lowestSections.length > 1) {
      // Tie-breaker 1: Most responses
      const lowestSectionsByResponses = lowestSections.map(section => ({
        section,
        responseCount: sectionRatings[section].length
      })).sort((a, b) => b.responseCount - a.responseCount);
      
      const maxResponses = lowestSectionsByResponses[0].responseCount;
      const lowestWithMaxResponses = lowestSectionsByResponses.filter(s => s.responseCount === maxResponses);
      
      if (lowestWithMaxResponses.length === 1) {
        lowestSection = lowestWithMaxResponses[0].section;
      } else {
        // Tie-breaker 2: Lowest variance (most consistent ratings)
        const lowestWithVariance = lowestWithMaxResponses.map(s => ({
          section: s.section,
          variance: calculateVariance(sectionRatings[s.section])
        })).sort((a, b) => a.variance - b.variance);
        
        lowestSection = lowestWithVariance.length > 1 
          ? lowestWithVariance.map(s => s.section).join(", ") // Multiple winners after all tie-breakers
          : lowestWithVariance[0].section;
      }
    }

    setDepartmentStats(Object.values(deptStats));
    setOverallStats({
      totalResponses: data.length,
      averageRating: overallAverage,
      completionRate: 100, // Assuming all submitted surveys are complete
      topRatedSection: topSection,
      lowestRatedSection: lowestSection
    });
  };

  const calculateResponseAverageRating = (response: SurveyResponse): number => {
    const allRatingColumns = [
      // HR columns
      'hr_documentcontrol_question1', 'hr_documentcontrol_question2',
      'hr_itsupport_question1', 'hr_itsupport_question2',
      'hr_itfield_question1', 'hr_itfield_question2',
      'hr_siteservice_question1', 'hr_siteservice_question2',
      'hr_peopledev_question1', 'hr_peopledev_question2',
      'hr_comben_question1', 'hr_comben_question2',
      'hr_translator_question1', 'hr_translator_question2',
      'hr_talentacquisition_question1', 'hr_talentacquisition_question2',
      'hr_ir_question1', 'hr_ir_question2',
      
      // Environmental columns
      'environmental_monitoring_question1', 'environmental_monitoring_question2',
      'environmental_management_question1', 'environmental_management_question2',
      'environmental_audit_question1', 'environmental_audit_question2',
      'environmental_study_question1', 'environmental_study_question2',
      
      // External columns
      'external_assetprotection_question1', 'external_assetprotection_question2',
      'external_communityrelations_question1', 'external_communityrelations_question2',
      'external_govrel_question1', 'external_govrel_question2',
      
      // SCM columns
      'scm_logistic_question1', 'scm_logistic_question2',
      'scm_warehouse_question1', 'scm_warehouse_question2',
      'scm_inventory_question1', 'scm_inventory_question2',
      'scm_procurement_question1', 'scm_procurement_question2'
    ];

    let totalRating = 0;
    let ratingCount = 0;

    // Process all rating columns for this response
    for (let i = 0; i < allRatingColumns.length; i += 2) {
      const question1Key = allRatingColumns[i];
      const question2Key = allRatingColumns[i + 1];
      
      const rating1 = response[question1Key];
      const rating2 = response[question2Key];
      
      if (rating1 > 0 && rating2 > 0) {
        const avgRating = (rating1 + rating2) / 2;
        totalRating += avgRating;
        ratingCount++;
      }
    }

    return ratingCount > 0 ? totalRating / ratingCount : 0;
  };

  const exportResults = async () => {
    try {
      setIsExporting(true);
      // Create detailed CSV with section-wise ratings
    const headers = [
      "Name",
      "ID Badge", 
      "Email Address",
      "Department",
      "Submission Date",
      "Overall Average Rating",
      // HR Sections - Ratings
      "Document Control",
      "Document Control Feedback",
      "ICT System & Support", 
      "ICT System & Support Feedback",
      "ICT Infrastructure & Network Security",
      "ICT Infrastructure & Network Security Feedback",
      "Site Service",
      "Site Service Feedback",
      "People Development",
      "People Development Feedback",
      "Compensation & Benefit",
      "Compensation & Benefit Feedback",
      "Translator",
      "Translator Feedback",
      "Talent Acquisition",
      "Talent Acquisition Feedback",
      "Industrial Relation",
      "Industrial Relation Feedback",
      // Environmental Sections - Ratings
      "Environmental Monitoring",
      "Environmental Monitoring Feedback",
      "Environmental Management", 
      "Environmental Management Feedback",
      "Environmental Audit & Compulsory",
      "Environmental Audit & Compulsory Feedback",
      "Environmental Study & Project",
      "Environmental Study & Project Feedback",
      // External Sections - Ratings
      "Asset Protection",
      "Asset Protection Feedback",
      "Community Relations",
      "Community Relations Feedback",
      "Government Relations",
      "Government Relations Feedback",
      // SCM Sections - Ratings
      "Logistic & Distribution",
      "Logistic & Distribution Feedback",
      "Warehouse & Inventory",
      "Warehouse & Inventory Feedback"
    ];

    const csvRows = [
      headers.join(","),
      ...surveyData.map(response => {
        const overallRating = calculateResponseAverageRating(response);
        
        // Calculate section ratings
        const getSectionRating = (q1Key: string, q2Key: string) => {
          const rating1 = response[q1Key];
          const rating2 = response[q2Key];
          if (rating1 > 0 && rating2 > 0) {
            return ((rating1 + rating2) / 2).toFixed(2);
          }
          return "N/A";
        };

        const getFeedback = (feedbackKey: string) => {
          const feedback = response[feedbackKey];
          return feedback ? `"${feedback.replace(/"/g, '""')}"` : "N/A";
        };

        const row = [
          `"${response.name}"`,
          response.id_badge_number,
          `"${response.employee_email || 'N/A'}"`,
          `"${response.department}"`,
          new Date(response.created_at).toLocaleDateString(),
          overallRating.toFixed(2),
          // HR Sections
          getSectionRating('hr_documentcontrol_question1', 'hr_documentcontrol_question2'),
          getFeedback('hr_documentcontrol_feedback'),
          getSectionRating('hr_itsupport_question1', 'hr_itsupport_question2'),
          getFeedback('hr_itsupport_feedback'),
          getSectionRating('hr_itfield_question1', 'hr_itfield_question2'),
          getFeedback('hr_itfield_feedback'),
          getSectionRating('hr_siteservice_question1', 'hr_siteservice_question2'),
          getFeedback('hr_siteservice_feedback'),
          getSectionRating('hr_peopledev_question1', 'hr_peopledev_question2'),
          getFeedback('hr_peopledev_feedback'),
          getSectionRating('hr_comben_question1', 'hr_comben_question2'),
          getFeedback('hr_comben_feedback'),
          getSectionRating('hr_translator_question1', 'hr_translator_question2'),
          getFeedback('hr_translator_feedback'),
          getSectionRating('hr_talentacquisition_question1', 'hr_talentacquisition_question2'),
          getFeedback('hr_talentacquisition_feedback'),
          getSectionRating('hr_ir_question1', 'hr_ir_question2'),
          getFeedback('hr_ir_feedback'),
          // Environmental Sections
          getSectionRating('environmental_monitoring_question1', 'environmental_monitoring_question2'),
          getFeedback('environmental_monitoring_feedback'),
          getSectionRating('environmental_management_question1', 'environmental_management_question2'),
          getFeedback('environmental_management_feedback'),
          getSectionRating('environmental_audit_question1', 'environmental_audit_question2'),
          getFeedback('environmental_audit_feedback'),
          getSectionRating('environmental_study_question1', 'environmental_study_question2'),
          getFeedback('environmental_study_feedback'),
          // External Sections
          getSectionRating('external_assetprotection_question1', 'external_assetprotection_question2'),
          getFeedback('external_assetprotection_feedback'),
          getSectionRating('external_communityrelations_question1', 'external_communityrelations_question2'),
          getFeedback('external_communityrelations_feedback'),
          getSectionRating('external_govrel_question1', 'external_govrel_question2'),
          getFeedback('external_govrel_feedback'),
          // SCM Sections
          getSectionRating('scm_logistic_question1', 'scm_logistic_question2'),
          getFeedback('scm_logistic_feedback'),
          getSectionRating('scm_warehouse_question1', 'scm_warehouse_question2'),
          getFeedback('scm_warehouse_feedback')
        ];
        
        return row.join(",");
      })
    ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey-results-detailed-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Survey results have been exported to CSV.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the survey results.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBadgeVariant = (rating: number): "default" | "secondary" | "destructive" | "outline" => {
    if (rating >= 4.5) return "default";
    if (rating >= 3.5) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
            <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full bg-blue-100 animate-pulse opacity-30"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">Loading survey results...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch the latest data</p>
          </div>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredStats = selectedDepartment === "all" 
    ? departmentStats 
    : departmentStats.filter(dept => dept.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <nav 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md shadow-xl border-r border-gray-200/50 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 border-b flex-shrink-0 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <img src={mtiLogo} alt="MTI Logo" className="h-8 w-auto" />
            </div>
            <div className="text-white">
              <div className="text-base sm:text-lg font-bold leading-tight">Employee Satisfaction</div>
              <div className="text-xs sm:text-sm opacity-90">Survey System</div>
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
        
        <div className="flex-1 mt-4 sm:mt-6 px-3 sm:px-4 overflow-y-auto" role="menu">
          <div className="space-y-2 sm:space-y-3">
            <button
                            onClick={async () => {
                                setIsEmployeeLoading(true);
                                try {
                                    // Simulate loading delay for better UX
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                    setActiveMenuItem("dashboard");
                                    navigate("/employee");
                                } catch (error) {
                                    console.error('Navigation error:', error);
                                    toast({
                                        title: "Navigation Error",
                                        description: "Failed to navigate to Employee Dashboard. Please try again.",
                                        variant: "destructive",
                                    });
                                } finally {
                                    setIsEmployeeLoading(false);
                                }
                            }}
                            disabled={isEmployeeLoading}
                            className={`w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                                activeMenuItem === "dashboard"
                                    ? "text-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600 shadow-md"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm border-l-4 border-transparent"
                            }}`}
                            role="menuitem"
                            aria-label="Navigate to Employee Dashboard"
                            aria-current={activeMenuItem === "dashboard" ? "page" : undefined}
                        >
                            {isEmployeeLoading ? (
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" aria-hidden="true" />
                            ) : (
                                <LayoutDashboard className="mr-3 h-5 w-5" aria-hidden="true" />
                            )}
                            {isEmployeeLoading ? "Loading..." : "Employee"}
                        </button>
            <button
              onClick={async () => {
                setIsSubmissionLoading(true);
                try {
                  // Simulate loading delay for better UX
                  await new Promise(resolve => setTimeout(resolve, 500));
                  setActiveMenuItem("submission");
                  navigate("/submission");
                } catch (error) {
                  console.error('Navigation error:', error);
                  toast({
                    title: "Navigation Error",
                    description: "Failed to navigate to Submission page. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setIsSubmissionLoading(false);
                }
              }}
              disabled={isSubmissionLoading}
              className={`w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                activeMenuItem === "submission"
                  ? "text-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm border-l-4 border-transparent"
              }}`}
              role="menuitem"
              aria-label="Navigate to Submission page"
              aria-current={activeMenuItem === "submission" ? "page" : undefined}
            >
              {isSubmissionLoading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <FileText className="mr-3 h-5 w-5" aria-hidden="true" />
              )}
              {isSubmissionLoading ? "Loading..." : "Submission"}
            </button>
            {/* User Management - Hidden for Manager role */}
            {currentUserRole !== 'manager' && (
              <button
                onClick={async () => {
                  setIsUserManagementLoading(true);
                  try {
                    // Simulate loading delay for better UX
                    await new Promise(resolve => setTimeout(resolve, 500));
                    setActiveMenuItem("user-management");
                    navigate("/user-management");
                  } catch (error) {
                    console.error('Navigation error:', error);
                    toast({
                      title: "Navigation Error",
                      description: "Failed to navigate to User Management. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsUserManagementLoading(false);
                  }
                }}
                disabled={isUserManagementLoading}
                className={`w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  activeMenuItem === "user-management"
                    ? "text-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm border-l-4 border-transparent"
                }`}
                role="menuitem"
                aria-label="Navigate to User Management"
                aria-current={activeMenuItem === "user-management" ? "page" : undefined}
              >
                {isUserManagementLoading ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Users className="mr-3 h-5 w-5" aria-hidden="true" />
                )}
                {isUserManagementLoading ? "Loading..." : "User Management"}
              </button>
            )}
            {/* Results Menu with Sub-items */}
            <div className="relative">
              <button
                onClick={() => {
                  setResultsExpanded(!resultsExpanded);
                }}
                className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out shadow-sm hover:scale-[1.02] hover:shadow-lg transform ${
                  activeMenuItem.includes("results")
                    ? "text-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600 shadow-md scale-[1.01]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm border-l-4 border-transparent"
                }} group`}
                role="menuitem"
                aria-label="Toggle Results submenu"
                aria-expanded={resultsExpanded}
                aria-controls="results-submenu"
              >
                <div className="flex items-center">
                  <BarChart3 className={`mr-3 h-5 w-5 transition-all duration-300 ${
                    activeMenuItem.includes("results") ? "text-purple-600 scale-110" : "group-hover:scale-110"
                  }`} aria-hidden="true" />
                  <span className="transition-all duration-200 group-hover:translate-x-1">Results</span>
                </div>
                <div className={`transition-all duration-300 ease-in-out ${
                  resultsExpanded ? "rotate-180" : "rotate-0"
                }`}>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </div>
              </button>
              
              {/* Sub-menu items with slide animation */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  resultsExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
                id="results-submenu" 
                role="menu"
              >
                <div className={`ml-4 mt-2 space-y-2 border-l-2 border-purple-200 pl-4 transform transition-all duration-300 ease-in-out ${
                  resultsExpanded ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`}>
                  <button
                    onClick={() => {
                      setActiveMenuItem("results-managerial");
                      navigate("/results/managerial");
                    }}
                    className={`w-full flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md transform group ${
                      activeMenuItem === "results-managerial"
                        ? "text-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm scale-[1.01] border border-purple-200"
                        : "text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-sm hover:border hover:border-purple-200"
                    }`}
                    role="menuitem"
                    aria-label="Navigate to Managerial Results"
                    aria-current={activeMenuItem === "results-managerial" ? "page" : undefined}
                  >
                    <Users className={`mr-3 h-4 w-4 transition-all duration-300 ${
                      activeMenuItem === "results-managerial" ? "text-purple-600 scale-110" : "group-hover:scale-110 group-hover:text-purple-600"
                    }`} aria-hidden="true" />
                    <span className="transition-all duration-200 group-hover:translate-x-1">Managerial</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenuItem("results-non-managerial");
                      navigate("/results/non-managerial");
                    }}
                    className={`w-full flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md transform group ${
                      activeMenuItem === "results-non-managerial"
                        ? "text-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm scale-[1.01] border border-purple-200"
                        : "text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-sm hover:border hover:border-purple-200"
                    }`}
                    role="menuitem"
                    aria-label="Navigate to Non-Managerial Results"
                    aria-current={activeMenuItem === "results-non-managerial" ? "page" : undefined}
                  >
                    <Shield className={`mr-3 h-4 w-4 transition-all duration-300 ${
                      activeMenuItem === "results-non-managerial" ? "text-purple-600 scale-110" : "group-hover:scale-110 group-hover:text-purple-600"
                    }`} aria-hidden="true" />
                    <span className="transition-all duration-200 group-hover:translate-x-1">Non Managerial</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        
        </div>
        
        {/* Logout section */}
        <div className="border-t flex-shrink-0 p-4">
          <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to logout? You will need to login again to access the admin panel.
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
      </nav>
      
      {sidebarOpen ? (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 z-30">
          <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
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
                  <img src={mtiLogo} alt="MTI Logo" className="h-8 sm:h-10 w-auto" />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />
                      Survey Analytics Employee
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">Employee Satisfaction Analysis & Insights</p>
                  </div>
                </div>
                <div className="lg:hidden">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Analytics</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full p-4 sm:p-6 pt-20 sm:pt-24 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 leading-tight">
                  {levelFilter === 'Managerial' ? 'Managerial Results Employee' :
                        levelFilter === 'Non Managerial' ? 'Non Managerial Results Employee' :
                        'Survey Results Employee'}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {levelFilter === 'Managerial' ? 'Analysis of managerial employee satisfaction survey responses' :
                   levelFilter === 'Non Managerial' ? 'Analysis of non-managerial employee satisfaction survey responses' :
                   'Comprehensive analysis of employee satisfaction survey responses'}
                </p>
                {levelFilter !== 'all' && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      Filtered by: {levelFilter} Level
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => fetchSurveyData(true)} 
                  variant="outline" 
                  size="sm" 
                  className="w-full sm:w-auto hover:scale-105 transition-transform" 
                  disabled={isRefreshing || loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  <span className="sm:hidden">{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                </Button>
                {/* Export CSV - Hidden for Viewer role */}
                {currentUserRole !== 'viewer' && (
                  <Button 
                    onClick={exportResults} 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto hover:scale-105 transition-transform" 
                    disabled={isExporting || loading}
                  >
                    <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                    <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                    <span className="sm:hidden">{isExporting ? 'Exporting...' : 'Export'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Overall Statistics Cards or Zero State */}
            {overallStats && overallStats.totalResponses > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50/30">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Responses</p>
                        <p className="text-xl sm:text-2xl font-bold">{overallStats.totalResponses}</p>
                      </div>
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                        <Users className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-yellow-50/30">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Average Rating</p>
                        <p className={`text-xl sm:text-2xl font-bold ${getRatingColor(overallStats.averageRating)}`}>
                          {overallStats.averageRating.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
                        <Star className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-green-50/30">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Top Rated Section</p>
                        <p className="text-sm sm:text-lg font-bold text-green-600 truncate">{overallStats.topRatedSection}</p>
                      </div>
                      <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <Award className="h-6 sm:h-8 w-6 sm:w-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-red-50/30">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Needs Attention</p>
                        <p className="text-sm sm:text-lg font-bold text-red-600 truncate">{overallStats.lowestRatedSection}</p>
                      </div>
                      <div className="bg-red-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <AlertCircle className="h-6 sm:h-8 w-6 sm:w-8 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="rounded-full bg-muted p-4">
                      <BarChart3 className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-muted-foreground">
                        No Survey Responses Found
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        {levelFilter === 'Managerial' 
                          ? 'There are currently no survey responses from managerial level employees. Once managerial employees submit their surveys, the analytics will appear here.'
                          : levelFilter === 'Non Managerial'
                          ? 'There are currently no survey responses from non-managerial level employees. Once non-managerial employees submit their surveys, the analytics will appear here.'
                          : 'There are currently no survey responses available. Once employees start submitting their surveys, the analytics employee panel will display comprehensive insights and statistics here.'}
                      </p>
                    </div>
                    <Button 
                      onClick={() => fetchSurveyData(true)} 
                      variant="outline" 
                      className="mt-4" 
                      disabled={isRefreshing || loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Checking...' : 'Check for New Responses'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Department Filter */}
            <Card className="bg-gradient-to-r from-white to-gray-50/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedDepartment === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDepartment("all")}
                    className="hover:scale-105 transition-all duration-200"
                  >
                    All Departments
                  </Button>
                  {departmentStats.map((dept) => (
                    <Button
                      key={dept.department}
                      variant={selectedDepartment === dept.department ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDepartment(dept.department)}
                      className="hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                    >
                      {dept.department}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts and Analysis */}
            <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-50">
                <TabsTrigger value="overview" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">Overview</TabsTrigger>
                <TabsTrigger value="departments" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">By Department</TabsTrigger>
                <TabsTrigger value="sections" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">By Section</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {overallStats && overallStats.totalResponses > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Department Response Distribution */}
                    <Card className="hover:shadow-xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                          Response Distribution by Department
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Survey participation across different departments
                        </p>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                            <Pie
                              data={departmentStats.map((dept, index) => ({
                                name: dept.department,
                                value: dept.totalResponses,
                                fill: COLORS[index % COLORS.length]
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent, value }) => 
                                percent > 5 ? `${name}\n${(percent * 100).toFixed(1)}%` : ''
                              }
                              outerRadius={100}
                              innerRadius={40}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {departmentStats.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]}
                                  stroke="#ffffff"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [
                                `${value} responses (${((value as number) / departmentStats.reduce((sum, dept) => sum + dept.totalResponses, 0) * 100).toFixed(1)}%)`,
                                'Department'
                              ]}
                              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                              contentStyle={{ 
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              iconType="circle"
                              wrapperStyle={{ paddingTop: '20px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Average Ratings by Department */}
                    <Card className="hover:shadow-xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-white via-green-50/20 to-blue-50/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
                          Average Ratings by Department
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Performance comparison across departments (Scale: 1-5)
                        </p>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart 
                            data={departmentStats}
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                          >
                            <defs>
                              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.6}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              stroke="#e5e7eb" 
                              opacity={0.7}
                            />
                            <XAxis 
                              dataKey="department" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              fontSize={12}
                              stroke="#6b7280"
                              tick={{ fill: '#6b7280' }}
                            />
                            <YAxis 
                              domain={[0, 5]} 
                              fontSize={12}
                              stroke="#6b7280"
                              tick={{ fill: '#6b7280' }}
                              label={{ 
                                value: 'Average Rating', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px' }
                              }}
                            />
                            <Tooltip 
                              formatter={(value, name) => {
                                if (name === 'averageRating') {
                                  const rating = value as number;
                                  const color = rating >= 4.5 ? '#10B981' : rating >= 3.5 ? '#F59E0B' : '#EF4444';
                                  return [
                                    <span style={{ color, fontWeight: 'bold' }}>
                                      {rating.toFixed(2)} / 5.00
                                    </span>, 
                                    'Average Rating'
                                  ];
                                }
                                return [value, name];
                              }}
                              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                              contentStyle={{ 
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Bar 
                              dataKey="averageRating" 
                              fill="url(#ratingGradient)"
                              radius={[4, 4, 0, 0]}
                              stroke="#1E40AF"
                              strokeWidth={1}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                           <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                             <span>Excellent (4.5+)</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                             <span>Good (3.5-4.4)</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                             <span>Needs Improvement (&lt;3.5)</span>
                           </div>
                         </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="border-dashed border-2">
                    <CardContent className="p-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="rounded-full bg-muted p-4">
                          <TrendingUp className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-muted-foreground">
                            No Data Available for Charts
                          </h3>
                          <p className="text-muted-foreground max-w-md">
                            Charts and analytics will be displayed here once survey responses are available.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="departments" className="space-y-4 sm:space-y-6">
                {filteredStats.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {filteredStats.map((dept) => (
                      <Card key={dept.department} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <span className="truncate">{dept.department}</span>
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {dept.totalResponses} responses
                            </Badge>
                            <Badge variant={getRatingBadgeVariant(dept.averageRating)} className="text-xs px-2 py-1">
                              {dept.averageRating.toFixed(2)} avg rating
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {Object.entries(dept.sections).map(([sectionName, sectionData]) => (
                              <div key={sectionName} className="p-3 bg-white/60 rounded-lg border border-gray-100 hover:bg-white/80 transition-colors duration-200">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs sm:text-sm font-medium truncate pr-2">{sectionName}</span>
                                  <span className={`text-sm sm:text-base font-bold ${getRatingColor(sectionData.averageRating)} bg-white/80 px-2 py-1 rounded-md`}>
                                    {sectionData.averageRating.toFixed(2)}
                                  </span>
                                </div>
                                <Progress 
                                  value={(sectionData.averageRating / 5) * 100} 
                                  className="h-2 mb-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {sectionData.responseCount} responses
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2">
                    <CardContent className="p-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="rounded-full bg-muted p-4">
                          <Building2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-muted-foreground">
                            No Department Data Available
                          </h3>
                          <p className="text-muted-foreground max-w-md">
                            Department-wise analysis will be displayed here once survey responses are available.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="sections" className="space-y-4 sm:space-y-6">
                <Card className="bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      Section Performance Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredStats.length > 0 ? (
                      <div className="space-y-6">
                        {filteredStats.map((dept) => (
                          <div key={dept.department}>
                            <h4 className="font-semibold text-base sm:text-lg mb-4 text-gray-800">{dept.department}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                              {Object.entries(dept.sections).map(([sectionName, sectionData]) => (
                                <Card key={sectionName} className="p-3 sm:p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02] bg-white/80 backdrop-blur-sm">
                                  <div className="text-center">
                                    <h5 className="font-medium mb-3 text-xs sm:text-sm text-gray-700 truncate" title={sectionName}>{sectionName}</h5>
                                    <div className={`text-xl sm:text-2xl font-bold mb-3 ${getRatingColor(sectionData.averageRating)}`}>
                                      {sectionData.averageRating.toFixed(2)}
                                    </div>
                                    <Progress 
                                      value={(sectionData.averageRating / 5) * 100} 
                                      className="h-2 mb-3"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      {sectionData.responseCount} responses
                                    </p>
                                  </div>
                                </Card>
                              ))}
                            </div>
                            <Separator className="my-6" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="rounded-full bg-muted p-4">
                            <Award className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-muted-foreground">
                              No Section Data Available
                            </h3>
                            <p className="text-muted-foreground max-w-md">
                              Section performance analysis will be displayed here once survey responses are available.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Recent Submissions */}
            <Card className="bg-gradient-to-br from-white via-green-50/20 to-blue-50/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {surveyData.length > 0 ? (
                  <div className="space-y-3">
                    {surveyData.slice(0, 10).map((response) => (
                      <div key={response.id} className="flex items-center justify-between p-3 sm:p-4 bg-white/60 rounded-lg border border-gray-100 hover:bg-white/80 hover:shadow-md transition-all duration-200">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{response.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {response.department} • ID: {response.id_badge_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(response.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(response.created_at).toLocaleTimeString('en-US', { 
                              hour12: false, 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="rounded-full bg-muted p-3">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-muted-foreground">
                          No Recent Submissions
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Recent survey submissions will appear here.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;