export interface DoctorWorkingHours {
  day: string;
  start: string;
  end: string;
}

export interface Doctor {
  doctor_id: string;
  email: string;
  name: string;
  specialisation: string;
  phone: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}
