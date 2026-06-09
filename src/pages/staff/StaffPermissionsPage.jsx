import { useTranslate } from "@/i18n/useTranslate";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { DataTable, TableToolbar, useDataTable } from "@components/DataTable";
import { useTranslation } from "@hooks/useTranslation";
import { usePaginatedApi } from "@hooks/usePaginatedApi";
import { staffService } from "@services/staffService";
import useToast from "@hooks/useToast";

const StaffPermissionsPage = () => {
  const { t } = useTranslate();

  const { t } = useTranslation();
  const { toastTopRight } = useToast();

  const fetchStaff = useCallback(async () => {
    // getAdminUsers returns an array of staff/admin users. We map them into paginated structure for compatibility.
    const res = await staffService.getStaffMembers();
    const items = res?.data || res || [];
    return {
      items: items.filter(
        (user) => user.role === "STAFF" || user.role === "MANAGER",
      ),
      total: items.length,
      limit: 1000,
      skip: 0,
    };
  }, []);

  const {
    data: items,
    loading,
    error,
    refetch,
  } = usePaginatedApi(fetchStaff, {
    defaultLimit: 1000,
    refreshDeps: [],
  });

  // Local state to track permission toggles
  const [permissionsState, setPermissionsState] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Parse permissions from DB on initial load
  useEffect(() => {
    if (items && items.length > 0) {
      const initialState = {};
      items.forEach((user) => {
        let perms = { create: false, update: false, del: false };
        if (user.permission) {
          try {
            // "permission" is a string like `{"create":true,"update":true,"del":false}`
            // or sometimes unquoted keys like `{create:true, update:true, del:false}`
            const validJsonString = user.permission.replace(
              /([a-zA-Z0-9_]+)(?=\s*:)/g,
              '"$1"',
            );
            const parsed = JSON.parse(validJsonString);
            perms = {
              create: !!parsed.create,
              update: !!parsed.update,
              del: !!parsed.del,
            };
          } catch (e) {
            console.error("Failed to parse permission string", user.permission);
          }
        }
        initialState[user.email] = perms;
      });
      setPermissionsState(initialState);
    }
  }, [items]);

  const handleToggle = (email, key) => {
    setPermissionsState((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        [key]: !prev[email]?.[key],
      },
    }));
  };

  const handleSave = async (user) => {
    setSavingId(user.email);
    try {
      const perms = permissionsState[user.email] || {
        create: false,
        update: false,
        del: false,
      };
      await staffService.updateStaffPermissions(user.email, perms);
      toastTopRight("success", "Permissions updated successfully");
      refetch();
    } catch (err) {
      console.error(err);
      toastTopRight("error", "Failed to update permissions");
    } finally {
      setSavingId(null);
    }
  };

  const dt = useDataTable({
    rows: items || [],
    keyField: "id",
    pageSize: 1000, // Show all for now
  });

  const columns = [
    {
      key: "staff",
      label: "Staff Info",
      width: "2fr",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex shrink-0 items-center justify-center overflow-hidden">
            {item.avatar ? (
              <img
                src={item.avatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-slate-500">
                {item.fullName?.[0]?.toUpperCase() ||
                  item.email[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="font-title text-sm font-semibold text-slate-900">
              {item.fullName || "No Name"}
            </div>
            <div className="text-xs text-slate-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      width: "1fr",
      render: (item) => (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {item.role}
        </Badge>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      width: "3fr",
      render: (item) => {
        const perms = permissionsState[item.email] || {
          create: false,
          update: false,
          del: false,
        };
        return (
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-500"
                  checked={perms.create}
                  onChange={() => handleToggle(item.email, "create")}
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700 select-none group-hover:text-emerald-600 transition-colors">{t('catalog.create')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 transition-all checked:border-amber-500 checked:bg-amber-500 hover:border-amber-500"
                  checked={perms.update}
                  onChange={() => handleToggle(item.email, "update")}
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700 select-none group-hover:text-amber-600 transition-colors">{t('update')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 transition-all checked:border-rose-500 checked:bg-rose-500 hover:border-rose-500"
                  checked={perms.del}
                  onChange={() => handleToggle(item.email, "del")}
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700 select-none group-hover:text-rose-600 transition-colors">{t('catalog.delete')}</span>
            </label>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "100px",
      render: (item) => (
        <Button
          size="sm"
          className="gap-2"
          onClick={() => handleSave(item)}
          disabled={savingId === item.email}
        >
          {savingId === item.email ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          Save
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <section className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8 text-rose-500 font-semibold">
            {error}
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Card className="p-6">
        <TableToolbar
          title="Staff Permissions"
          onRefresh={refetch}
          searchPlaceholder="Search staff..."
        />
        <DataTable
          columns={columns}
          rows={dt.paginated}
          keyField="id"
          loading={loading}
          emptyMessage="No staff members found."
        />
      </Card>
    </section>
  );
};

export default StaffPermissionsPage;
