export const getTopics = (type: string) => {
  switch(type) {
    case 'merger':
      return [
        'Accretion/Dilution Analysis',
        'Deal Structures',
        'Synergy Valuation',
        'Purchase Price Allocation',
        'Transaction Impact'
      ];
    case 'lbo':
      return [
        'Leverage Analysis',
        'Debt Structuring',
        'Returns Modeling',
        'Exit Strategies',
        'PE Investment Criteria'
      ];
    case 'dcf':
      return [
        'Free Cash Flow Projections',
        'WACC Calculation',
        'Terminal Value Analysis',
        'Growth Rate Assumptions',
        'Sensitivity Analysis'
      ];
    case 'valuation':
      return [
        'Trading Comparables',
        'Precedent Transactions',
        'Public Company Analysis',
        'Industry Multiples',
        'Private Company Valuation'
      ];
    case 'enterprise':
      return [
        'Enterprise vs Equity Value',
        'Diluted Share Calculations',
        'Treatment of Debt & Cash',
        'Minority Interest',
        'Convertible Securities'
      ];
    case 'accounting':
      return [
        'Financial Statements',
        'Working Capital Analysis',
        'Cash vs Accrual',
        'GAAP vs Non-GAAP',
        'Balance Sheet Impact'
      ];
    default:
      return [];
  }
}; 