import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingDown } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useTranslation } from "@/lib/i18n";

interface PriceTransparencyWidgetProps {
  originalPrice: number;
  ourPrice: number;
  productName: string;
}

export function PriceTransparencyWidget({ originalPrice, ourPrice, productName }: PriceTransparencyWidgetProps) {
  const { t } = useTranslation();
  const savings = originalPrice - ourPrice;
  const savingsPercent = Math.round((savings / originalPrice) * 100);

  const data = [
    {
      name: "Traditional Retail",
      price: originalPrice,
      fill: "#94a3b8", // slate-400
    },
    {
      name: "Win-Store Price",
      price: ourPrice,
      fill: "#4169E1", // Royal Blue
    },
  ];

  return (
    <Card className="w-full bg-white shadow-lg border-primary/10 overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex justify-between items-center">
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
            Transparency Breakdown
            <UITooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">We cut out the middlemen (markups, distributors, retailers) to bring you factory-direct pricing.</p>
              </TooltipContent>
            </UITooltip>
          </h3>
          <p className="text-sm text-muted-foreground">See where your money goes.</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 px-3 py-1 text-sm font-semibold flex items-center gap-1 shadow-sm">
          <TrendingDown className="w-4 h-4" />
          Save {savingsPercent}%
        </Badge>
      </div>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${t("common.currency")} ${Number(value).toFixed(2)}`, 'Price']}
                />
                <Bar dataKey="price" radius={[0, 4, 4, 0]} barSize={32}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="price"
                    position="right"
                    formatter={(val: number) => `${t("common.currency")} ${val.toFixed(0)}`}
                    style={{ fill: '#334155', fontWeight: 'bold', fontSize: '14px' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-muted-foreground">Typical Retail Markup</span>
              <span className="font-mono text-destructive line-through">{t("common.currency")} {(originalPrice * 0.6).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-muted-foreground">Middlemen Fees</span>
              <span className="font-mono text-destructive line-through">{t("common.currency")} {(originalPrice * 0.25).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-lg text-primary">Your Savings</span>
              <span className="font-bold text-2xl text-accent-foreground bg-accent/20 px-3 py-1 rounded-md">
                {t("common.currency")} {savings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
