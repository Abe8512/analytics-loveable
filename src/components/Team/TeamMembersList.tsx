
import React from 'react';
import { TeamMember } from '@/types/teamTypes';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  selectedMemberId: string | null;
  onMemberSelect: (id: string) => void;
  onDeleteMember: (id: string) => void;
}

export const TeamMembersList: React.FC<TeamMembersListProps> = ({
  teamMembers,
  isLoading,
  selectedMemberId,
  onMemberSelect,
  onDeleteMember
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No team members found</p>
        <p className="text-sm mt-1">Add a team member to get started</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-2">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
              selectedMemberId === member.id ? 'bg-accent' : 'hover:bg-muted'
            }`}
            onClick={() => onMemberSelect(member.id)}
          >
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={member.avatar || member.avatar_url || ''} alt={member.name} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role || 'Team Member'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMember(member.id);
              }}
              className="opacity-50 hover:opacity-100"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
