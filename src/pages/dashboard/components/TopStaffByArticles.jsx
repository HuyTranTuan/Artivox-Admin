import PropTypes from "prop-types";

import useTranslation from "@/hooks/useTranslation";

export default function TopStaffByArticles({ staff, index }) {
  const { t } = useTranslation();
  return (
    <div key={staff.id || index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold text-sm shrink-0">
        {staff?.fullName?.charAt(0)?.toUpperCase() || "S"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-title text-sm font-semibold  truncate">{staff?.fullName || t("common.unknown")}</div>
        <div className="text-xs text-slate-600 dark:text-white">
          {staff?._count?.articles || staff?.articleCount || 0} {t("dashboard.articles")}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-slate-600 dark:text-white truncate">{staff?.phone}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-slate-600 dark:text-white truncate">{staff?.email}</div>
      </div>
      {staff?.id ? (
        <div className="text-right shrink-0">
          <div className="font-title text-sm font-bold ">#{index + 1}</div>
        </div>
      ) : null}
    </div>
  );
}

TopStaffByArticles.propTypes = {
  staff: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};
