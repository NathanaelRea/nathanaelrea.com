export const percentFormat1 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
}).format;

export const percentFormat2 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format;

export const percentFormat0 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format;

export const currencyFormat2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format;

export const currencyFormat0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format;

export function Money({ value }: { value: number }) {
  return <div className="text-white">{currencyFormat0(value)}</div>;
}

export function ColorMoney({ value }: { value: number }) {
  if (value > 0)
    return <div className="text-green-500">{currencyFormat0(value)}</div>;
  else if (value < 0)
    return <div className="text-red-500">{currencyFormat0(value)}</div>;
  else return <div className="text-white">{currencyFormat0(value)}</div>;
}

export function ColorPercent({ value }: { value: number }) {
  if (value > 0)
    return <div className="text-green-500">{percentFormat1(value)}</div>;
  else if (value < 0)
    return <div className="text-red-500">{percentFormat1(value)}</div>;
  else return <div className="text-white">{percentFormat1(value)}</div>;
}
