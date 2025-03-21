import React, { useState } from "react";
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
import { Search, Plus, UserPlus, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChartData } from "@/hooks/useChartData";
import TeamPerformanceComparison from "@/components/Team/TeamPerformanceComparison";
import TeamMemberCard from "@/components/Team/TeamMemberCard";
import AddTeamMemberModal from "@/components/Team/AddTeamMemberModal";

const initialTeamMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    role: "Senior Sales Rep",
    performance: 87,
    calls: 145,
    conversion: 23,
    avatar: "AJ"
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    role: "Sales Rep",
    performance: 76,
    calls: 112,
    conversion: 18,
    avatar: "MG"
  },
  {
    id: 3,
    name: "David Kim",
    email: "david.kim@example.com",
    role: "Junior Sales Rep",
    performance: 68,
    calls: 89,
    conversion: 12,
    avatar: "DK"
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    role: "Senior Sales Rep",
    performance: 92,
    calls: 156,
    conversion: 28,
    avatar: "SW"
  },
  {
    id: 5,
    name: "James Taylor",
    email: "james.taylor@example.com",
    role: "Sales Rep",
    performance: 71,
    calls: 103,
    conversion: 15,
    avatar: "JT"
  },
];

const Team = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  
  const {
    data: teamMembers,
    setData: setTeamMembers
  } = useChartData(initialTeamMembers);

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = (newMember) => {
    const updatedMembers = [...teamMembers, {
      ...newMember,
      id: teamMembers.length + 1,
      performance: Math.floor(Math.random() * 30) + 60, // Random performance between 60-90
      calls: Math.floor(Math.random() * 100) + 50, // Random calls between 50-150
      conversion: Math.floor(Math.random() * 20) + 10, // Random conversion between 10-30
      avatar: newMember.name.split(' ').map(n => n[0]).join('')
    }];
    setTeamMembers(updatedMembers);
  };

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
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
                    .sort((a, b) => b.performance - a.performance)
                    .map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-neon-purple h-2.5 rounded-full" 
                                style={{width: `${member.performance}%`}}
                              ></div>
                            </div>
                            <span>{member.performance}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{member.calls}</TableCell>
                        <TableCell>{member.conversion}%</TableCell>
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

export default Team;
