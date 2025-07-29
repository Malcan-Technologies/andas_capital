# Admin Dashboard Metrics Documentation

This document provides a comprehensive explanation of all metrics displayed on the admin dashboard, including their calculations, data sources, and business significance.

## Quick Actions Workflow Metrics

### 1. Pending Decisions
- **Description**: Number of loan applications requiring manual review or decision
- **Calculation**: Count of applications with status `PENDING_APPROVAL` or `COLLATERAL_REVIEW`
- **Data Source**: `loan_applications` table
- **Business Significance**: Indicates workload for underwriting team

### 2. Pending Disbursements
- **Description**: Number of approved loans waiting for fund disbursement
- **Calculation**: Count of applications with status `PENDING_DISBURSEMENT`
- **Data Source**: `loan_applications` table
- **Business Significance**: Shows operational efficiency in fund disbursement process

### 3. Pending Discharge
- **Description**: Number of loans that are fully paid but not yet discharged
- **Calculation**: Count of loans with status `PENDING_DISCHARGE`
- **Data Source**: `loans` table
- **Business Significance**: Indicates loan closure processing efficiency

### 4. Pending Payments
- **Description**: Number of repayment transactions awaiting approval
- **Calculation**: Count of pending repayment records
- **Data Source**: `repayments` table via `/api/admin/repayments/pending`
- **Business Significance**: Shows payment processing workload

### 5. Live Attestations
- **Description**: Number of applications requiring video call verification
- **Calculation**: Count of applications where `attestationCompleted` is false and `attestationType` is not null
- **Data Source**: `loan_applications` table
- **Business Significance**: Indicates KYC verification workload

## 🔹 1. Loan Portfolio Overview

### Total Loans Issued
- **Description**: Cumulative number of loans disbursed throughout the platform's lifetime
- **Calculation**: Count of all loans with status `ACTIVE`, `PENDING_DISCHARGE`, or `DISCHARGED`
- **Data Source**: `loans` table
- **Business Significance**: Shows total lending volume and business scale

### Active Loan Book
- **Description**: Total outstanding principal across all active loans
- **Calculation**: Sum of `outstandingBalance` for loans with status `ACTIVE` or `PENDING_DISCHARGE`
- **Data Source**: `loans` table
- **Business Significance**: Represents current credit exposure and revenue-generating assets

### Number of Active Loans
- **Description**: Count of loans currently being repaid
- **Calculation**: Count of loans with status `ACTIVE`
- **Data Source**: `loans` table
- **Business Significance**: Shows current portfolio size and operational complexity

### Average Loan Size
- **Description**: Mean principal amount per loan
- **Calculation**: `SUM(principalAmount) / COUNT(loans)` for all issued loans
- **Data Source**: `loans` table
- **Business Significance**: Indicates typical borrower profile and risk concentration

### Average Loan Term
- **Description**: Mean duration of loans in days
- **Calculation**: `AVG(term)` for all loans
- **Data Source**: `loans` table (`term` field)
- **Business Significance**: Shows loan product mix and cash flow timing

### Portfolio Performance Chart
- **Description**: Trend of outstanding loan balances over time
- **Data Source**: 
  - Monthly: Aggregated monthly loan values
  - Daily: Daily snapshots of outstanding balances (last 30 days)
- **Calculation**: 
  - Current value: Sum of `outstandingBalance` for active loans
  - Historical: Simulated realistic progression based on actual current value
- **Business Significance**: Shows portfolio growth trends and business momentum

## 🔹 2. Repayment & Performance

### Repayment Rate
- **Description**: Percentage of loans with on-time repayments
- **Calculation**: `(COUNT(repayments WHERE paidAt <= dueDate) / COUNT(total_scheduled_repayments)) * 100`
- **Data Source**: `loan_repayments` table
- **Business Significance**: Key indicator of portfolio quality and borrower behavior

