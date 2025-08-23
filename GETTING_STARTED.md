# Getting Started with SPAN SportsHub

## Current Issue: Empty Database

Your site is currently showing "No data available" messages because the Firestore database is empty. This is normal for a new installation.

## Solution: Add Sample Data

### Option 1: Use the Admin Panel (Recommended)

1. **Login to Admin Panel**
   - Go to `/login` on your site
   - Use your admin credentials
   - Navigate to the Admin Dashboard

2. **Initialize Sample Data**
   - Click the green "Initialize Sample Data" button in the sidebar
   - This will automatically add:
     - 10 sample schools (District 2 schools)
     - 3 sample articles
   - Confirm the action when prompted

3. **Verify Data**
   - Refresh your main site pages
   - You should now see schools, articles, and other content

### Option 2: Add Data Manually

1. **Add Schools**
   - Use the "Add School" tab in admin panel
   - Add school name, location, and optional logo
   - Repeat for all schools you want to include

2. **Add Articles**
   - Use the "Add Article" tab in admin panel
   - Add title, content, excerpt, and category
   - Set the date as needed

3. **Add Schedules and Games**
   - Use the "Add Schedule" and "Add Game" tabs
   - Link games to specific schools and sports

## What Gets Added with Sample Data

### Schools
- Abington Heights High School (Clarks Summit, PA)
- Delaware Valley High School (Milford, PA)
- North Pocono High School (Covington Township, PA)
- Scranton High School (Scranton, PA)
- Scranton Preparatory School (Scranton, PA)
- Valley View High School (Archbald, PA)
- Wallenpaupack Area High School (Hawley, PA)
- Dunmore High School (Dunmore, PA)
- Honesdale High School (Honesdale, PA)
- Lakeland High School (Jermyn, PA)

### Articles
- Welcome to SPAN SportsHub
- Fall 2025 Season Preview
- District 2 Football Divisions Announced

## After Adding Data

Once you have data in your database:
- ✅ Users can view schools, articles, and schedules
- ✅ Live scores and game updates will work
- ✅ All pages will display content instead of "No data available"
- ✅ The site will function as intended

## Troubleshooting

- **Firestore Rules**: Already fixed and deployed - users can read data without authentication
- **Empty Collections**: This is the current issue - collections need to be populated
- **Admin Access**: Make sure you have admin credentials to access the admin panel

## Next Steps

1. Add the sample data using the admin panel
2. Customize the data with your actual school information
3. Add real schedules and game data
4. Update articles with current news and information

Your site will then be fully functional with real content! 