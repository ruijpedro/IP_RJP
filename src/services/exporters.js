import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { durationHHMM, formatMonthTitle } from '../utils/date.js';

function download(name, text, type = 'text/plain;charset=utf-8') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
}

export function exportCSV({ month, trips, guards, activities }) {
  const rows = [
    ['Tipo', 'Data', 'Hora início/saída', 'Hora fim/chegada', 'Origem/Local', 'Destino', 'Viatura', 'Detalhe', 'Observações'],
    ...trips.map(t => ['Deslocação', t.date, t.out, t.in, t.from, t.to, t.vehiclePlate, t.activity || '', t.notes || '']),
    ...guards.map(g => ['Prevenção', g.date, '', '', '', '', '', g.kind, g.notes || '']),
    ...activities.map(a => ['Atividade', a.date, a.start, a.end, a.place, '', '', a.type, a.notes || ''])
  ];
  const csv = rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(';')).join('\n');
  download(`IP_RJP_${month}.csv`, csv, 'text/csv;charset=utf-8');
}

export function exportXLSX({ month, trips, guards, activities }) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trips), 'Deslocações');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(guards), 'Prevenções');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(activities), 'Atividades');
  XLSX.writeFile(wb, `IP_RJP_${month}.xlsx`);
}

export function exportPDF({ month, profile, trips, guards, activities }) {
  const doc = new jsPDF();
  let y = 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('IP_RJP', 14, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Deslocações • Prevenções BT/CC', 14, y);
  y += 8;
  doc.text(`Mês: ${formatMonthTitle(month)}`, 14, y);
  y += 6;
  doc.text(`Autor: ${profile.author}`, 14, y);
  y += 6;
  doc.text(profile.organization, 14, y);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`Resumo — Deslocações: ${trips.length} | BT: ${guards.filter(g => g.kind === 'BT').length} | CC: ${guards.filter(g => g.kind === 'CC').length} | Atividades: ${activities.length}`, 14, y);
  y += 10;

  const checkPage = () => { if (y > 280) { doc.addPage(); y = 16; } };
  const section = (title) => { checkPage(); doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(title, 14, y); y += 7; doc.setFont('helvetica', 'normal'); doc.setFontSize(9); };

  section('Deslocações');
  trips.forEach(t => { checkPage(); doc.text(`${t.date} | ${t.from} → ${t.to} | ${t.vehiclePlate} | ${t.out}-${t.in} | ${durationHHMM(t.out, t.in)} | ${t.notes || ''}`, 14, y); y += 6; });
  y += 4;
  section('Prevenções');
  guards.forEach(g => { checkPage(); doc.text(`${g.date} | ${g.kind} | ${g.notes || ''}`, 14, y); y += 6; });
  y += 4;
  section('Atividades');
  activities.forEach(a => { checkPage(); doc.text(`${a.date} | ${a.start}-${a.end} | ${a.type} | ${a.place} | ${a.notes || ''}`, 14, y); y += 6; });
  doc.save(`IP_RJP_${month}.pdf`);
}
