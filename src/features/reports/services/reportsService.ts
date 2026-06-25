import { supabase } from '@/infrastructure/supabase/client'

export interface ReportData {
  appointments: { id: string; status: string; appointment_at: string; doctor_name: string | null; appointment_type: string | null }[]
  exams: { id: string; exam_date: string; exam_name: string; result: string | null }[]
  vaccines: { id: string; vaccine_name: string; status: string }[]
  symptoms: { id: string; log_date: string; nausea_level: number | null; pain_description: string | null }[]
  kicks: { id: string; count_date: string; kick_count: number }[]
  diary: { id: string; entry_date: string; mood: string | null; energy_level: number | null }[]
  photos: { id: string; category: string; photo_date: string }[]
  layette: { id: string; status: string }[]
  hospitalBag: { id: string; person: string; status: string }[]
  timeline: { id: string; milestone_type: string; milestone_date: string; title: string }[]
}

export async function fetchReportData(
  tenantId: string,
  pregnancyId: string
): Promise<ReportData> {
  const [
    apptRes, examRes, vaccRes, sympRes, kickRes,
    diaryRes, photoRes, layRes, bagRes, timeRes,
  ] = await Promise.all([
    supabase.from('appointments').select('id,status,appointment_at,doctor_name,appointment_type').eq('pregnancy_id', pregnancyId).order('appointment_at'),
    supabase.from('exams').select('id,exam_date,exam_name,result').eq('pregnancy_id', pregnancyId).order('exam_date'),
    supabase.from('vaccines').select('id,vaccine_name,status').eq('pregnancy_id', pregnancyId),
    supabase.from('symptoms_log').select('id,log_date,nausea_level,pain_description').eq('pregnancy_id', pregnancyId).order('log_date'),
    supabase.from('kick_counts').select('id,count_date,kick_count').eq('pregnancy_id', pregnancyId).order('count_date'),
    supabase.from('diary_entries').select('id,entry_date,mood,energy_level').eq('pregnancy_id', pregnancyId).order('entry_date'),
    supabase.from('photos').select('id,category,photo_date').eq('pregnancy_id', pregnancyId).order('photo_date'),
    supabase.from('layette_user_items').select('id,status').eq('pregnancy_id', pregnancyId),
    supabase.from('hospital_bag_items').select('id,person,status').eq('pregnancy_id', pregnancyId),
    supabase.from('timeline_milestones').select('id,milestone_type,milestone_date,title').eq('pregnancy_id', pregnancyId).order('milestone_date'),
  ])

  return {
    appointments: (apptRes.data ?? []) as ReportData['appointments'],
    exams: (examRes.data ?? []) as ReportData['exams'],
    vaccines: (vaccRes.data ?? []) as ReportData['vaccines'],
    symptoms: (sympRes.data ?? []) as ReportData['symptoms'],
    kicks: (kickRes.data ?? []) as ReportData['kicks'],
    diary: (diaryRes.data ?? []) as ReportData['diary'],
    photos: (photoRes.data ?? []) as ReportData['photos'],
    layette: (layRes.data ?? []) as ReportData['layette'],
    hospitalBag: (bagRes.data ?? []) as ReportData['hospitalBag'],
    timeline: (timeRes.data ?? []) as ReportData['timeline'],
  }
}

export function generateCSV(report: ReportData, pregnancyInfo: { due_date: string; lmp_date: string | null }): string {
  const lines: string[] = []
  const sep = ','
  const row = (...cols: (string | number | null | undefined)[]) =>
    lines.push(cols.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(sep))

  lines.push("RESUMO DA GESTAÇÃO — Baby's Plan")
  lines.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`)
  lines.push('')

  // Appointments
  lines.push('CONSULTAS')
  row('Data', 'Tipo', 'Médico', 'Status')
  report.appointments.forEach(a =>
    row(a.appointment_at?.slice(0, 10), a.appointment_type, a.doctor_name, a.status)
  )
  lines.push('')

  // Exams
  lines.push('EXAMES')
  row('Data', 'Exame', 'Resultado')
  report.exams.forEach(e =>
    row(e.exam_date, e.exam_name, e.result ?? 'Pendente')
  )
  lines.push('')

  // Vaccines
  lines.push('VACINAS')
  row('Vacina', 'Status')
  report.vaccines.forEach(v => row(v.vaccine_name, v.status))
  lines.push('')

  // Symptoms
  lines.push('SINTOMAS')
  row('Data', 'Náusea (1-5)', 'Descrição dor')
  report.symptoms.forEach(s => row(s.log_date, s.nausea_level, s.pain_description))
  lines.push('')

  // Kicks
  lines.push('CONTADOR DE CHUTES')
  row('Data', 'Chutes')
  report.kicks.forEach(k => row(k.count_date, k.kick_count))
  lines.push('')

  // Diary
  lines.push('DIÁRIO')
  row('Data', 'Humor', 'Energia')
  report.diary.forEach(d => row(d.entry_date, d.mood, d.energy_level))
  lines.push('')

  // Timeline
  lines.push('MARCOS DA GESTAÇÃO')
  row('Data', 'Tipo', 'Título')
  report.timeline.forEach(t => row(t.milestone_date, t.milestone_type, t.title))

  return lines.join('\n')
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
