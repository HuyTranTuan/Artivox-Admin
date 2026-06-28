import PropTypes from "prop-types";

import useTranslation from "@/hooks/useTranslation";
import { formatPrice } from "@/utils/formatUtils";

export default function TopCustomer({ customer, index }) {
  const { t } = useTranslation();

  return (
    <div key={customer.customerId || index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-(--color-primary)/10 transition">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-primary)/20 text-(--color-primary) font-bold text-sm shrink-0">
        {customer.customerName?.charAt(0)?.toUpperCase() || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{customer.customerName}</div>
        {customer.orderCount > 0 ? (
          <div className="text-xs">
            {customer.orderCount} {t("orders")}
          </div>
        ) : (
          <div className="text-xs">
            {customer.orderCount} {t("order")}
          </div>
        )}
      </div>
      <div className="text-sm font-bold   shrink-0">{formatPrice(customer.totalSpent)}</div>
    </div>
  );
}

TopCustomer.propTypes = {
  customer: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};
