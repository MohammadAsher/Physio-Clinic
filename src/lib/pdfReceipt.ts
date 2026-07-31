import jsPDF from 'jspdf';

interface ReceiptData {
  clinicName: string;
  clinicAddress: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  amount: number;
  token: string;
  appointmentId: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export function generateAppointmentReceipt(data: ReceiptData): Blob {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 20;

  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setFontSize(14);
  doc.setTextColor(31, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(data.clinicName || 'Body Experts Clinic', 20, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 110, 120);
  doc.text(data.clinicAddress || '123 Wellness Street, Health District', 20, 30);
  doc.text('Phone: +1 (555) 123-4567 | Email: info@bodyexperts.com', 20, 36);

  y = 80;

  doc.setFontSize(24);
  doc.setTextColor(220, 20, 60);
  doc.setFont('helvetica', 'bold');
  doc.text('APPOINTMENT RECEIPT', pageWidth / 2, y, { align: 'center' });

  y += 15;

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 160);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt ID: ${data.appointmentId}`, pageWidth / 2, y, { align: 'center' });

  y += 10;
  doc.setDrawColor(220, 20, 60);
  doc.setLineWidth(0.5);
  doc.line(40, y, pageWidth - 40, y);

  y += 15;

  doc.setFontSize(11);
  doc.setTextColor(200, 200, 210);
  doc.setFont('helvetica', 'normal');

  const leftCol = 30;
  const rightCol = 120;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Patient Name', leftCol, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text(data.patientName, rightCol, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Phone Number', leftCol, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text(data.patientPhone, rightCol, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Doctor', leftCol, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text(data.doctorName, rightCol, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Specialty', leftCol, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text(data.doctorSpecialty || 'N/A', rightCol, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Appointment Date', leftCol, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text(data.appointmentDate, rightCol, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Time Slot', leftCol, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text(data.appointmentTime, rightCol, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Token Number', leftCol, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text(data.token, rightCol, y);

  y += 15;
  doc.setDrawColor(40, 40, 50);
  doc.setLineWidth(0.3);
  doc.line(30, y, pageWidth - 30, y);

  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Payment Details', leftCol, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text('Payment Method', leftCol, y);
  doc.setTextColor(150, 150, 160);
  doc.text('Cash / Bank Transfer', 100, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text('Amount Paid', leftCol, y);
  doc.setTextColor(220, 20, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(`PKR ${data.amount.toLocaleString()}.00`, 100, y);

  y += 15;
  doc.setDrawColor(40, 40, 50);
  doc.setLineWidth(0.3);
  doc.line(30, y, pageWidth - 30, y);

  y += 15;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Verification', leftCol, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 210);
  doc.text('Status', leftCol, y);
  const statusColor = data.status === 'confirmed' ? [34, 197, 94] : [250, 204, 21];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(data.status === 'confirmed' ? 'VERIFIED ✓' : 'PENDING', 100, y);

  if (data.status === 'confirmed') {
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 210);
    doc.text('Verified By', leftCol, y);
    doc.setTextColor(150, 150, 160);
    doc.text(data.verifiedBy || 'Admin', 100, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 210);
    doc.text('Verified At', leftCol, y);
    doc.setTextColor(150, 150, 160);
    doc.text(data.verifiedAt || new Date().toLocaleDateString(), 100, y);

    y += 15;
    doc.setDrawColor(220, 20, 60);
    doc.setLineWidth(0.5);
    doc.line(30, y, pageWidth - 30, y);

    y += 15;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 20, 60);
    doc.setFontSize(14);
    doc.text('This appointment has been officially confirmed.', pageWidth / 2, y, { align: 'center' });

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 160);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing Body Experts.', pageWidth / 2, y, { align: 'center' });

    const verificationY = y + 15;
    const verificationX = pageWidth / 2 - 30;

    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(1);
    doc.setTextColor(100, 110, 120);
    doc.setFontSize(10);
    doc.text('Authorized Signature', verificationX - 10, verificationY + 35, { align: 'center' });

    doc.setDrawColor(100, 110, 120);
    doc.setLineWidth(0.5);
    doc.line(verificationX - 20, verificationY + 30, verificationX + 50, verificationY + 30);
  }

  y = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Body Experts Clinic • Confidential Document', pageWidth / 2, y, { align: 'center' });

  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

export function downloadAppointmentReceipt(data: ReceiptData) {
  const blob = generateAppointmentReceipt(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `appointment-receipt-${data.appointmentId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface TempSlipData {
  appointmentToken: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  amount: number;
  transactionId?: string;
}

export function generateTempBookingSlip(data: TempSlipData): Blob {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ──────────────────────────────
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Body Experts Clinic', 20, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 110, 120);
  doc.text('123 Wellness Street, Health District', 20, 30);
  doc.text('Phone: +1 (555) 123-4567 | Email: info@bodyexperts.com', 20, 36);

  let y = 80;

  // ── Title ───────────────────────────────
  doc.setFontSize(26);
  doc.setTextColor(250, 204, 21);
  doc.setFont('helvetica', 'bold');
  doc.text('TEMPORARY BOOKING SLIP', pageWidth / 2, y, { align: 'center' });

  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(data.appointmentToken, pageWidth / 2, y, { align: 'center' });

  y += 12;
  doc.setDrawColor(250, 204, 21);
  doc.setLineWidth(0.8);
  doc.line(60, y, pageWidth - 60, y);

  y += 20;

  // ── Details ─────────────────────────────
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 210);
  doc.setFont('helvetica', 'normal');

  const leftCol = 40;
  const rightCol = 130;

  const fields: [string, string][] = [
    ['Patient Name', data.patientName],
    ['Phone Number', data.patientPhone],
    ['Doctor', data.doctorName],
    ['Specialty', data.doctorSpecialty],
    ['Appointment Date', data.appointmentDate],
    ['Time Slot', data.appointmentTime],
    ['Token Number', data.appointmentToken.replace('#APP-', 'APP-')],
    ...(data.transactionId ? [['Transaction ID', data.transactionId] as [string, string]] : []),
  ];

  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(label, leftCol, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 210);
    doc.text(value, rightCol, y);
    y += 10;
  });

  // ── Amount ──────────────────────────────
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Amount', leftCol, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 20, 60);
  doc.setFontSize(14);
  doc.text(`PKR ${data.amount.toLocaleString()}.00`, rightCol, y);
  y += 6;

  // ── Status Banner ───────────────────────
  y += 12;
  doc.setFillColor(250, 204, 21, 0.15);
  doc.roundedRect(leftCol - 5, y - 8, pageWidth - leftCol - 10, 22, 4, 4, 'F');
  doc.setDrawColor(250, 204, 21);
  doc.setLineWidth(0.5);
  doc.roundedRect(leftCol - 5, y - 8, pageWidth - leftCol - 10, 22, 4, 4, 'S');

  doc.setFontSize(10);
  doc.setTextColor(250, 204, 21);
  doc.setFont('helvetica', 'bold');
  doc.text('Status: PENDING ADMIN VERIFICATION', leftCol, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 160);
  doc.text('Please present this slip at the clinic. Bring your payment receipt.', leftCol, y + 11);

  y += 28;
  doc.setDrawColor(40, 40, 50);
  doc.setLineWidth(0.3);
  doc.line(leftCol, y, pageWidth - leftCol, y);

  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Body Experts Clinic • Confidential Document', pageWidth / 2, y, { align: 'center' });

  return doc.output('blob');
}

export function downloadTempBookingSlip(data: TempSlipData) {
  const blob = generateTempBookingSlip(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `temp-booking-slip-${data.appointmentToken.replace('#', '')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
