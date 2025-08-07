import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
  LayoutDashboard
} from "lucide-react";
import mtiLogo from "@/assets/mti-logo.png";

interface SurveyResponse {
  id: string;
  name: string;
  id_badge_number: string;
  department: string;
  created_at: string;
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SurveyResults = () => {
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("results");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication and session timeout
  useEffect(() => {
    const checkSession = () => {
      const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
      const loginTime = sessionStorage.getItem("adminLoginTime");
      
      if (!isAuthenticated) {
        navigate("/admin/login");
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
          navigate("/admin/login");
        }
      }
    };
    
    // Check session immediately
    checkSession();
    
    // Set up interval to check session every minute
    const sessionCheckInterval = setInterval(checkSession, 60000);
    
    return () => clearInterval(sessionCheckInterval);
  }, [navigate, toast]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    sessionStorage.removeItem("adminLoginTime");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/admin/login");
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

  useEffect(() => {
    fetchSurveyData();
  }, []);

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSurveyData(data || []);
      processStatistics(data || []);
    } catch (error: any) {
      console.error("Error fetching survey data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch survey results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    
    let topSection = "";
    let lowestSection = "";
    let highestAvg = 0;
    let lowestAvg = 5;
    
    Object.entries(sectionRatings).forEach(([sectionName, ratings]) => {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (avg > highestAvg) {
        highestAvg = avg;
        topSection = sectionName;
      }
      if (avg < lowestAvg) {
        lowestAvg = avg;
        lowestSection = sectionName;
      }
    });

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

  const exportResults = () => {
    // Create detailed CSV with section-wise ratings
    const headers = [
      "Name",
      "ID Badge", 
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
      "Warehouse & Inventory Feedback",
      "SCM Inventory",
      "SCM Inventory Feedback",
      "SCM Procurement",
      "SCM Procurement Feedback"
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
          getFeedback('scm_warehouse_feedback'),
          getSectionRating('scm_inventory_question1', 'scm_inventory_question2'),
          getFeedback('scm_inventory_feedback'),
          getSectionRating('scm_procurement_question1', 'scm_procurement_question2'),
          getFeedback('scm_procurement_feedback')
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
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading survey results...</p>
        </div>
      </div>
    );
  }

  const filteredStats = selectedDepartment === "all" 
    ? departmentStats 
    : departmentStats.filter(dept => dept.department === selectedDepartment);

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img src={mtiLogo} alt="MTI Logo" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-gray-900">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="flex-1 mt-6 px-3 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveMenuItem("dashboard");
                navigate("/admin/dashboard");
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
              onClick={() => setActiveMenuItem("results")}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeMenuItem === "results"
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <BarChart3 className="mr-3 h-4 w-4" />
              Results
            </button>
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
      <div className="lg:ml-64 h-full overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
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
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                      Survey Results
                    </h1>
                    <p className="text-gray-600">Employee Satisfaction Analysis</p>
                  </div>
                </div>
                <div className="lg:hidden">
                  <h1 className="text-xl font-bold text-gray-900">Results</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">Survey Results Dashboard</h1>
                <p className="text-muted-foreground">Comprehensive analysis of employee satisfaction survey responses</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchSurveyData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={exportResults} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Overall Statistics Cards */}
            {overallStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                        <p className="text-2xl font-bold">{overallStats.totalResponses}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                        <p className={`text-2xl font-bold ${getRatingColor(overallStats.averageRating)}`}>
                          {overallStats.averageRating.toFixed(2)}
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Top Rated Section</p>
                        <p className="text-lg font-bold text-green-600">{overallStats.topRatedSection}</p>
                      </div>
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
                        <p className="text-lg font-bold text-red-600">{overallStats.lowestRatedSection}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Department Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedDepartment === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDepartment("all")}
                  >
                    All Departments
                  </Button>
                  {departmentStats.map((dept) => (
                    <Button
                      key={dept.department}
                      variant={selectedDepartment === dept.department ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDepartment(dept.department)}
                    >
                      {dept.department}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts and Analysis */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="departments">By Department</TabsTrigger>
                <TabsTrigger value="sections">By Section</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Department Response Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Response Distribution by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
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
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {departmentStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Average Ratings by Department */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Average Ratings by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departmentStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="department" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis domain={[0, 5]} />
                          <Tooltip />
                          <Bar dataKey="averageRating" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="departments" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredStats.map((dept) => (
                    <Card key={dept.department}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {dept.department}
                        </CardTitle>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {dept.totalResponses} responses
                          </Badge>
                          <Badge variant={getRatingBadgeVariant(dept.averageRating)}>
                            {dept.averageRating.toFixed(2)} avg rating
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(dept.sections).map(([sectionName, sectionData]) => (
                            <div key={sectionName} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{sectionName}</span>
                                <span className={`text-sm font-bold ${getRatingColor(sectionData.averageRating)}`}>
                                  {sectionData.averageRating.toFixed(2)}
                                </span>
                              </div>
                              <Progress 
                                value={(sectionData.averageRating / 5) * 100} 
                                className="h-2"
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
              </TabsContent>

              <TabsContent value="sections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Section Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredStats.map((dept) => (
                        <div key={dept.department}>
                          <h4 className="font-semibold text-lg mb-3">{dept.department}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {Object.entries(dept.sections).map(([sectionName, sectionData]) => (
                              <Card key={sectionName} className="p-4">
                                <div className="text-center">
                                  <h5 className="font-medium mb-2">{sectionName}</h5>
                                  <div className={`text-2xl font-bold mb-2 ${getRatingColor(sectionData.averageRating)}`}>
                                    {sectionData.averageRating.toFixed(2)}
                                  </div>
                                  <Progress 
                                    value={(sectionData.averageRating / 5) * 100} 
                                    className="h-2 mb-2"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {sectionData.responseCount} responses
                                  </p>
                                </div>
                              </Card>
                            ))}
                          </div>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {surveyData.slice(0, 10).map((response) => (
                    <div key={response.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{response.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {response.department} • ID: {response.id_badge_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(response.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(response.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;