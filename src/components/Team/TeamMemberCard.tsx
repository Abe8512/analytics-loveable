
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  avatar_url?: string; // Add this for compatibility with different prop formats
}

export interface TeamMemberCardProps {
  member: TeamMember;
  onDelete: () => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onDelete }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Use avatar or avatar_url, whichever is available
  const avatarSrc = member.avatar || member.avatar_url;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{member.name}</CardTitle>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center space-x-3">
          <Avatar>
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={member.name} />
            ) : null}
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            {member.email && (
              <p className="text-sm text-muted-foreground">{member.email}</p>
            )}
            {member.role && (
              <p className="text-xs text-muted-foreground/70">{member.role}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
