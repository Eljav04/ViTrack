export interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  position: string;
  photo: string;
  scheduleId: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Schedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  workHours: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  checkInPhoto?: string;
  checkOutPhoto?: string;
  checkInLocation?: { lat: number; lng: number; address: string };
  checkOutLocation?: { lat: number; lng: number; address: string };
  status: 'on-time' | 'late' | 'early-leave' | 'absent';
  comment?: string;
  lateReason?: string;
  earlyLeaveReason?: string;
  qrApproved?: boolean;
  employeeComment?: string;
}

export const departments: Department[] = [
  { id: '1', name: 'Mühəndislik', description: 'Texnoloji inkişaf və proqram təminatı' },
  { id: '2', name: 'Marketinq', description: 'Reklam və satış təşviqi' },
  { id: '3', name: 'Satış', description: 'Müştəri əlaqələri və satış' },
  { id: '4', name: 'İnsan Resursları', description: 'Personalın idarə edilməsi' },
  { id: '5', name: 'Maliyyə', description: 'Mühasibat və maliyyə əməliyyatları' },
];

export const schedules: Schedule[] = [
  { id: '1', name: 'Standart 9-17', startTime: '09:00', endTime: '17:00', workHours: 8 },
  { id: '2', name: 'Erkən növbə', startTime: '07:00', endTime: '15:00', workHours: 8 },
  { id: '3', name: 'Gec növbə', startTime: '13:00', endTime: '21:00', workHours: 8 },
  { id: '4', name: 'Çevik', startTime: '08:00', endTime: '16:00', workHours: 8 },
];

export const employees: Employee[] = [
  {
    id: '1',
    name: 'Sara Cəfərova',
    email: 'sara.caferova@sirket.com',
    departmentId: '1',
    position: 'Baş Developer',
    photo: 'https://i.pravatar.cc/150?img=1',
    scheduleId: '1',
    active: true,
  },
  {
    id: '2',
    name: 'Mikayıl Əliyev',
    email: 'mikayil.aliyev@sirket.com',
    departmentId: '1',
    position: 'Frontend Developer',
    photo: 'https://i.pravatar.cc/150?img=12',
    scheduleId: '1',
    active: true,
  },
  {
    id: '3',
    name: 'Aynur Məmmədova',
    email: 'aynur.memmedova@sirket.com',
    departmentId: '2',
    position: 'Marketinq Meneceri',
    photo: 'https://i.pravatar.cc/150?img=5',
    scheduleId: '1',
    active: true,
  },
  {
    id: '4',
    name: 'Elvin Quliyev',
    email: 'elvin.quliyev@sirket.com',
    departmentId: '3',
    position: 'Satış Nümayəndəsi',
    photo: 'https://i.pravatar.cc/150?img=14',
    scheduleId: '2',
    active: true,
  },
  {
    id: '5',
    name: 'Leyla Həsənova',
    email: 'leyla.hesenova@sirket.com',
    departmentId: '4',
    position: 'İR Mütəxəssisi',
    photo: 'https://i.pravatar.cc/150?img=9',
    scheduleId: '1',
    active: true,
  },
  {
    id: '6',
    name: 'Rəşad Mustafayev',
    email: 'resad.mustafayev@sirket.com',
    departmentId: '1',
    position: 'DevOps Mühəndis',
    photo: 'https://i.pravatar.cc/150?img=13',
    scheduleId: '3',
    active: true,
  },
  {
    id: '7',
    name: 'Günel İsmayılova',
    email: 'gunel.ismayilova@sirket.com',
    departmentId: '5',
    position: 'Mühasib',
    photo: 'https://i.pravatar.cc/150?img=10',
    scheduleId: '1',
    active: true,
  },
  {
    id: '8',
    name: 'Kamran Həmzəyev',
    email: 'kamran.hemzeyev@sirket.com',
    departmentId: '3',
    position: 'Satış Meneceri',
    photo: 'https://i.pravatar.cc/150?img=15',
    scheduleId: '1',
    active: true,
  },
];

export const attendanceRecords: AttendanceRecord[] = [
  // Today's records
  {
    id: 'a1',
    employeeId: '1',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:55',
    checkInPhoto: 'https://i.pravatar.cc/150?img=1',
    checkInLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    status: 'on-time',
    qrApproved: true,
  },
  {
    id: 'a2',
    employeeId: '2',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:15',
    checkInPhoto: 'https://i.pravatar.cc/150?img=12',
    checkInLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    status: 'late',
    lateReason: 'Yol tıxacı',
    comment: 'Magistral yolda güclü tıxac',
    employeeComment: 'Gec qaldığım üçün üzr istəyirəm, yolda avtomobil qəzası olub.',
  },
  {
    id: 'a3',
    employeeId: '3',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:58',
    checkOut: '16:30',
    checkInPhoto: 'https://i.pravatar.cc/150?img=5',
    checkOutPhoto: 'https://i.pravatar.cc/150?img=5',
    checkInLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    checkOutLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    status: 'early-leave',
    earlyLeaveReason: 'Həkim görüşü',
    employeeComment: 'Əvvəlcədən təyin olunmuş həkim görüşü.',
  },
  {
    id: 'a4',
    employeeId: '4',
    date: new Date().toISOString().split('T')[0],
    checkIn: '06:58',
    checkInPhoto: 'https://i.pravatar.cc/150?img=14',
    checkInLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    status: 'on-time',
  },
  {
    id: 'a5',
    employeeId: '6',
    date: new Date().toISOString().split('T')[0],
    checkIn: '12:55',
    checkInPhoto: 'https://i.pravatar.cc/150?img=13',
    checkInLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    status: 'on-time',
  },
  {
    id: 'a6',
    employeeId: '7',
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:02',
    checkInPhoto: 'https://i.pravatar.cc/150?img=10',
    checkInLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    status: 'on-time',
  },
  // Yesterday's records
  {
    id: 'a7',
    employeeId: '1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '17:05',
    checkInPhoto: 'https://i.pravatar.cc/150?img=1',
    checkOutPhoto: 'https://i.pravatar.cc/150?img=1',
    checkInLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    checkOutLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    status: 'on-time',
  },
  {
    id: 'a8',
    employeeId: '2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    checkIn: '08:58',
    checkOut: '17:00',
    checkInPhoto: 'https://i.pravatar.cc/150?img=12',
    checkOutPhoto: 'https://i.pravatar.cc/150?img=12',
    checkInLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    checkOutLocation: { lat: 40.7128, lng: -74.0060, address: 'Nizami küç. 123, Bakı' },
    status: 'on-time',
  },
];

// Current user (employee view)
export const currentUser = employees[0];

// Helper to get department name
export const getDepartmentName = (departmentId: string): string => {
  return departments.find(d => d.id === departmentId)?.name || '';
};
