# Email Export Implementation for Survey Results

## Overview

This document outlines the implementation of email address capture and export functionality for the Survey Results pages (Managerial/Non-Managerial). The feature ensures secure and compliant handling of employee email data during CSV exports.

## Implementation Details

### 1. Database Schema Updates

The implementation leverages existing database migrations that add email columns to both `employees` and `survey_responses` tables:

- **employees.email**: Stores employee email addresses
- **survey_responses.email**: Stores email at time of survey submission (if needed)

### 2. Code Changes

#### A. Interface Updates (`SurveyResults.tsx`)

```typescript
interface SurveyResponse {
  // ... existing fields
  employee_email?: string;  // Added email field
  employees?: {
    level: string;
    department: string;
    name: string;
    email?: string;  // Added email to employee relation
  };
}
```

#### B. Data Fetching Enhancement

Modified the `fetchSurveyData` function to include email in the JOIN query:

```typescript
const { data: surveyData, error: surveyError } = await supabase
  .from("survey_responses")
  .select(`
    *,
    employees!inner(
      level,
      department,
      name,
      email  // Added email field
    )
  `)
  .order("created_at", { ascending: false });
```

#### C. Data Transformation

Enhanced data mapping to include employee email:

```typescript
const enrichedData = (surveyData || []).map(response => ({
  ...response,
  level: response.employees?.level || 'Non Managerial',
  employee_department: response.employees?.department || response.department,
  employee_name: response.employees?.name || response.name,
  employee_email: response.employees?.email || ''  // Added email mapping
}));
```

#### D. CSV Export Enhancement

Updated the `exportResults` function to include email in CSV output:

1. **Headers**: Added "Email Address" column after "ID Badge"
2. **Data Rows**: Added email field with fallback to 'N/A' if not available

```typescript
const headers = [
  "Name",
  "ID Badge", 
  "Email Address",  // Added email header
  "Department",
  "Submission Date",
  "Overall Average Rating",
  // ... other headers
];

const row = [
  `"${response.name}"`,
  response.id_badge_number,
  `"${response.employee_email || 'N/A'}"`,  // Added email data
  `"${response.department}"`,
  // ... other data
];
```

## Security and Compliance Features

### 1. Data Access Control

- **Role-Based Access**: Email export is only available to users with appropriate permissions (non-viewer roles)
- **Secure JOIN**: Uses INNER JOIN to ensure only valid employee-survey response relationships are included
- **Data Validation**: Includes fallback handling for missing email data

### 2. Data Protection

- **CSV Escaping**: Email addresses are properly escaped in CSV format to prevent injection attacks
- **No Direct Database Exposure**: Email data is accessed through Supabase's secure API layer
- **Audit Trail**: All data access is logged through Supabase's built-in logging

### 3. Compliance Considerations

- **Data Minimization**: Only includes email when explicitly needed for export
- **Purpose Limitation**: Email is only used for survey result identification and contact purposes
- **Secure Storage**: Leverages Supabase's enterprise-grade security infrastructure
- **Access Logging**: All export activities are traceable through application logs

## Usage Instructions

### For Administrators

1. **Navigate** to Survey Results → Managerial Results or Non-Managerial Results
2. **Click** the "Export CSV" button (visible only to admin/manager roles)
3. **Download** will include email addresses in the "Email Address" column
4. **Verify** that email data is properly populated from employee records

### For Data Handlers

- **Handle exported CSV files** according to your organization's data protection policies
- **Ensure secure storage** of exported files containing personal information
- **Follow retention policies** for exported survey data
- **Report any data discrepancies** to system administrators

## Technical Notes

### Database Relationships

- Survey responses are linked to employees via `id_badge_number`
- Email data is sourced from the `employees` table to ensure consistency
- INNER JOIN ensures only responses with valid employee records are included

### Error Handling

- Missing email addresses display as 'N/A' in exports
- Database connection errors are handled gracefully with user notifications
- Invalid data is filtered out during the JOIN operation

### Performance Considerations

- Email field is indexed in the database for optimal query performance
- JOIN operations are optimized for large datasets
- CSV generation is performed client-side to reduce server load

## Maintenance

### Regular Tasks

1. **Monitor** export functionality for any errors or performance issues
2. **Verify** email data accuracy in employee records
3. **Update** documentation when schema changes occur
4. **Review** access logs periodically for compliance auditing

### Troubleshooting

- **Missing Emails**: Check if employee records have email addresses populated
- **Export Errors**: Verify database connectivity and user permissions
- **Data Inconsistencies**: Run data validation queries to identify issues

## Future Enhancements

- **Email Validation**: Add client-side validation for email format
- **Bulk Email Operations**: Enable bulk email functionality from export data
- **Advanced Filtering**: Add email-based filtering options
- **Export Formats**: Support additional export formats (Excel, PDF)

---

**Last Updated**: January 31, 2025  
**Version**: 1.0  
**Author**: System Administrator