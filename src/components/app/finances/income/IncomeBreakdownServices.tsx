import React from "react";
import { Card, Typography } from "@/src/components/ui";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import type { FinancesIncomeItem } from "@/src/store/redux/services/api-types";

type Props = {
  items: FinancesIncomeItem[];
};

const IncomeBreakdownServices = ({ items }: Props) => (
  <>
    {items.map((item) => (
      <Card
        key={item.service_id ?? item.name}
        title={item.name}
        subtitle={
          item.sales_count != null ? `${item.sales_count} продаж` : undefined
        }
        right={
          <Typography weight="medium" className="text-body text-neutral-900">
            {formatRublesFromCents(item.total_cents)}
          </Typography>
        }
      />
    ))}
  </>
);

export default IncomeBreakdownServices;
