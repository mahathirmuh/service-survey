# MSSQL Database Setup for Survey Application

This document provides instructions for setting up the survey application database schema in Microsoft SQL Server (MSSQL) as an alternative to the current Supabase PostgreSQL setup.

## Overview

The MSSQL schema (`mssql-schema.sql`) is a complete equivalent of the current Supabase database structure, including:

- **employees** table for ID badge validation
- **survey_responses** table for storing survey data
- Automatic timestamp triggers
- Sample data
- Views for reporting
- Stored procedures for common operations

## Database Schema Structure

### Tables

#### 1. employees
- `id` (UNIQUEIDENTIFIER, Primary Key)
- `id_badge_number` (NVARCHAR(50), Unique)
- `name` (NVARCHAR(255))
- `department` (NVARCHAR(255))
- `created_at` (DATETIME2)
- `updated_at` (DATETIME2)

#### 2. survey_responses
- `id` (UNIQUEIDENTIFIER, Primary Key)
- `name` (NVARCHAR(255))
- `id_badge_number` (NVARCHAR(50))
- `department` (NVARCHAR(255))
- Section identifiers: `dept1_section`, `dept2_section`
- Question responses (1-5 scale) for all departments and sections
- Feedback text fields
- `created_at` (DATETIME2)
- `updated_at` (DATETIME2)

### Department Sections Supported

1. **General Departments** (dept1/dept2 with 5 sections each)
2. **Human Resources**: Document Control, IT Support
3. **Environmental**: Team 1, Team 2
4. **Finance**: Finance, Contract, Cost Control
5. **External Affair**: Community Relations, Asset Protection, Government Relations
6. **OHS**: Training
7. **SCM**: Inventory, Procurement (legacy support)

## Setup Instructions

### Prerequisites
- Microsoft SQL Server 2016 or later
- SQL Server Management Studio (SSMS) or Azure Data Studio
- Appropriate database permissions

### Installation Steps

1. **Create Database** (if needed):
   ```sql
   CREATE DATABASE SurveyApp;
   USE SurveyApp;
   ```

2. **Run Schema Script**:
   - Open `mssql-schema.sql` in SSMS or your preferred SQL client
   - Execute the entire script
   - Verify successful creation with the printed messages

3. **Verify Installation**:
   ```sql
   -- Check tables
   SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
   
   -- Check sample data
   SELECT COUNT(*) FROM employees;
   SELECT COUNT(*) FROM survey_responses;
   ```

## Key Differences from PostgreSQL/Supabase

| Feature | PostgreSQL/Supabase | MSSQL |
|---------|-------------------|-------|
| UUID Generation | `gen_random_uuid()` | `NEWID()` |
| Text Fields | `TEXT` | `NTEXT`/`NVARCHAR` |
| Timestamps | `TIMESTAMP WITH TIME ZONE` | `DATETIME2` |
| Current Time | `now()` | `GETDATE()` |
| Auto-update Triggers | Function-based | Direct trigger |
| Row Level Security | Built-in RLS | Custom permissions |

## Views and Stored Procedures

### Views
- `vw_survey_summary`: Combined employee and survey data
- `vw_response_statistics`: Aggregated response statistics by department

### Stored Procedures
- `sp_GetEmployeeByBadge`: Retrieve employee by badge number
- `sp_InsertSurveyResponse`: Insert new survey response

## Application Integration

To integrate with your existing application:

1. **Update Connection String**: Replace Supabase connection with MSSQL connection string
2. **Modify Data Access Layer**: Update queries to use MSSQL syntax
3. **Handle UUID Differences**: Ensure proper UUID handling in your application
4. **Update Authentication**: Replace Supabase auth with your preferred authentication method

### Example Connection String
```
Server=your-server;Database=SurveyApp;Trusted_Connection=true;
```

Or with SQL authentication:
```
Server=your-server;Database=SurveyApp;User Id=your-username;Password=your-password;
```

## Security Considerations

1. **User Permissions**: Create specific database users for your application
2. **Connection Security**: Use encrypted connections (SSL/TLS)
3. **Input Validation**: Implement proper SQL injection prevention
4. **Backup Strategy**: Set up regular database backups

## Sample Queries

### Insert Employee
```sql
INSERT INTO employees (id_badge_number, name, department) 
VALUES ('MTI011', 'New Employee', 'IT Department');
```

### Insert Survey Response
```sql
EXEC sp_InsertSurveyResponse 
    @Name = 'John Doe',
    @IdBadgeNumber = 'MTI001',
    @Department = 'Environmental Department',
    @Dept1Section = 'Environmental Management',
    @Dept2Section = 'Audit Team';
```

### Query Survey Statistics
```sql
SELECT * FROM vw_response_statistics;
```

## Maintenance

### Regular Tasks
- Monitor database size and performance
- Update statistics regularly
- Backup database according to your retention policy
- Review and optimize indexes as needed

### Troubleshooting
- Check SQL Server error logs for issues
- Monitor connection pool usage
- Verify trigger functionality after schema changes

## Migration from Supabase

If migrating existing data from Supabase:

1. Export data from Supabase using their export tools
2. Transform UUID formats if necessary
3. Adjust timestamp formats
4. Import data using BULK INSERT or SQL Server Import/Export Wizard
5. Verify data integrity after migration

## Support

For issues related to:
- **Database Schema**: Check the schema file and this documentation
- **SQL Server Setup**: Consult Microsoft SQL Server documentation
- **Application Integration**: Review your application's data access layer

---

**Note**: This schema maintains compatibility with your existing survey application structure while providing the benefits of a local MSSQL database setup.