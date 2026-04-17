import React from "react";
import { Badge, Card } from "@/src/components/ui";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import type { FinancesIncomeItem } from "@/src/store/redux/services/api-types";

type Props = {
  items: FinancesIncomeItem[];
};

const IncomeBreakdownClients = ({ items }: Props) => (
  <>
    {items.map((item) => (
      <Card
        key={item.customer_id ?? item.name}
        title={item.name}
        subtitle={[
          formatRublesFromCents(item.total_cents),
          item.appointments_count != null
            ? `${item.appointments_count} визитов`
            : null,
        ]
          .filter(Boolean)
          .join(" | ")}
        right={
          item.tag ? (
            <Badge
              title={item.tag.name}
              size="sm"
              style={{
                backgroundColor: item.tag.color,
              }}
            />
          ) : null
        }
      />
    ))}
  </>
);

export default IncomeBreakdownClients;
