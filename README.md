# 🍔 FoodBuddy

FoodBuddy is a comprehensive, full-stack university mess and dining hall management application. Built with modern web technologies, it bridges the gap between students, mess managers, and university wardens to ensure a smooth, transparent, and efficient dining experience.

## ✨ Features

### For Students 🎓
*   **Live Menu & Nutritional Charts**: View the daily and weekly menus. Click on any food item to see a beautiful Pie Chart breakdown of its macros (Protein, Carbs, Fats, Fiber) and total calories.
*   **Dietary Preferences**: Set dietary restrictions and allergies in your profile.
*   **Live Crowd Indicator**: Check real-time dining hall capacity before you walk over.
*   **Guest Meal Bookings**: Easily book a physical meal pass for visiting friends or family.
*   **Lost & Found Portal**: Report lost items or log items you've found in the mess.

### For Managers 👨‍🍳
*   **Menu Management**: Easily update the weekly menu, tag items as Veg/Non-Veg, and input precise nutritional data.
*   **Food Waste Tracking**: Log daily food waste in kilograms to track and optimize kitchen efficiency.
*   **Operations Dashboards**: Centralized hub to manage Guest Bookings and resolve Lost & Found reports.

### Security First 🔒
*   **Production Hardened**: Secured with Next.js Edge Middleware for strict route protection.
*   **Row Level Security (RLS)**: Database completely locked down at the SQL level to prevent unauthorized data access.

---

## 🚀 Tech Stack
*   **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
*   **UI Components**: Lucide Icons, Recharts (for data visualization)
*   **Backend/Database**: Supabase (PostgreSQL), Supabase Auth
*   **Deployment**: Vercel (Recommended)

---

## 🛠️ Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/suryanshforcommunity-oss/FoodBuddy.git
cd FoodBuddy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root of the project and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup (Crucial!)
To ensure all the addon features (Guest Bookings, Food Waste, Lost & Found, etc.) work correctly, you **must** apply the schema updates to your Supabase project.

1. Open your Supabase Dashboard.
2. Navigate to the **SQL Editor**.
3. Copy the entire contents of the `db_updates.sql` file provided in this repository.
4. Run the script.

*Note: This script also includes strict Row Level Security (RLS) policies. Test thoroughly after applying.*

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/suryanshforcommunity-oss/FoodBuddy/issues).
