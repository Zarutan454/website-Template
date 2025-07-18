import * as React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useParams } from 'react-router-dom';
import { useGroupEvents, useGroup } from '@/hooks/useGroups';
import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';
import { useEffect, useState, useMemo } from 'react';
import axios, { AxiosError } from 'axios';

// Entferne MemberType und SafeGroupMember komplett, nutze nur UserProfileWithRole
// UserProfileWithRole aus GroupDetailPage
interface UserProfileWithRole {
  id: string;
  username: string;
  avatar_url?: string;
  display_name?: string;
  is_online?: boolean;
  role?: string;
}

interface GroupRightSidebarProps {
  members?: UserProfileWithRole[];
}

const GroupRightSidebar: React.FC<GroupRightSidebarProps> = ({ members: propMembers }) => {
  // Alle React Hooks müssen immer am Anfang stehen!
  const { id } = useParams<{ id: string }>();
  const { data: events = [], isLoading: isLoadingEvents, error: eventsError } = useGroupEvents(id!);
  const { members: queryMembers, isLoading: isLoadingMembers, error: membersError } = useGroup(id!);
  const { user: currentUser } = useAuth();
  const { getAccessToken } = useAuth();
  
  // Presence Hook für Online-Status
  const { isConnected: presenceConnected, lastError: presenceError } = usePresence();
  
  const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});

  // Die Mitgliederliste kommt jetzt immer vollständig als Prop
  const members = useMemo(() => Array.isArray(propMembers) ? propMembers : [], [propMembers]);

  // Debug-Logging: IDs von currentUser und allen Mitgliedern (jetzt im useEffect)
  React.useEffect(() => {
    console.log('[GroupRightSidebar] currentUser.id:', currentUser?.id);
    console.log('[GroupRightSidebar] isLoadingMembers:', isLoadingMembers);
    console.log('[GroupRightSidebar] membersError:', membersError);
    console.log('[GroupRightSidebar] members (raw):', members);
    console.log('[GroupRightSidebar] Presence connected:', presenceConnected);
    console.log('[GroupRightSidebar] Presence error:', presenceError);
    if (Array.isArray(members)) {
      (members as UserProfileWithRole[]).forEach((m, i) => {
        console.log(`[GroupRightSidebar] member[${i}].user.id:`, m.id, 'is_online:', m.is_online);
      });
    } else {
      console.log('[GroupRightSidebar] members ist kein Array:', members);
    }
  }, [members, currentUser, isLoadingMembers, membersError, presenceConnected, presenceError]);

  // Warnung, falls Laden länger als 5 Sekunden dauert
  const [loadingTooLong, setLoadingTooLong] = React.useState(false);
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoadingMembers) {
      timeout = setTimeout(() => setLoadingTooLong(true), 5000);
    } else {
      setLoadingTooLong(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoadingMembers]);

  // Online-Status regelmäßig abfragen
  useEffect(() => {
    if (!id || !Array.isArray(members) || members.length === 0) return;
    const fetchOnline = async () => {
      const token = getAccessToken ? await getAccessToken() : null;
      if (!token || typeof token !== 'string' || token.length < 10) {
        console.warn('[Presence] Kein gültiger JWT-Token für Online-Status vorhanden:', token);
        return;
      }
      try {
        console.log('[Presence] JWT-Token für Online-Status:', token);
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`/api/groups/${id}/online/`, { headers });
        console.log('[Presence] Online-Status API Response:', res.data);
        setOnlineMap(res.data.online || {});
      } catch (e: unknown) {
        if (e && typeof e === 'object' && (e as AxiosError).isAxiosError && (e as AxiosError).response) {
          const err = e as AxiosError;
          console.error('[Presence] Online-Status-Request fehlgeschlagen:', err.response?.status, err.response?.data);
        } else {
          console.error('[Presence] Online-Status-Request Fehler:', e);
        }
      }
    };
    fetchOnline();
    const interval = setInterval(fetchOnline, 10000);
    return () => clearInterval(interval);
  }, [id, members, getAccessToken]);

  // Online-Mitglieder filtern
  let safeOnlineMembers: UserProfileWithRole[] = [];
  if (Array.isArray(members)) {
    safeOnlineMembers = members.filter(m => onlineMap[m.id]);
  }
  
  // Debug: Online-Map und gefilterte Mitglieder
  console.log('[GroupRightSidebar] onlineMap:', onlineMap);
  console.log('[GroupRightSidebar] safeOnlineMembers (vor currentUser):', safeOnlineMembers);
  
  // Füge aktuellen User hinzu, falls er connected ist (auch wenn nicht Mitglied)
  if (currentUser && presenceConnected) {
    const alreadyOnline = safeOnlineMembers.some(m => String(m.id) === String(currentUser.id));
    const isMember = members.some(m => String(m.id) === String(currentUser.id));
    console.log('[GroupRightSidebar] currentUser.id:', currentUser.id, 'alreadyOnline:', alreadyOnline, 'isMember:', isMember, 'presenceConnected:', presenceConnected);
    
    if (!alreadyOnline) {
      // Erstelle ein User-Objekt für den aktuellen User
      const currentUserObj: UserProfileWithRole = {
        id: String(currentUser.id),
        username: currentUser.username || `User-${currentUser.id}`,
        display_name: currentUser.display_name || currentUser.username || `User-${currentUser.id}`,
        avatar_url: currentUser.avatar_url,
        is_online: true,
        role: isMember ? 'member' : 'visitor'
      };
      
      // Füge aktuellen User zur Online-Liste hinzu
      safeOnlineMembers = [currentUserObj, ...safeOnlineMembers];
      console.log('[GroupRightSidebar] Added current user to online list:', currentUserObj);
    }
  }
  
  console.log('[GroupRightSidebar] Final safeOnlineMembers:', safeOnlineMembers);

  // Debug: groupId prüfen
  console.log('[GroupRightSidebar] groupId:', id);
  if (!id) {
    return (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        Fehler: groupId ist nicht gesetzt! Sidebar kann keine Mitglieder laden.
      </div>
    );
  }

  return (
    <aside className="w-72 fixed top-0 right-0 bottom-0 z-20 bg-dark-200/95 border-l border-white/5 overflow-auto hide-scrollbar px-4 py-8 hidden lg:block"
      aria-label="Gruppen-Sidebar" role="complementary">
      <div className="mb-8 sticky top-8">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2" id="sidebar-events-label">
          <Calendar className="h-5 w-5" /> Events
        </h4>
        {isLoadingEvents ? (
          <div className="text-gray-400">Lade Events...</div>
        ) : eventsError ? (
          <div className="text-red-400">Fehler beim Laden der Events</div>
        ) : (
          <ul className="space-y-2" aria-labelledby="sidebar-events-label">
            {!Array.isArray(events) || events.length === 0 ? (
              <li className="text-gray-400">Keine Events</li>
            ) : events.map((event, i) => {
                if (!event || !event.id) {
                  console.error('Event mit fehlender id:', event);
                  return (
                    <li key={`event-error-${i}`} className="text-red-400">Fehlerhaftes Event</li>
                  );
                }
                return (
                  <motion.li
                    key={event.id}
                    className="bg-dark-300 rounded p-2 text-white shadow transition-transform hover:scale-[1.03] hover:shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    aria-label={`Event: ${event.title || 'Unbenanntes Event'}`}
                  >
                    <div className="font-medium">{event.title || 'Unbenanntes Event'}</div>
                    <div className="text-xs text-gray-400">{event.start_time || 'Unbekanntes Datum'}</div>
                  </motion.li>
                );
              })}
          </ul>
        )}
      </div>
      <div className="sticky top-44">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2" id="sidebar-online-label">
          <Users className="h-5 w-5" /> Online-Mitglieder
        </h4>
        {isLoadingMembers ? (
          <div className="text-gray-400">
            Lade Mitglieder...
            {loadingTooLong && (
              <div className="text-yellow-400 mt-2">Warnung: Das Laden dauert ungewöhnlich lange!</div>
            )}
          </div>
        ) : membersError ? (
          <div className="text-red-400">Fehler beim Laden der Mitglieder: {String(membersError)}</div>
        ) : (
          <ul className="flex flex-col gap-2" aria-labelledby="sidebar-online-label">
            {safeOnlineMembers.length === 0 ? (
              <li className="text-gray-400">Niemand online</li>
            ) : safeOnlineMembers.map((member, i) => {
                if (!member) {
                  console.error('Online-Member ohne user-Objekt:', member);
                  return (
                    <li key={`member-error-${i}`} className="text-red-400">Fehlerhaftes Mitglied</li>
                  );
                }
                const displayName = typeof member.display_name === 'string' ? member.display_name : undefined;
                const name = displayName || member.username || `User-${member.id}`;
                const avatarLetter = (displayName?.charAt(0) || member.username?.charAt(0) || '?');
                return (
                  <motion.li
                    key={member.id}
                    className="flex items-center gap-3 bg-dark-300 rounded p-2 shadow transition-transform hover:scale-[1.03] hover:shadow-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    aria-label={`Online-Mitglied: ${name}`}
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-green-400 animate-pulse">
                      <AvatarImage src={member.avatar_url || undefined} alt={name} />
                      <AvatarFallback>{avatarLetter}</AvatarFallback>
                    </Avatar>
                    <span className="text-white">{name}</span>
                    <span className="ml-auto h-2 w-2 rounded-full bg-green-500" title="Online"></span>
                  </motion.li>
                );
              })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default GroupRightSidebar; 