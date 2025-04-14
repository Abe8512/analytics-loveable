import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types/profile';
import { ManagedUser } from '@/types/managedUser';
import { EventsService } from '@/services/EventsService';
import { EventType } from '@/services/events/types';
import { errorHandler } from '@/services/ErrorHandlingService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  managedUsers: ManagedUser[] | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password?: string) => Promise<void>;
  updateProfile: (updates: Profile) => Promise<void>;
  getManagedUsers: () => Promise<void>;
  createManagedUser: (email: string, password?: string) => Promise<void>;
  deleteManagedUser: (userId: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
    const [managedUsers, setManagedUsers] = useState<ManagedUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await getProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await getProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    });
  }, []);

  const getProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error in getProfile:', error);
    }
  };

  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the magic link to sign in.');
    } catch (error: any) {
      errorHandler.handleError(error, 'AuthContext.signIn');
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setProfile(null);
            setManagedUsers(null);
      router.push('/login');
    } catch (error: any) {
      errorHandler.handleError(error, 'AuthContext.signOut');
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      alert('Check your email to verify your account.');
    } catch (error: any) {
      errorHandler.handleError(error, 'AuthContext.signUp');
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Profile) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      });
      if (error) throw error;
      setProfile({ ...profile, ...updates } as Profile);
    } catch (error: any) {
      errorHandler.handleError(error, 'AuthContext.updateProfile');
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

    const getManagedUsers = async () => {
        setIsLoading(true);
        try {
            if (!user?.id) {
                console.warn('User ID is missing, cannot fetch managed users.');
                return;
            }

            const { data, error } = await supabase
                .from('managed_users')
                .select('*')
                .eq('owner_id', user.id);

            if (error) {
                console.error('Error fetching managed users:', error);
                return;
            }

            setManagedUsers(data);
        } catch (error) {
            console.error('Error fetching managed users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createManagedUser = async (email: string, password?: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        owner_id: user?.id,
                    },
                },
            });

            if (error) {
                console.error('Error creating managed user:', error);
                return;
            }

            // After successfully creating the user, insert the managed user record
            const newUserId = data.user?.id;
            if (newUserId) {
                const { error: managedUserError } = await supabase
                    .from('managed_users')
                    .insert([{
                        id: newUserId,
                        owner_id: user?.id,
                        email: email,
                    }]);

                if (managedUserError) {
                    console.error('Error inserting managed user record:', managedUserError);
                    return;
                }
            }

            // Refresh the managed users list
            await getManagedUsers();
            EventsService.dispatchEvent('MANAGED_USERS_UPDATED' as EventType);
            EventsService.dispatchEvent('managed-users-updated' as EventType);
        } catch (error) {
            console.error('Error creating managed user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteManagedUser = async (userId: string) => {
        setIsLoading(true);
        try {
            // First, delete the user from the auth.users table
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);

            if (authError) {
                console.error('Error deleting user from auth.users:', authError);
                return;
            }

            // Then, delete the managed user record from the managed_users table
            const { error: managedUserError } = await supabase
                .from('managed_users')
                .delete()
                .eq('id', userId);

            if (managedUserError) {
                console.error('Error deleting managed user record:', managedUserError);
                return;
            }

            // Refresh the managed users list
            await getManagedUsers();
            EventsService.dispatchEvent('MANAGED_USERS_UPDATED' as EventType);
            EventsService.dispatchEvent('managed-users-updated' as EventType);
        } catch (error) {
            console.error('Error deleting managed user:', error);
        } finally {
            setIsLoading(false);
        }
    };

  const resetPasswordForEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      alert('Check your email for the password reset link.');
    } catch (error: any) {
      errorHandler.handleError(error, 'AuthContext.resetPasswordForEmail');
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleConnectionRestored = () => {
      console.log('Connection restored event received in AuthContext');
    };

    const handleConnectionLost = () => {
      console.log('Connection lost event received in AuthContext');
    };

    const unsubscribe1 = EventsService.addEventListener('CONNECTION_RESTORED' as EventType, handleConnectionRestored);
    const unsubscribe2 = EventsService.addEventListener('CONNECTION_LOST' as EventType, handleConnectionLost);

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    profile,
        managedUsers,
    isLoading,
    signIn,
    signOut,
    signUp,
    updateProfile,
        getManagedUsers,
        createManagedUser,
        deleteManagedUser,
    resetPasswordForEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