### Delinquency Rate (30+ Days)
- **Description**: Percentage of loans overdue by 30 or more days
- **Calculation**: 
  ```sql
  SELECT COUNT(*) FROM loan_repayments 
  WHERE dueDate < CURRENT_DATE - INTERVAL '30 days' 
  AND paidAt IS NULL
  ```
- **Data Source**: `loan_repayments` table
- **Business Significance**: Early warning indicator for potential defaults

### Default Rate
- **Description**: Percentage of loans written off as unrecoverable
- **Calculation**: `(COUNT(loans WHERE status = 'DEFAULTED') / COUNT(total_loans)) * 100`
- **Data Source**: `loans` table
- **Business Significance**: Measures ultimate credit losses

### Collections (Last 30 Days)
- **Description**: Total amount collected from borrowers in the past month
- **Calculation**: 
  ```sql
  SELECT SUM(amount) FROM wallet_transactions 
  WHERE type = 'LOAN_REPAYMENT' 
  AND status = 'APPROVED' 
  AND processedAt >= CURRENT_DATE - INTERVAL '30 days'
  ```
- **Data Source**: `wallet_transactions` table
- **Business Significance**: Shows recent cash flow and collection efficiency

### Repayment Performance Chart
- **Description**: Comparison of actual vs scheduled repayments over time
- **Data Source**: 
  - Actual: `wallet_transactions` with type `LOAN_REPAYMENT`
  - Scheduled: `loan_repayments` table aggregated by due date
- **Business Significance**: Shows collection efficiency and cash flow predictability

## 🔹 3. Revenue & Interest

### Total Interest Earned
- **Description**: Cumulative interest revenue from all loans
- **Calculation**: Sum of interest components from all repayments
- **Data Source**: Calculated from `loan_repayments` where `amount > principalAmount`
- **Business Significance**: Shows total profitability of lending operations

### Portfolio Yield (Comprehensive Revenue Yield)
- **Description**: Total portfolio yield including interest, fees, and penalties as annual percentage
- **Calculation**: `((Base Interest Rate + Amortized Fee Yield + Penalty Yield) × 12)` where:
  - Base Interest Rate: `SUM(principalAmount × interestRate) / SUM(principalAmount)` (monthly rate)
  - Amortized Fee Yield: `(Total Fees / Total Principal) / Average Loan Term` (monthly equivalent of upfront fees)
  - Penalty Yield: `(Total Penalties / Total Principal) / 12` (monthly equivalent of ongoing penalties)
- **Data Source**: `loans` table, `loan_applications` table (fees), late fee collections
- **Unit**: Percentage per annum (e.g., 19.2% = 19.2% per year)
- **Business Significance**: Comprehensive revenue rate including all income sources, providing true portfolio profitability assessment
- **Note**: Upfront fees (application, origination, legal) are amortized over the average loan term to reflect their monthly contribution to yield. This provides a more accurate representation of ongoing portfolio returns since fees are collected once per loan at disbursement.

### Fees Earned (Total)
- **Description**: Total upfront fees collected from disbursed loans
- **Calculation**: 
  ```sql
  SELECT SUM(
    COALESCE(applicationFee, 0) + 
    COALESCE(originationFee, 0) + 
    COALESCE(legalFee, 0)
  ) FROM loan_applications 
  WHERE status IN ('ACTIVE', 'DISBURSED', 'PENDING_DISCHARGE', 'DISCHARGED')
  ```
- **Data Source**: `loan_applications` table (`applicationFee`, `originationFee`, `legalFee` fields)
- **Business Significance**: Shows upfront revenue from loan processing fees
- **Note**: These fees are deducted from disbursement amounts and represent immediate revenue
- **Chart Data**: Monthly/daily fees are calculated based on loan disbursement dates (`updatedAt` field) to show when fees were actually collected

### Penalty Fees Collected
- **Description**: Total late fees and penalty charges collected
- **Calculation**: Sum of `lateFeesPaid` from all repayments
- **Data Source**: `loan_repayments` table
- **Business Significance**: Additional revenue stream and borrower behavior indicator

