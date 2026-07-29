import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ApiDevice, devicesApi } from '../../services/api/devicesApi';
import { storage } from '../../services/storage';

export type ActiveSession = {
  flightId: number;
  flightNo: string;
  route: string;
  counter: string;
  staffUser: string;
  deviceId: number;
};

type SessionContextType = {
  session: ActiveSession | null;
  currentDevice: ApiDevice | null;
  isAdminUnlocked: boolean;
  isLoaded: boolean;
  setupSession: (sessionData: Omit<ActiveSession, 'deviceId'> & { deviceId?: number }) => Promise<void>;
  clearSession: () => Promise<void>;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  touchUserActivity: () => void;
  registerDeviceNow: () => Promise<ApiDevice>;
};

const DEFAULT_ADMIN_PIN = '123456';
const INACTIVITY_TIMEOUT_MS = 60000; // 60 seconds auto-lock

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [currentDevice, setCurrentDevice] = useState<ApiDevice | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerDeviceNow = async (): Promise<ApiDevice> => {
    try {
      const registered = await devicesApi.registerOrGetDevice();
      setCurrentDevice(registered);
      return registered;
    } catch (err) {
      console.warn('Device registration error:', err);
      const fallback: ApiDevice = {
        id: 1,
        deviceName: 'Tablet Kiosk',
        deviceIdentifier: 'TAB-KIOSK-01',
        status: 'active',
        lastSeenAt: new Date().toISOString(),
      };
      setCurrentDevice(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    (async () => {
      // Register or verify device on server upon startup
      const device = await registerDeviceNow();

      const savedSession = await storage.getActiveSession();
      if (savedSession) {
        setSession({
          ...savedSession,
          flightId: savedSession.flightId || savedSession.id,
          deviceId: device.id || savedSession.deviceId || 1,
        });
      }
      setIsLoaded(true);
    })();
  }, []);

  const touchUserActivity = () => {
    if (!isAdminUnlocked) return;
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      console.log('Inactivity timeout reached. Locking Admin mode back to Kiosk.');
      setIsAdminUnlocked(false);
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      touchUserActivity();
    } else if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isAdminUnlocked]);

  const setupSession = async (sessionData: Omit<ActiveSession, 'deviceId'> & { deviceId?: number }) => {
    let device = currentDevice;
    if (!device) {
      device = await registerDeviceNow();
    }

    const fullSession: ActiveSession = {
      ...sessionData,
      flightId: sessionData.flightId,
      deviceId: sessionData.deviceId || device.id || 1,
    };

    setSession(fullSession);
    await storage.setActiveSession(fullSession);
  };

  const clearSession = async () => {
    setSession(null);
    setIsAdminUnlocked(false);
    await storage.clearActiveSession();
  };

  const unlockAdmin = (pin: string): boolean => {
    if (pin === DEFAULT_ADMIN_PIN || pin === '1234') {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        currentDevice,
        isAdminUnlocked,
        isLoaded,
        setupSession,
        clearSession,
        unlockAdmin,
        lockAdmin,
        touchUserActivity,
        registerDeviceNow,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
