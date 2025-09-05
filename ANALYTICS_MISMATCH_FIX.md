# Survey Analytics Mismatch Fix

## Problem Summary

**Issue**: Submission Status shows 2 Managerial employees submitted surveys, but Survey Analytics only counts 1 response.

**Root Cause**: Ardian's survey response (MTI240266) is missing the `employee_id` field, which causes the Analytics query's `INNER JOIN` to exclude his record.

## Current Status

### Submission Status (Direct count from survey_responses)
- **Total Managerial Submissions**: 2
- ✅ Mahathir Muhammad (MTI240369) - Linked to employee_id
- ❌ Ardian (MTI240266) - Missing employee_id (NULL)

### Survey Analytics (INNER JOIN with employees table)
- **Total Managerial Records**: 1
- ✅ Mahathir Muhammad (MTI240369) - Shows in analytics
- ❌ Ardian (MTI240266) - Excluded due to missing employee_id

## Solution

### Step 1: Execute SQL Fix

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run the SQL script: `fix-ardian-employee-id.sql`

```sql
-- Fix Analytics Mismatch: Add missing employee_id to Ardian's survey response
UPDATE public.survey_responses 
SET employee_id = '3670c920-e378-4680-9020-d18dd0241aea'
WHERE id = 'c6281843-8316-4154-8eb5-6f97c79ea435'
AND id_badge_number = 'MTI240266';
```

### Step 2: Verify the Fix

1. Run the verification script:
   ```bash
   node verify-analytics-fix.js
   ```

2. Expected result:
   - Submission Status Count: 2
   - Survey Analytics Count: 2
   - ✅ SUCCESS: Mismatch resolved!

### Step 3: Refresh Analytics Page

1. Go to **Survey Analytics** page
2. Refresh the page (Ctrl+F5)
3. Verify that **Managerial Results** now shows **2** responses

## Technical Details

### Why This Happened

The Survey Analytics uses this query structure:
```sql
SELECT * FROM survey_responses sr
INNER JOIN employees e ON sr.employee_id = e.id
WHERE e.level = 'Managerial'
```

The `INNER JOIN` requires both tables to have matching records. Since Ardian's `employee_id` was NULL, the join failed and excluded his record.

### Employee Details
- **Ardian's Employee ID**: `3670c920-e378-4680-9020-d18dd0241aea`
- **Survey Response ID**: `c6281843-8316-4154-8eb5-6f97c79ea435`
- **Badge Number**: `MTI240266`
- **Level**: Managerial
- **Department**: External Affair

## Files Created

1. **fix-ardian-employee-id.sql** - SQL script to fix the issue
2. **verify-analytics-fix.js** - Verification script to check the fix
3. **fix-analytics-mismatch.js** - Automated fix attempt (RLS prevented direct update)
4. **ANALYTICS_MISMATCH_FIX.md** - This documentation

## Prevention

To prevent this issue in the future:

1. **Database Constraint**: Add a NOT NULL constraint to `employee_id` in `survey_responses`
2. **Application Logic**: Ensure the survey form always populates `employee_id` during submission
3. **Data Validation**: Add checks to verify employee linkage before saving responses

## Testing

After applying the fix:

1. ✅ Submission Status should show: 2 Managerial submissions
2. ✅ Survey Analytics should show: 2 Managerial responses
3. ✅ Both Ardian and Mahathir Muhammad should appear in analytics
4. ✅ No mismatch between the two counts

---

**Status**: Ready for manual SQL execution
**Next Action**: Run the SQL script in Supabase SQL Editor