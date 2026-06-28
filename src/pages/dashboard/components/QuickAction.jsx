import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import useTranslation from "@/hooks/useTranslation";

export default function QuickAction({ path, title, text }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`${path}`)} className="rounded-xl border border-(--color-title) p-4 hover:border-(--color-primary) transition cursor-pointer">
      <div className="font-title text-sm font-semibold">{t(`${title}`)}</div>
      <div className="text-xs mt-1">{t(`${text}`)}</div>
    </div>
  );
}

QuickAction.propTypes = {
  path: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
};