### Revenue Performance Chart
- **Description**: Trend of interest revenue over time
- **Data Source**: Daily/monthly revenue calculations
- **Calculation**: 15% of actual repayments (estimated interest portion)
- **Business Significance**: Shows revenue generation trends and seasonality

## 🔹 4. Operational Efficiency

### Application Approval Ratio
- **Description**: Percentage of processed applications that are approved
- **Calculation**: `(approved_applications / (approved_applications + rejected_applications)) * 100`
- **Data Source**: `loan_applications` table
- **Business Significance**: Measures underwriting efficiency and credit policy effectiveness
- **Note**: Excludes pending applications to show true approval rate of decisions made

### Loan Approval Time
- **Description**: Average time from application to approval decision
- **Calculation**: 
  ```sql
  AVG(EXTRACT(EPOCH FROM (updatedAt - createdAt)) / 3600) 
  FROM loan_applications 
  WHERE status IN ('APPROVED', 'ACTIVE', 'PENDING_DISBURSEMENT')
  ```
- **Data Source**: `loan_applications` table
- **Business Significance**: Operational efficiency metric affecting customer experience

### Disbursement Time
- **Description**: Average time from approval to fund disbursement
- **Calculation**: 
  ```sql
  AVG(EXTRACT(EPOCH FROM (disbursedAt - updatedAt)) / 3600) 
  FROM loan_disbursements ld 
  JOIN loan_applications la ON ld.applicationId = la.id
  ```
- **Data Source**: `loan_disbursements` and `loan_applications` tables
- **Business Significance**: Customer satisfaction and operational efficiency indicator

### Manual Review Rate
- **Description**: Percentage of applications requiring manual intervention
- **Calculation**: `(manual_review_applications / total_applications) * 100`
- **Data Source**: Applications with `attestationType` not null or status `COLLATERAL_REVIEW`
- **Business Significance**: Automation effectiveness and operational scalability

### Application Flow Chart
- **Description**: Funnel showing applications → approvals → disbursements over time
- **Data Source**: Daily/monthly aggregation of application statuses
- **Business Significance**: Shows conversion rates and identifies bottlenecks

## 🔹 5. Application Status Summary

### Application Status Distribution (Pie Chart)
- **Description**: Visual breakdown of all applications by current status
- **Categories**:
  - **Disbursed**: Loans that have been funded
  - **Pending Disbursement**: Approved but not yet funded
  - **Pending Review**: Awaiting underwriting decision
  - **Rejected**: Applications declined
- **Data Source**: `loan_applications` table grouped by status
- **Business Significance**: Shows overall funnel health and identifies status bottlenecks

## Data Refresh & Accuracy

### Update Frequency
- **Real-time**: Quick Actions counters update on page load
- **Batch**: Historical charts and KPIs calculated during API calls
- **Simulation**: Some historical data uses realistic simulations based on current actual values

### Data Sources
- **Primary**: PostgreSQL database tables
- **Real-time Calculations**: Aggregations performed during API requests
- **Time Zones**: All calculations use Malaysia timezone (UTC+8) for business alignment

### Chart Data Modes
- **Monthly View**: Last 6 months of aggregated data
- **Daily View**: Last 30 days of daily snapshots
- **Responsive**: Automatically switches data granularity based on selected view

## Business Intelligence Insights

### Key Performance Indicators (KPIs)
1. **Portfolio Health**: Delinquency and default rates
2. **Operational Efficiency**: Processing times and approval rates
3. **Profitability**: Interest rates and revenue trends
4. **Growth**: New applications and loan book expansion
5. **Risk Management**: Manual review rates and exposure concentration

### Recommended Monitoring
- **Daily**: Quick Actions counters, pending disbursements
- **Weekly**: Delinquency rates, approval times
- **Monthly**: Portfolio growth, revenue trends, approval ratios
- **Quarterly**: Default rates, average loan terms, interest rate optimization

This documentation serves as a reference for understanding the business metrics that drive loan portfolio management and operational decision-making. 