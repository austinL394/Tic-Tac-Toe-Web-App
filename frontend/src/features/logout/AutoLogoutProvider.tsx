import Modal from '@/components/Modal';
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

interface AutoLogoutContextType {
  isWarningActive: boolean;
  logoutTimeLeft: number;
  warningTimeLeft: number;
}

const defaultContextValue: AutoLogoutContextType = {
  isWarningActive: false,
  logoutTimeLeft: 0,
  warningTimeLeft: 0,
};

const AutoLogoutContext = createContext<AutoLogoutContextType>(defaultContextValue); // Provide default value

interface AutoLogoutProviderProps {
  children: React.ReactNode;
  logout: () => void;
  isLoginPage: boolean;
  warningTime?: number;
  logoutTime?: number;
}

export const AutoLogoutProvider = ({
  children,
  logout,
  isLoginPage,
  warningTime = 900000,
  logoutTime = 300000,
}: AutoLogoutProviderProps) => {
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [logoutTimeLeft, setLogoutTimeLeft] = useState(logoutTime);
  const [warningTimeLeft, setWarningTimeLeft] = useState(warningTime);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const logoutTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearWarningTimer = () => {
    if (warningTimeoutId.current) {
      clearTimeout(warningTimeoutId.current);
    }
  };

  const clearLogoutTimer = () => {
    if (logoutTimeoutId.current) {
      clearTimeout(logoutTimeoutId.current);
    }
  };

  const startLogoutTimer = useCallback(() => {
    // Start logout time
    // Set countdown timer
    let timeRemaining = logoutTime;
    const countdownInterval = setInterval(() => {
      timeRemaining -= 1000;
      setLogoutTimeLeft(timeRemaining);
      if (timeRemaining <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Log out user
    logoutTimeoutId.current = setTimeout(() => {
      logout();
    }, logoutTime);
  }, [logoutTime, logout]);

  const startWarningTimer = useCallback(() => {
    // start a countdown til warning
    clearWarningTimer();
    clearLogoutTimer();

    warningTimeoutId.current = setTimeout(() => {
      setIsWarningActive(true);
      startLogoutTimer();
    }, warningTime);
  }, [startLogoutTimer, warningTime]);

  const resetTimer = useCallback(() => {
    if (!isWarningActive) {
      setWarningTimeLeft(warningTime);
      startWarningTimer();
    }
  }, [isWarningActive, startWarningTimer, warningTime]);

  const handleWindowBlur = () => {
    setLastActivityTime(Date.now());
  };

  useEffect(() => {
    const handleWindowFocus = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - lastActivityTime;

      if (elapsedTime >= logoutTime + warningTime) {
        logout();
      } else if (elapsedTime >= warningTime && elapsedTime < logoutTime + warningTime) {
        setIsWarningActive(true);
      }
    };

    if (!isLoginPage) {
      startWarningTimer();

      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('focus', handleWindowFocus);
      window.addEventListener('blur', handleWindowBlur);
    }

    return () => {
      clearWarningTimer();
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isLoginPage, lastActivityTime, logout, logoutTime, resetTimer, startWarningTimer, warningTime]);

  return (
    <AutoLogoutContext.Provider value={{ isWarningActive, logoutTimeLeft, warningTimeLeft }}>
      {children}
      {isWarningActive && (
        <Modal showModal={true} setShowModal={setIsWarningActive}>
          <div className="w-full h-full warning-modal flex items-center justify-center">
            <div className="w-[500px] flex flex-col px-[30px] min-h-[300px] text-black bg-white justify-center items-center">
              <p className="text-center">
                You will be logged out in {Math.floor(logoutTimeLeft / 60000)} minute
                {Math.floor(logoutTimeLeft / 60000) !== 1 ? 's' : ''} and {Math.floor((logoutTimeLeft % 60000) / 1000)}{' '}
                second
                {Math.floor((logoutTimeLeft % 60000) / 1000) !== 1 ? 's' : ''} due to inactivity.
              </p>
            </div>
          </div>
          <div className="flex w-full justify-end gap-4 pb-4 px-7">
            <button
              className="btn w-[168px] bg-white flex items-center text-black py-3.5 justify-center"
              onClick={() => {
                setIsWarningActive(false);
                clearWarningTimer();
                clearLogoutTimer();
              }}
            >
              Cancel
            </button>
            <button
              className="btn w-[168px] bg-[#18181B] flex items-center text-white py-3.5 justify-center"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </Modal>
      )}
    </AutoLogoutContext.Provider>
  );
};
