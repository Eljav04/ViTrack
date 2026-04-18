# ViTrack Frontend

ViTrack is a modern employee attendance tracking system designed to simplify and replace traditional time-tracking hardware. Employees can easily check in and check out using their mobile devices by capturing a live photo and sharing their location. Managers can monitor attendance, analyze behavior, and access statistics in real time.

The system significantly improves operational efficiency and reduces manual tracking efforts by up to 85%.

---

## Backend Repository

Frontend works together with the backend API:

👉 [https://github.com/Eljav04/ViTrackAPI](https://github.com/Eljav04/ViTrackAPI)

---

## Note

Due to confidentiality of real employee data, all screenshots below are manually created examples.

The system itself is already in production and actively used by a real company.

---

## Admin Panel

### Dashboard

![Dashboard](./src/assets/forREADME/admin/admin_dashboard.png)

Displays overall daily status: who arrived, who is late, absent, or on rest. Also shows quick statistics and department-level insights.

---

### Statistics

![Statistics](./src/assets/forREADME/admin/admin_statistics.png)

Allows viewing employee statistics for any selected period.

---

### Attendance & Details

![Attendance](./src/assets/forREADME/admin/admin_attendance.png)

Main table with backend-powered pagination and filtering.
Provides a full overview at a glance:

* arrival / leave times
* late / on-time status
* overtime / undertime
* photo presence
* location tracking

![Attendance Details](./src/assets/forREADME/admin/admin_attendance_details.png)

Detailed view of a specific record:

* exact timestamps
* map location
* employee photo
* comments and notes

---

### Users Management

![Users](./src/assets/forREADME/admin/admin_users.png)

![Add User](./src/assets/forREADME/admin/admin_users_add.png) ![Edit User](./src/assets/forREADME/admin/admin_users_edit.png)

Admins can create, edit, and manage employees.

---

### Departments

![Departments](./src/assets/forREADME/admin/admin_departments.png)

Manage company departments.

---

### Work Schedules

![Work Schedules](./src/assets/forREADME/admin/admin_workSchedules.png)

Configure working hours and schedules.

---

## Employee Panel

### Main Screen

![Main](./src/assets/forREADME/employee/employee_main.png)

Employee can choose to check in, check out, or mark a rest day.

---

### Check-in Process

![Step1](./src/assets/forREADME/employee/employee_checkIn%20\(1\).png)
![Step2](./src/assets/forREADME/employee/employee_checkIn%20\(2\).png)
![Step3](./src/assets/forREADME/employee/employee_checkIn%20\(3\).png)
![Step4](./src/assets/forREADME/employee/employee_checkIn%20\(4\).png)
![Step5](./src/assets/forREADME/employee/employee_checkIn%20\(5\).png)

Process:

* choose action (arrival / rest)
* confirm location
* take a live photo (uploading is not allowed to prevent fraud)
* optionally add a comment (e.g., late reason)

---

### History

![History](./src/assets/forREADME/employee/employee_history.png)

Employees can view their attendance history.

---

### Statistics

![Statistics](./src/assets/forREADME/employee/employee_statistcs.png)

Basic statistics similar to admin view.

---

### Profile

![Profile](./src/assets/forREADME/employee/employee_profile.png)

Displays personal info and current month stats. Includes logout option.

---

## Architecture Overview

The frontend is built using React with a clean and scalable structure.

### Main Stack

* React (TypeScript)
* State management (custom store)
* Modular component architecture
* API service layer abstraction

---

## Project Structure

```
src/
 ├── assets/        # images and README resources
 ├── components/    # reusable UI components
 │    ├── admin/
 │    ├── employee/
 │    ├── ui/
 ├── pages/         # route-level pages
 ├── services/      # API calls
 ├── store/         # state management
 ├── lib/           # helpers and utilities
 ├── styles/        # global styles
 ├── data/          # static/mock data
 ├── App.tsx
 ├── main.tsx
```

---

## Additional Notes

* All UI/UX design, frontend, backend, and deployment were fully developed and managed by me.
* The system is designed to scale and replace traditional attendance hardware solutions.
* Backend-driven pagination and filtering ensure performance even with large datasets.
