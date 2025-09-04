  ##Project Overview
TaskFlow is an enterprise-grade task management system that demonstrates modern full-stack development practices. 
The application features a sophisticated user management system where administrators can create users, manage departments, and oversee task completion across the organization.


    🛠 Tech Stack
    Frontend

Next.js 14 - React framework with App Router
TypeScript - Type-safe JavaScript
Tailwind CSS - Utility-first CSS framework
shadcn/ui - Re-usable component library
Lucide React - Icon library

Backend

Node.js - JavaScript runtime
Express.js - Web framework
TypeScript - Type-safe server development
TypeORM - Object-Relational Mapping
PostgreSQL/MySQL - Database
Nodemailer - Email service
JWT - Authentication tokens
bcrypt - Password hashing


    📖 What I Learned

How to build a full-stack project using Next.js + Express.js.

The importance of reusable components like Sidebar.tsx, Header.tsx, and UI elements built with shadcn/ui.

Managing state in React using useState and useEffect.

Implementing login flows, password resets, and OTP verification.

Understanding role-based access control (Admin vs User).

How to connect frontend & backend APIs securely.

     🔮 Future Improvements

Add task categories or priorities.

Implement notifications for task deadlines.

Improve UI/UX with animations.

Add analytics dashboard for Admin.


    🏗 Architecture & Workflow
User Management Flow

Admin Creates User

Admin enters user email, role, and department
System generates temporary password
Welcome email sent to user with credentials


     First Login Process

User logs in with temporary credentials
System detects first login and triggers password reset
OTP sent to user's email for verification


    Password Reset Flow

User enters OTP received via email
System verifies OTP and allows new password creation
User can now access their dashboard with new credentials


     Ongoing Operations

Users perform CRUD operations on their tasks
Admins manage users, departments, and view all tasks
Real-time updates across the application



    🧩 Component Architecture
Reusable Components
The application demonstrates component reusability through a well-structured component library:
Core Layout Components

Sidebar.tsx - Navigation sidebar used across all dashboards
Header.tsx - Top navigation header with user actions
DashboardLayout.tsx - Main layout wrapper combining sidebar and header

    UI Components (shadcn/ui based)

Button - Customizable button component with variants
Input - Form input fields with validation states
Dialog - Modal dialogs for forms and confirmations
DataTable - Reusable table component for displaying data
Pagination - Navigation for paginated content
StatusBadge - Color-coded status indicators
SearchFilters - Combined search and filter controls

    Feature Components

PageHeader - Consistent page titles with action buttons
TaskCard - Individual task display component
UserManagementDialog - User creation and editing forms
DepartmentManagementDialog - Department management forms

    Component Reusability Benefits
    The reusable component approach provides:

Consistency - Uniform UI/UX across the application
Maintainability - Changes in one component reflect everywhere
Development Speed - Faster development with pre-built components
Type Safety - TypeScript interfaces ensure proper prop usage

     🔐 Authentication System
     Security Features

JWT Token Authentication - Secure token-based authentication
Password Hashing - bcrypt for secure password storage
OTP Verification - Email-based one-time password verification
Role-Based Authorization - Different access levels for admins and users
First Login Security - Forced password change on initial login

Authentication Flow
User Creation → Email Notification → First Login → OTP Verification → Password Setup → Dashboard Access
👥 User Roles & Permissions
Administrator

Create, update, and delete users
Manage departments and assignments
View all tasks across the organization
Access user management dashboard
Cannot modify user tasks directly

    Regular User

Create, read, update, and delete own tasks
View personal task dashboard
Update profile information
Cannot access administrative functions

    🏢 Department Management
The application includes a comprehensive department management system:

Department Creation - Admins can create organizational departments
User Assignment - Users can be assigned to specific departments
Department Filtering - Filter users and tasks by department
Department Statistics - Overview of department utilization

     📊 Features
     Task Management

Create tasks with title, description, and priority
Mark tasks as pending or completed
Real-time task status updates
Task filtering and search functionality

    User Management

User creation with email notifications
Role assignment (Admin/User)
Department assignment
User status management (Active/Inactive)

Dashboard Analytics

Task completion statistics
User activity overview
Department-wise task distribution
System usage metrics

    🔮 Future Improvements

Add task categories 

Implement notifications for task deadlines.

Improve UI/UX with animations.

Add analytics dashboard for Admin.

     🚀 Getting Started
    Prerequisites

Node.js (v18 or higher)
npm or yarn
PostgreSQL or MySQL database
Email service (Gmail, SendGrid, etc.)


    Installation

  1.Clone the repository
     git clone https://github.com/usandrine/TODO-WITH-OTP.git
     cd TODO-WITH-OTP
 2. Install Dependencies
     # Frontend
  cd todo-app-new
  npm install

    # Backend
cd todo-app-backend
npm install

    3.Environment Setup

    # Backend .env
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

    # Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api

    #Run the Application
 # Backend (Terminal 1)
cd todo-app-backend
npm start

# Frontend (Terminal 2)
cd todo-app-new
npm run dev

  
