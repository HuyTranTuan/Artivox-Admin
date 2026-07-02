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
import { useTranslation } from "@hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import Loading from "@/components/Loading";
import { Label } from "@/components/ui/label";

const DEFAULT_AVATAR_COLOR = "bg-slate-950";

const PersonalSettingsPage = () => {
  const { t } = useTranslation();

  // ---------------------------------- State ----------------------------------
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { user, refreshUserAvatar, updateUser } = useAuthStore();

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
  const [toast, setToast] = useState(null);
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
      updateUser({
        fullName: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
      showToast(
        "success",
        t("settings.profileSaved", "Profile saved successfully"),
      );
    } catch {
      showToast(
        "error",
        t("settings.profileSaveFailed", "Failed to save profile"),
      );
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
      showToast("success", t("settings.avatarUpdated", "Avatar updated"));
      refreshUserAvatar(result.url);
    } catch {
      showToast(
        "error",
        t("settings.avatarUploadFailed", "Failed to upload avatar"),
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    try {
      await settingsService.removeAvatar();
      setProfile((prev) => ({ ...prev, avatar: null }));
      showToast("success", t("settings.avatarRemoved"));
      refreshUserAvatar(null || "");
    } catch {
      showToast("error", t("settings.avatarRemoveFailed"));
    }
  };

  // Password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Client-side validation
    if (!passwordForm.currentPassword) {
      setPasswordError(t("settings.currentPasswordRequired"));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError(t("settings.newPasswordMinLength"));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t("settings.passwordsDoNotMatch"));
      return;
    }

    setSaving(true);
    try {
      const result = await settingsService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (result.success) {
        showToast("success", t("settings.passwordUpdated"));
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordError(result.error || t("settings.passwordUpdateFailed"));
      }
    } catch {
      setPasswordError(t("common.errorOccurred"));
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
      t("settings.notificationToggled", {
        key,
        status: updated[key] ? t("common.enabled") : t("common.disabled"),
        defaultValue: `Notification "${key}" ${updated[key] ? t("common.enabled") : t("common.disabled")}`,
      }),
    );
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    const enabled = !profile.twoFactorEnabled;
    try {
      await settingsService.toggleTwoFactor(enabled);
      setProfile((prev) => ({ ...prev, twoFactorEnabled: enabled }));
      showToast(
        "success",
        t("settings.twoFactorToggled", {
          status: enabled ? t("common.enabled") : t("common.disabled"),
          defaultValue: `Two-factor ${enabled ? t("common.enabled") : t("common.disabled")}`,
        }),
      );
    } catch {
      showToast("error", t("settings.twoFactorUpdateFailed"));
    }
  };

  if (loading) {
    return <Loading text={false} height={"20"} width={"20"} />;
  }

  const initial = profile.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <section className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-9999 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg transition-all ${
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
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className={`h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-bold overflow-hidden ${
                profile.avatar ? "" : DEFAULT_AVATAR_COLOR
              }`}
            >
              {profile.avatar ? (
                <img
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  width={100}
                  height={100}
                  src={profile.avatar}
                />
              ) : (
                initial
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center bg-(--color-surface) border border-border-surface cursor-pointer hover:text-(--color-primary)/50 transition">
              {avatarUploading ? (
                <Loader2 className="h-3.5 w-3.5  animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5 " />
              )}
              <Input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
              />
            </label>
            {profile.avatar && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center shadow-sm transition"
                onClick={handleRemoveAvatar}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div>
            <h1 className="font-title text-2xl font-bold ">
              {t("settings.title", "Personal settings")}
            </h1>
            <p className="mt-1 text-sm ">
              {t(
                "settings.subtitle",
                "Manage your profile, security, and notification preferences",
              )}
            </p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-emerald-200 text-emerald-800 border-emerald-400 p-2 rounded-md text-xl pointer-events-none">
              {profile.role === "STAFF" ? t("auth.staff") : t("auth.admin")}
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
              <div className="h-9 w-9 rounded-xl bg-(--color-primary)/10 flex items-center justify-center">
                <User className="h-5 w-5 " />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold ">
                  {t("settings.profileInfo", "Profile Information")}
                </h2>
                <p className="text-xs ">
                  {t("settings.updateDetails", "Update your personal details")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Name */}
              <div>
                <Label className="block text-sm font-medium  mb-1.5">
                  {t("settings.fullName", "Full Name")}
                </Label>
                <Input
                  value={profile.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label className="block text-sm font-medium  mb-1.5">
                  {t("settings.emailAddress", "Email Address")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 " />
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
                <Label className="block text-sm font-medium  mb-1.5">
                  {t("settings.phoneNumber", "Phone Number")}
                </Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Bio */}
              <div>
                <Label className="block text-sm font-medium  mb-1.5">
                  {t("settings.bio", "Bio")}
                </Label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:border-slate-950 transition resize-none"
                  placeholder={t(
                    "settings.bioPlaceholder",
                    "Tell us about yourself",
                  )}
                />
              </div>

              {/* Language & Timezone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium  mb-1.5">
                    {t("settings.language", "Language")}
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 " />
                    <select
                      value={profile.language}
                      onChange={(e) =>
                        handleProfileChange("language", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm   focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:border-slate-950 transition appearance-none"
                    >
                      <option>English (US)</option>
                      <option>{t("vietnamese")}</option>
                      <option>{t("japanese")}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium  mb-1.5">
                    {t("settings.timezone", "Timezone")}
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 " />
                    <select
                      value={profile.timezone}
                      onChange={(e) =>
                        handleProfileChange("timezone", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm   focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:border-slate-950 transition appearance-none"
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
                <Button
                  type="submit"
                  className="px-4 py-2 gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <Loading text={false} width={"4"} height={"4"} />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving
                    ? t("common.saving", "Saving...")
                    : t("common.saveChanges", "Save Changes")}
                </Button>
              </div>
            </form>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-(--color-primary)/10 flex items-center justify-center">
                <Shield className="h-5 w-5 " />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold ">
                  {t("settings.twoFactorAuth")}
                </h2>
                <p className="text-xs ">{t("settings.twoFactorSubtitle")}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-medium ">
                  {t("settings.twoFactorAuthShort")}
                </div>
                <div className="text-xs  mt-0.5">
                  {profile.twoFactorEnabled
                    ? t("settings.2faProtected")
                    : t("settings.2faEnable")}
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
                <Label
                  htmlFor="toggle-2fa"
                  className="block h-6 w-11 rounded-full transition cursor-pointer bg-(--color-secondary)/20"
                >
                  <span
                    className={`block h-5 w-5 rounded-full  shadow-sm transition transform translate-y-[2px] ${
                      profile.twoFactorEnabled
                        ? "translate-x-[22px] bg-(--color-primary)"
                        : "translate-x-[2px] bg-(--color-primary)"
                    }`}
                  />
                </Label>
              </div>
            </div>
          </Card>

          {/* Avatar Upload Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-(--color-primary)/10 flex items-center justify-center">
                <Upload className="h-5 w-5 " />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold ">
                  {t("settings.avatar")}
                </h2>
                <p className="text-xs ">{t("settings.uploadRemoveAvatar")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm  hover:bg-slate-50 dark:hover:bg-neutral-800\/50 transition">
                  <Camera className="h-4 w-4" />
                  {t("settings.chooseImage")}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </Label>
              {profile.avatar && (
                <Button
                  variant="secondary"
                  className="gap-2 px-3 py-2"
                  onClick={handleRemoveAvatar}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("common.remove")}
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
              <div className="h-9 w-9 rounded-xl bg-(--color-primary)/10 flex items-center justify-center">
                <Shield className="h-5 w-5 " />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold ">
                  {t("settings.security")}
                </h2>
                <p className="text-xs ">{t("settings.securitySubtitle")}</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <Label className="block text-sm font-medium  mb-1.5">
                  {t("settings.currentPassword")}
                </Label>
                <div className="relative">
                  <Input
                    type={showPw.current ? "text" : "password"}
                    placeholder={t("settings.enterCurrentPassword")}
                    className="pr-10 w-full"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setShowPw((prev) => ({ ...prev, current: !prev.current }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPw.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <Label className="block text-sm font-medium  mb-1.5">
                  {t("settings.newPassword")}
                </Label>
                <div className="relative">
                  <Input
                    type={showPw.new ? "text" : "password"}
                    placeholder={t("settings.enterNewPassword")}
                    className="pr-10 w-full"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setShowPw((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 "
                  >
                    {showPw.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label className="block text-sm font-medium  mb-1.5">
                  {t("settings.confirmNewPassword", "Confirm New Password")}
                </Label>
                <div className="relative">
                  <Input
                    type={showPw.confirm ? "text" : "password"}
                    placeholder={t(
                      "settings.confirmNewPasswordPlaceholder",
                      "Confirm new password",
                    )}
                    className="pr-10 w-full"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      setShowPw((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2  hover: transition"
                  >
                    {showPw.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password error */}
              {passwordError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
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
                  className="px-3 py-2.5 rounded-xl"
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  className="gap-2 px-3 py-2.5 rounded-xl"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  {saving
                    ? t("common.updating", "Updating...")
                    : t("settings.updatePassword", "Update Password")}
                </Button>
              </div>
            </form>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-(--color-primary)/10 flex items-center justify-center">
                <Bell className="h-5 w-5 " />
              </div>
              <div>
                <h2 className="font-title text-lg font-semibold ">
                  {t("settings.notifications", "Notifications")}
                </h2>
                <p className="text-xs ">
                  {t(
                    "settings.notificationsSubtitle",
                    "Control what notifications you receive",
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: "email",
                  label: t("settings.emailNotifications"),
                  desc: t("settings.emailNotificationsDesc"),
                },
                {
                  key: "push",
                  label: t("settings.pushNotifications"),
                  desc: t("settings.pushNotificationsDesc"),
                },
                {
                  key: "orderUpdates",
                  label: t("settings.orderUpdates"),
                  desc: t("settings.orderUpdatesDesc"),
                },
                {
                  key: "campaignAlerts",
                  label: t("settings.campaignAlerts"),
                  desc: t("settings.campaignAlertsDesc"),
                },
                {
                  key: "weeklyDigest",
                  label: t("settings.weeklyDigest"),
                  desc: t("settings.weeklyDigestDesc"),
                },
              ].map((item) => (
                <Label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800\/50 transition cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-medium ">{item.label}</div>
                    <div className="text-xs  mt-0.5">{item.desc}</div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={() => toggleNotification(item.key)}
                      className="sr-only"
                      id={`notif-${item.key}`}
                    />
                    <Label
                      htmlFor={`notif-${item.key}`}
                      className="block h-6 w-11 rounded-full transition cursor-pointer bg-(--color-secondary)/20"
                    >
                      <span
                        className={`block h-5 w-5 rounded-full  shadow-sm transition transform translate-y-[2px] ${
                          notifications[item.key]
                            ? "translate-x-[22px] bg-(--color-primary)"
                            : "translate-x-[2px] bg-(--color-primary)"
                        }`}
                      />
                    </Label>
                  </div>
                </Label>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PersonalSettingsPage;
