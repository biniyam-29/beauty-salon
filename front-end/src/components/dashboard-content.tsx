import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { getCurrentUser } from "../lib/auth"
import { Link } from "react-router-dom";

const UserPlusIcon = ({ className }: { className?: string }) => <span className={className}>👤+</span>
const CalendarIcon = ({ className }: { className?: string }) => <span className={className}>📅</span>
const ClockIcon = ({ className }: { className?: string }) => <span className={className}>🕐</span>
const UsersIcon = ({ className }: { className?: string }) => <span className={className}>👥</span>
const DocumentTextIcon = ({ className }: { className?: string }) => <span className={className}>📄</span>

// Mock data for demonstration
const todaysAppointments = [
  {
    id: "1",
    patientName: "Emma Wilson",
    time: "09:00 AM",
    type: "Initial Consultation",
    status: "confirmed",
  },
  {
    id: "2",
    patientName: "James Miller",
    time: "10:30 AM",
    type: "Follow-up",
    status: "confirmed",
  },
  {
    id: "3",
    patientName: "Sarah Davis",
    time: "02:00 PM",
    type: "Treatment",
    status: "pending",
  },
]

const followUpReminders = [
  {
    id: "1",
    patientName: "Michael Johnson",
    lastVisit: "2024-01-10",
    daysOverdue: 3,
  },
  {
    id: "2",
    patientName: "Lisa Anderson",
    lastVisit: "2024-01-08",
    daysOverdue: 5,
  },
]

const doctorPatients = [
  {
    id: "1",
    name: "Emma Wilson",
    time: "09:00 AM",
    condition: "Acne Treatment",
    priority: "high",
  },
  {
    id: "2",
    name: "James Miller",
    time: "10:30 AM",
    condition: "Skin Check",
    priority: "normal",
  },
]

export function DashboardContent() {
  const user = getCurrentUser()

  if (!user) return null

  const renderReceptionDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Reception Dashboard</h1>
        <Link to="/patients/register">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Register New Patient
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-teal-600" />
              Today's Appointments
            </CardTitle>
            <CardDescription>{todaysAppointments.length} appointments scheduled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-500">{appointment.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                  <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Follow-up Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-orange-600" />
              Follow-up Reminders
            </CardTitle>
            <CardDescription>Patients requiring follow-up contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {followUpReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{reminder.patientName}</p>
                  <p className="text-sm text-gray-500">Last visit: {reminder.lastVisit}</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">{reminder.daysOverdue} days overdue</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderDoctorDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Doctor Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="h-5 w-5 mr-2 text-teal-600" />
              Today's Patients
            </CardTitle>
            <CardDescription>{doctorPatients.length} patients scheduled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {doctorPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{patient.time}</p>
                  <Badge variant={patient.priority === "high" ? "destructive" : "default"}>{patient.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used tools and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Start New Consultation
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <UsersIcon className="h-4 w-4 mr-2" />
              View Patient History
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderDefaultDashboard = () => (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace("-", " ")} Dashboard
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Skin Clinic Management System</CardTitle>
          <CardDescription>Your role-specific dashboard is being prepared.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )

  switch (user.role) {
    case "reception":
      return renderReceptionDashboard()
    case "doctor":
      return renderDoctorDashboard()
    default:
      return renderDefaultDashboard()
  }
}
