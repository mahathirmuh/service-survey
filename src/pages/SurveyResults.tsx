import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  Star
} from "lucide-react";

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
  const { toast } = useToast();

  const departmentMapping = {
    "Human Resources": "hr",
    "Environmental": "environmental", 
    "External Affair": "external",
    "Supply Chain Management": "scm"
  };

  const sectionMapping = {
    hr: {
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
    environmental: {
      "monitoring": "Monitoring",
      "management": "Management",
      "audit": "Audit & Compulsory",
      "study": "Study & Project"
    },
    external: {
      "assetprotection": "Asset Protection",
      "communityrelations": "Community Relations",
      "govrel": "Government Relations"
    },
    scm: {
      "logistic": "Logistic",
      "warehouse": "Warehouse"
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

  const processStatistics = (data: SurveyResponse[]) => {
    const deptStats: { [key: string]: DepartmentStats } = {};
    let totalRatings = 0;
    let totalRatingCount = 0;
    const sectionRatings: { [key: string]: number[] } = {};

    // Process each response
    data.forEach((response) => {
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

      // Process ratings for each department's sections
      const deptKey = departmentMapping[dept as keyof typeof departmentMapping];
      if (deptKey && sectionMapping[deptKey as keyof typeof sectionMapping]) {
        const sections = sectionMapping[deptKey as keyof typeof sectionMapping];
        
        Object.entries(sections).forEach(([sectionKey, sectionName]) => {
          const question1Key = `${deptKey}_${sectionKey}_question1`;
          const question2Key = `${deptKey}_${sectionKey}_question2`;
          
          const rating1 = response[question1Key];
          const rating2 = response[question2Key];
          
          if (rating1 && rating2) {
            const avgRating = (rating1 + rating2) / 2;
            
            if (!deptStats[dept].sections[sectionName]) {
              deptStats[dept].sections[sectionName] = {
                averageRating: 0,
                responseCount: 0,
                ratings: []
              };
            }
            
            deptStats[dept].sections[sectionName].ratings.push(avgRating);
            deptStats[dept].sections[sectionName].responseCount++;
            
            // For overall stats
            totalRatings += avgRating;
            totalRatingCount++;
            
            if (!sectionRatings[sectionName]) {
              sectionRatings[sectionName] = [];
            }
            sectionRatings[sectionName].push(avgRating);
          }
        });
      }
    });

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

  const exportResults = () => {
    const csvContent = [
      ["Name", "ID Badge", "Department", "Submission Date", "Average Rating"].join(","),
      ...surveyData.map(response => [
        response.name,
        response.id_badge_number,
        response.department,
        new Date(response.created_at).toLocaleDateString(),
        "N/A" // You can calculate this based on the response data
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey-results-${new Date().toISOString().split('T')[0]}.csv`;
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
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
  );
};

export default SurveyResults;