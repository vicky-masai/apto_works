export const currencyTypes = [
  {
    code: 'USD',
    name: 'United States Dollar',
    symbol: 's'
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€'
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥'
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£'
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$'
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$'
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF'
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥'
  },
  {
    code: 'SEK',
    name: 'Swedish Krona',
    symbol: 'kr'
  },
  {
    code: 'NZD',
    name: 'New Zealand Dollar',
    symbol: 'NZ$'
  }
];

export type CurrencyType = typeof currencyTypes[number]; 