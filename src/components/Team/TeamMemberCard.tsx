
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MailIcon, Briefcase, Trash } from 'lucide-react';
import { dispatchEvent } from '@/services/events';

interface TeamMemberProps {
  member: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
  onDelete: () => void;
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ member, onDelete }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleDelete = () => {
    // First notify any listening components that this member is being removed
    dispatchEvent('TEAM_MEMBER_REMOVED', { id: member.id });
    
    // Then call the parent component's delete handler
    onDelete();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-base">{member.name}</h3>
          {member.role && <p className="text-sm text-muted-foreground flex items-center mt-0.5">
            <Briefcase className="h-3.5 w-3.5 mr-1" />
            {member.role}
          </p>}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {member.email && (
          <a 
            href={`mailto:${member.email}`} 
            className="text-sm text-muted-foreground hover:text-primary flex items-center"
          >
            <MailIcon className="h-3.5 w-3.5 mr-1.5" />
            {member.email}
          </a>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive flex gap-1.5"
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4" />
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeamMemberCard;
