import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface TooltipPayloadItem {
  name: string;
  value: number | string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: number | string, name?: string) => string;
  labelFormatter?: (label: string) => string;
}

export function CustomTooltip({ 
  active, 
  payload, 
  label, 
  formatter = (value: number | string) => String(value),
  labelFormatter = (label: string) => label 
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card border-0 shadow-2xl">
        <CardContent className="p-3 min-w-[150px]">
          {label && (
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              {labelFormatter(label)}
            </div>
          )}
          <div className="space-y-1">
            {payload.map((entry: TooltipPayloadItem, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs font-medium text-foreground">
                    {entry.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-foreground">
                  {formatter(entry.value, entry.name)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function EquityTooltip({ active, payload, label }: CustomTooltipProps) {
  const currencyFormatter = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <CustomTooltip
      active={active}
      payload={payload}
      label={label}
      formatter={currencyFormatter}
    />
  );
}

export function PercentTooltip({ active, payload, label }: CustomTooltipProps) {
  const percentFormatter = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <CustomTooltip
      active={active}
      payload={payload}
      label={label}
      formatter={percentFormatter}
    />
  );
}

export function TradeTooltip({ active, payload, label }: CustomTooltipProps) {
  const tradeFormatter = (value: number, name: string) => {
    if (name.toLowerCase().includes('$') || name.toLowerCase().includes('p&l')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (name.toLowerCase().includes('rate')) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  return (
    <CustomTooltip
      active={active}
      payload={payload}
      label={label}
      formatter={tradeFormatter}
    />
  );
}
