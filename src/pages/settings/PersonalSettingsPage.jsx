import { useState } from "react";
import {
  Save,
  User,
  Mail,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Globe,
  Camera,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";

const PersonalSettingsPage = () => {
  // Profile form state
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@artivox.com",
    phone: "+84 123 456 789",
    role: "Super Admin",
    bio: "Platform administrator since 2025. Managing content, users, and operations.",
    language: "English (US)",
    timezone: "Asia/Saigon (UTC+7)",
  });

  // Password visibility toggle
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [saved, setSaved] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    orderUpdates: true,
    campaignAlerts: false,
    weeklyDigest: true,
  });

  // Handle profile field changes
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle notification checkbox
  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Simulate save
  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-slate-950 flex items-center justify-center text-white text-3xl font-bold">
              A
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
              <Camera className="h-3.5 w-3.5 text-slate-600" />
            </div>
          </div>
          <div>
            <h1 className="font-title text-2xl font-bold text-slate-950">
              Personal settings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your profile, security, and notification preferences
            </p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {profile.role}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Profile Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="font-title text-lg font-semibold text-slate-900">
                Profile Information
              </h2>
              <p className="text-xs text-slate-500">
                Update your personal details
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <Input
                value={profile.name}
                onChange={(e) => handleProfileChange("name", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <Input
                value={profile.phone}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Bio
              </label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => handleProfileChange("bio", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:border-slate-950 transition resize-none"
              />
            </div>

            {/* Language & Timezone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Language
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={profile.language}
                    onChange={(e) =>
                      handleProfileChange("language", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:border-slate-950 transition appearance-none"
                  >
                    <option>English (US)</option>
                    <option>Vietnamese</option>
                    <option>Japanese</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Timezone
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={profile.timezone}
                    onChange={(e) =>
                      handleProfileChange("timezone", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:border-slate-950 transition appearance-none"
                  >
                    <option>Asia/Saigon (UTC+7)</option>
                    <option>Asia/Tokyo (UTC+9)</option>
                    <option>America/New_York (UTC-5)</option>
                    <option>Europe/London (UTC+0)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          {/* Password */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold text-slate-900">
                  Security
                </h2>
                <p className="text-xs text-slate-500">Update your password</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="Enter current password"
                    className="pr-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showCurrentPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pr-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showNewPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pr-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold text-slate-900">
                  Notifications
                </h2>
                <p className="text-xs text-slate-500">
                  Control what notifications you receive
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: "email",
                  label: "Email notifications",
                  desc: "Receive notifications via email",
                },
                {
                  key: "push",
                  label: "Push notifications",
                  desc: "Receive notifications in browser",
                },
                {
                  key: "orderUpdates",
                  label: "Order updates",
                  desc: "New orders, cancellations, and status changes",
                },
                {
                  key: "campaignAlerts",
                  label: "Campaign alerts",
                  desc: "Campaign performance and expiry warnings",
                },
                {
                  key: "weeklyDigest",
                  label: "Weekly digest",
                  desc: "Summary of weekly platform activity",
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={() => toggleNotification(item.key)}
                      className="sr-only"
                      id={`notif-${item.key}`}
                    />
                    <label
                      htmlFor={`notif-${item.key}`}
                      className={`block h-6 w-11 rounded-full transition cursor-pointer ${
                        notifications[item.key]
                          ? "bg-slate-950"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`block h-5 w-5 rounded-full bg-white shadow-sm transition transform translate-y-[2px] ${
                          notifications[item.key]
                            ? "translate-x-[22px]"
                            : "translate-x-[2px]"
                        }`}
                      />
                    </label>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PersonalSettingsPage;
