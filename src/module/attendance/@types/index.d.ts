export type AttendanceRecordView = {
  id: string
  employeeId: string
  date: Date
  checkIn: Date | null
  checkOut: Date | null
  status: string
  workedHours: number | null
}
