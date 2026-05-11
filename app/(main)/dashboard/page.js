"use client";

import React from "react";
import { USER_ROLE } from "@/config/data";
import StudentDashboard from "./student-dashboard";
import MentorDashboard from "./mentor-dashboard";
import OrgDashboard from "./org-dashboard";

export default function DashboardPage() {
  switch (USER_ROLE) {
    case "student":
      return <StudentDashboard />;
    case "mentors":
      return <MentorDashboard />;
    case "organization":
    default:
      return <OrgDashboard />;
  }
}
