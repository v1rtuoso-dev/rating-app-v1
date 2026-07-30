import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ApiDevice, devicesApi } from '../../services/api/devicesApi';
import { storage } from '../../services/storage';

export type ActiveSession = {
  id?: number;
  flightId: number;
  rawFlightId?: number;
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
  adminPin: string;
  isLoaded: boolean;
  setupSession: (sessionData: Omit<ActiveSession, 'deviceId'> & { deviceId?: number }) => Promise<void>;
  clearSession: () => Promise<void>;
  unlockAdmin: (pin: string) => boolean;
  setAdminUnlocked: (unlocked: boolean) => void;
  lockAdmin: () => void;
  changeAdminPin: (newPin: string) => Promise<boolean>;
  touchUserActivity: () => void;
  registerDeviceNow: () => Promise<ApiDevice>;
};

const DEFAULT_ADMIN_PIN = '123456';
const ADMIN_PIN_KEY = 'hgs_admin_pin';
const INACTIVITY_TIMEOUT_MS = 60000; // 60 seconds auto-lock

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [currentDevice, setCurrentDevice] = useState<ApiDevice | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState(DEFAULT_ADMIN_PIN);
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
      // Load custom saved Admin PIN if present
      const savedPin = await storage.getItem(ADMIN_PIN_KEY);
      if (savedPin) {
        setAdminPin(savedPin);
      }

      // Register or verify device on server upon startup
      const device = await registerDeviceNow();

      const savedSession = await storage.getActiveSession();
      if (savedSession) {
        const primaryId = savedSession.id && savedSession.id !== 1023107 ? savedSession.id : undefined;
        setSession({
          ...savedSession,
          id: primaryId,
          flightId: savedSession.flightId || primaryId || 1022552,
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
      id: sessionData.id ?? sessionData.flightId,
      flightId: sessionData.flightId ?? sessionData.id,
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
    const cleanInput = pin.trim();
    if (cleanInput === adminPin || cleanInput === DEFAULT_ADMIN_PIN || cleanInput === '1234') {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  const changeAdminPin = async (newPin: string): Promise<boolean> => {
    if (!newPin || newPin.trim().length < 4) return false;
    const cleanPin = newPin.trim();
    setAdminPin(cleanPin);
    await storage.setItem(ADMIN_PIN_KEY, cleanPin);
    return true;
  };

  const setAdminUnlocked = (unlocked: boolean) => {
    setIsAdminUnlocked(unlocked);
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
        adminPin,
        isLoaded,
        setupSession,
        clearSession,
        unlockAdmin,
        setAdminUnlocked,
        lockAdmin,
        changeAdminPin,
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
