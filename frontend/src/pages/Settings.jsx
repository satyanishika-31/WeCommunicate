import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Bell, Shield } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { toggleTheme, role } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  return (
    <PageContainer>
      <Header />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#542612]/10 text-[#542612] dark:text-[#F7F0DF] flex items-center justify-center border border-[#542612]/20">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#542612] dark:text-white tracking-tight">
              Application Settings
            </h1>
            <p className="text-xs text-[#542612]/70 dark:text-[#542612]/60">
              Customize theme preference, notifications, and account details
            </p>
          </div>
        </div>

        {/* Theme Settings Card */}
        <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#542612] dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#542612]" />
            Appearance & Theme
          </h3>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F0DF] dark:bg-[#542612]/60 border border-[#542612]/15 dark:border-[#F7F0DF]/20">
            <div>
              <span className="font-bold text-sm text-[#542612] dark:text-white block">
                Light Mode
              </span>
              <span className="text-xs text-[#542612]/70 dark:text-[#542612]/60">
                The application uses the clean white and cream theme
              </span>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Light mode is enabled"
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#542612] transition-colors"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#F5EFE1] transition-transform ${
                  'translate-x-6'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#542612] dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#542612]" />
            Notification Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F0DF] dark:bg-[#542612]/60 border border-[#542612]/15 dark:border-[#F7F0DF]/20">
              <div>
                <span className="font-bold text-sm text-[#542612] dark:text-white block">
                  Urgent Notice & Maintenance Alerts
                </span>
                <span className="text-xs text-[#542612]/70">
                  Receive instant popups for water supply and power maintenance
                </span>
              </div>
              <input
                type="checkbox"
                checked={pushNotifs}
                onChange={(e) => setPushNotifs(e.target.checked)}
                className="w-4 h-4 accent-[#542612] rounded"
              />
            </div>
          </div>
        </div>

        {/* Society Info */}
        <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-2">
          <h3 className="font-extrabold text-base text-[#542612] dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#542612]" />
            Society Information
          </h3>
          <div className="text-xs text-[#542612] dark:text-[#542612]/60 space-y-1">
            <p><strong className="text-[#542612] dark:text-white">Society Name:</strong> We Communicate Residential Enclave</p>
            <p><strong className="text-[#542612] dark:text-white">Total Blocks:</strong> 4 Towers (Block A, B, C, D)</p>
            <p><strong className="text-[#542612] dark:text-white">Total Flats:</strong> 140 Apartments</p>
            <p><strong className="text-[#542612] dark:text-white">Your Role:</strong> {role}</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;
