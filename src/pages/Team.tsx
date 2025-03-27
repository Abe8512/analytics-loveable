
import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChartData } from "@/hooks/useChartData";
import TeamPerformanceComparison from "@/components/Team/TeamPerformanceComparison";
import TeamMemberCard from "@/components/Team/TeamMemberCard";
import AddTeamMemberModal from "@/components/Team/AddTeamMemberModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  performance?: number;
  calls?: number;
  conversion?: number;
  avatar?: string;
}

const Team = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    data: teamMembers,
    setData: setTeamMembers
  } = useChartData<TeamMember[]>([]);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      // Try to load from database first
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Format members from database
        const formattedMembers = data.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role || 'Sales Rep',
          performance: Math.floor(Math.random() * 30) + 60, // Random for demo
          calls: Math.floor(Math.random() * 100) + 50, // Random for demo
          conversion: Math.floor(Math.random() * 20) + 10, // Random for demo
          avatar: member.avatar || member.name.split(' ').map(n => n[0]).join('')
        }));
        
        setTeamMembers(formattedMembers);
      } else {
        // If no data in DB, use initial demo data
        setTeamMembers(getDemoTeamMembers());
      }
    } catch (error) {
      console.error("Error loading team members:", error);
      toast.error("Failed to load team members", { 
        description: error instanceof Error ? error.message : "Unknown error" 
      });
      
      // Fall back to demo data
      setTeamMembers(getDemoTeamMembers());
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (newMember: Partial<TeamMember>) => {
    try {
      const memberId = uuidv4();
      const userId = uuidv4();
      
      // Save to database
      const { error } = await supabase
        .from('team_members')
        .insert({
          id: memberId,
          member_id: memberId,
          user_id: userId,
          name: newMember.name || '',
          email: newMember.email || '',
          role: newMember.role || 'Sales Rep',
          avatar: newMember.name?.split(' ').map(n => n[0]).join('') || ''
        });
        
      if (error) throw error;
      
      // Add to local state
      const formattedNewMember: TeamMember = {
        id: memberId,
        name: newMember.name || '',
        email: newMember.email || '',
        role: newMember.role || 'Sales Rep',
        performance: Math.floor(Math.random() * 30) + 60, // Random performance between 60-90
        calls: Math.floor(Math.random() * 100) + 50, // Random calls between 50-150
        conversion: Math.floor(Math.random() * 20) + 10, // Random conversion between 10-30
        avatar: newMember.name?.split(' ').map(n => n[0]).join('') || ''
      };
      
      setTeamMembers([...teamMembers, formattedNewMember]);
      toast.success("Team member added successfully");
    } catch (error) {
      console.error("Error adding team member:", error);
      toast.error("Failed to add team member", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Team Management
        </h1>
        <p className="text-muted-foreground">
          Manage your sales team and monitor performance
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-10 h-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              className="bg-neon-purple hover:bg-neon-purple/80 text-white" 
              onClick={() => setShowAddMemberModal(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Team Performance Comparison</CardTitle>
              <CardDescription>Compare performance metrics across team members</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamPerformanceComparison teamMembers={teamMembers} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Sales Leaderboard</CardTitle>
              <CardDescription>Ranked by overall performance score</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Performance
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...teamMembers]
                    .sort((a, b) => (b.performance || 0) - (a.performance || 0))
                    .map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-neon-purple h-2.5 rounded-full" 
                                style={{width: `${member.performance || 0}%`}}
                              ></div>
                            </div>
                            <span>{member.performance || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{member.calls || 0}</TableCell>
                        <TableCell>{member.conversion || 0}%</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AddTeamMemberModal 
        isOpen={showAddMemberModal} 
        onClose={() => setShowAddMemberModal(false)}
        onAddMember={handleAddMember}
      />
    </DashboardLayout>
  );
};

// Helper function to create demo data if no team members exist
function getDemoTeamMembers(): TeamMember[] {
  return [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      role: "Senior Sales Rep",
      performance: 87,
      calls: 145,
      conversion: 23,
      avatar: "AJ"
    },
    {
      id: "2",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      role: "Sales Rep",
      performance: 76,
      calls: 112,
      conversion: 18,
      avatar: "MG"
    },
    {
      id: "3",
      name: "David Kim",
      email: "david.kim@example.com",
      role: "Junior Sales Rep",
      performance: 68,
      calls: 89,
      conversion: 12,
      avatar: "DK"
    },
    {
      id: "4",
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      role: "Senior Sales Rep",
      performance: 92,
      calls: 156,
      conversion: 28,
      avatar: "SW"
    },
    {
      id: "5",
      name: "James Taylor",
      email: "james.taylor@example.com",
      role: "Sales Rep",
      performance: 71,
      calls: 103,
      conversion: 15,
      avatar: "JT"
    }
  ];
}

export default Team;
