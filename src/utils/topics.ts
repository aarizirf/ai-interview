import { InterviewType } from "./types";

export const getTopics = (type: InterviewType) => {
  switch(type) {
    case InterviewType.Merger:
      return [
        'Accretion/Dilution Analysis',
        'Deal Structures', 
        'Synergy Valuation',
        'Purchase Price Allocation',
        'Transaction Impact'
      ];
    case InterviewType.LBO:
      return [
        'Leverage Analysis',
        'Debt Structuring',
        'Returns Modeling', 
        'Exit Strategies',
        'PE Investment Criteria'
      ];
    case InterviewType.DCF:
      return [
        'Free Cash Flow Projections',
        'WACC Calculation',
        'Terminal Value Analysis',
        'Growth Rate Assumptions', 
        'Sensitivity Analysis'
      ];
    case InterviewType.Valuation:
      return [
        'Trading Comparables',
        'Precedent Transactions',
        'Public Company Analysis',
        'Industry Multiples',
        'Private Company Valuation'
      ];
    case InterviewType.Enterprise:
      return [
        'Enterprise vs Equity Value',
        'Diluted Share Calculations',
        'Treatment of Debt & Cash',
        'Minority Interest',
        'Convertible Securities'
      ];
    case InterviewType.Accounting:
      return [
        'Financial Statements',
        'Working Capital Analysis',
        'Cash vs Accrual',
        'GAAP vs Non-GAAP',
        'Balance Sheet Impact'
      ];
    case InterviewType.General:
      return [
        'Accounting Fundamentals',
        'Mergers & Acquisitions', 
        'LBO Modeling',
        'DCF Analysis',
        'Valuations',
      ];
  }
}; 