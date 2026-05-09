import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  Eye,
  EyeOff,
  Globe,
  Key,
  Loader2,
  Mail,
  Save,
  Shield,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { settingsService } from "@services/settingsService";

const DEFAULT_AVATAR_COLOR = "bg-slate-950";

const PersonalSettingsPage = () => {
  // ---------------------------------- State ----------------------------------
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    language: "English (US)",
    timezone: "Asia/Saigon (UTC+7)",
    avatar: null,
    twoFactorEnabled: false,
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    orderUpdates: true,
    campaignAlerts: false,
    weeklyDigest: true,
  });

  // UI feedback
  const [toast, setToast] = useState(null); // { type: "success" | "error", message }
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ---------------------------------- Effects ---------------------------------
  // Simulate fetching profile + notifications
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [profileData, notifData] = await Promise.all([
          settingsService.getProfile(),
          settingsService.getNotifications(),
        ]);
        if (!mounted) return;
        setProfile((prev) => ({ ...prev, ...profileData }));
        setNotifications((prev) => ({ ...prev, ...notifData }));
      } catch {
        // keep defaults
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // ---------------------------------- Handlers --------------------------------
  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Profile field change
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        language: profile.language,
        timezone: profile.timezone,
      });
      showToast("success", "Profile saved successfully");
    } catch {
      showToast("error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const result = await settingsService.uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar: result.url }));
      showToast("success", "Avatar updated");
    } catch {
      showToast("error", "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    try {
      await settingsService.removeAvatar();
      setProfile((prev) => ({ ...prev, avatar: null }));
      showToast("success", "Avatar removed");
    } catch {
      showToast("error", "Failed to remove avatar");
    }
  };

  // Password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Client-side validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const result = await settingsService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (result.success) {
        showToast("success", "Password updated");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordError(result.error || "Failed to update password");
      }
    } catch {
      setPasswordError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Toggle notification
  const toggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    // Persist to mock service
    settingsService.updateNotifications(updated);
    showToast(
      "success",
      `Notification "${key}" ${updated[key] ? "enabled" : "disabled"}`,
    );
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    const enabled = !profile.twoFactorEnabled;
    try {
      await settingsService.toggleTwoFactor(enabled);
      setProfile((prev) => ({ ...prev, twoFactorEnabled: enabled }));
      showToast("success", `Two-factor ${enabled ? "enabled" : "disabled"}`);
    } catch {
      showToast("error", "Failed to update 2FA setting");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      await settingsService.deleteAccount();
      showToast("success", "Account has been deleted (soft)");
      setShowDeleteConfirm(false);
    } catch {
      showToast("error", "Failed to delete account");
    }
  };

  // ---------------------------------- Loading --------------------------------
  if (loading) {
    return (
      <section className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading settings...</span>
        </div>
      </section>
    );
  }

  // ---------------------------------- Render --------------------------------
  const initial = profile.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <section className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className={`h-20 w-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden ${
                profile.avatar ? "" : DEFAULT_AVATAR_COLOR
              }`}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
              {avatarUploading ? (
                <Loader2 className="h-3.5 w-3.5 text-slate-600 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5 text-slate-600" />
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
              />
            </label>
            {profile.avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm transition"
              >
                <X className="h-3 w-3" />
              </button>
            )}
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
        {/* ============== LEFT COLUMN ============== */}
        <div className="space-y-6">
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

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  className="w-full"
                  required
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
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      handleProfileChange("email", e.target.value)
                    }
                    className="pl-10 w-full"
                    required
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
                  placeholder="Tell us about yourself"
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
                <Button type="submit" className="gap-2" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Avatar Upload Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold text-slate-900">
                  Avatar
                </h2>
                <p className="text-xs text-slate-500">
                  Upload or remove your profile picture
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                  <Camera className="h-4 w-4" />
                  Choose image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </label>
              {profile.avatar && (
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={handleRemoveAvatar}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* ============== RIGHT COLUMN ============== */}
        <div className="space-y-6">
          {/* Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold text-slate-900">
                  Security
                </h2>
                <p className="text-xs text-slate-500">
                  Update your password and security settings
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showPw.current ? "text" : "password"}
                    placeholder="Enter current password"
                    className="pr-10 w-full"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((prev) => ({ ...prev, current: !prev.current }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPw.current ? (
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
                    type={showPw.new ? "text" : "password"}
                    placeholder="Enter new password (min 6 chars)"
                    className="pr-10 w-full"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPw.new ? (
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
                    type={showPw.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="pr-10 w-full"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPw.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password error */}
              {passwordError && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {passwordError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setPasswordError("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gap-2" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold text-slate-900">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs text-slate-500">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Two-Factor Auth
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {profile.twoFactorEnabled
                    ? "Your account is protected by 2FA"
                    : "Enable 2FA for additional security"}
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={profile.twoFactorEnabled}
                  onChange={handleToggle2FA}
                  className="sr-only"
                  id="toggle-2fa"
                />
                <label
                  htmlFor="toggle-2fa"
                  className={`block h-6 w-11 rounded-full transition cursor-pointer ${
                    profile.twoFactorEnabled ? "bg-slate-950" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white shadow-sm transition transform translate-y-[2px] ${
                      profile.twoFactorEnabled
                        ? "translate-x-[22px]"
                        : "translate-x-[2px]"
                    }`}
                  />
                </label>
              </div>
            </div>
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

          {/* Danger Zone */}
          <Card className="p-6 border-rose-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold text-slate-900">
                  Danger Zone
                </h2>
                <p className="text-xs text-slate-500">
                  Irreversible account actions
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-rose-200 p-4">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Delete Account
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Permanently delete your account and all associated data
                </div>
              </div>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 font-title text-xl font-bold text-slate-900">
              Delete Account
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteAccount}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PersonalSettingsPage;
