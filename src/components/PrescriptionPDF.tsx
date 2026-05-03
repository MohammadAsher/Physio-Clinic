'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { FileDown, Stethoscope, Calendar, User, ClipboardList } from 'lucide-react';

interface PrescriptionPDFProps {
  patientName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  exercises: string[];
  notes: string;
}

export default function PrescriptionPDF({ 
  patientName, 
  doctorName, 
  date, 
  diagnosis, 
  exercises, 
  notes 
}: PrescriptionPDFProps) {
  
  const generatePDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Add logo placeholder (body experts)
    doc.setFillColor(220, 38, 38);
    doc.rect(15, 10, 25, 10, 'F');
    doc.setTextColor(255);
    doc.setFontSize(8);
    doc.text('BODY EXPERTS', 27.5, 18, { align: 'center' });
    
    // Clinic info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text('Physio Clinic & Wellness Center', 50, 15);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('123 Healthcare Avenue, Medical District, City', 50, 22);
    doc.text('Phone: (021) 123-4567 | Email: info@bodyexperts.com', 50, 27);
    
    // Line separator
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(15, 32, 195, 32);
    
    // Prescription header
    doc.setFontSize(16);
    doc.setTextColor(220, 38, 38);
    doc.text('PRESCRIPTION', 105, 42, { align: 'center' });
    
    // Date and doctor info
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Date: ${date}`, 15, 52);
    doc.text(`Doctor: Dr. ${doctorName}`, 15, 58);
    doc.text(`Patient: ${patientName}`, 15, 64);
    
    // Diagnosis section
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text('Diagnosis:', 15, 75);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const diagnosisLines = doc.splitTextToSize(diagnosis || 'No diagnosis recorded', 170);
    doc.text(diagnosisLines, 15, 82);
    
    // Exercises section
    const yPos = 82 + (diagnosisLines.length * 6);
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text('Prescribed Exercises:', 15, yPos + 10);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    
    exercises.forEach((exercise, index) => {
      doc.text(`• ${exercise}`, 20, yPos + 17 + (index * 6));
    });
    
    // Notes section
    const exerciseYPos = yPos + 17 + (exercises.length * 6);
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text('Doctor Notes:', 15, exerciseYPos + 10);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const notesLines = doc.splitTextToSize(notes || 'No additional notes', 170);
    doc.text(notesLines, 15, exerciseYPos + 17);
    
    // Signature line
    const finalY = exerciseYPos + 17 + (notesLines.length * 6);
    doc.setDrawColor(100, 116, 139);
    doc.line(140, finalY + 15, 190, finalY + 15);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Dr. ' + doctorName, 165, finalY + 20, { align: 'center' });
    doc.text('Physician Signature', 165, finalY + 24, { align: 'center' });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('This is a digital prescription from Body Experts Physio Clinic', 105, 285, { align: 'center' });
    
    doc.save(`prescription-${patientName}-${date}.pdf`);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={generatePDF}
      className="w-full px-4 py-3 rounded-xl premium-gradient text-white font-medium flex items-center justify-center gap-2 hover:shadow-crimson-intense transition-all"
    >
      <FileDown className="w-5 h-5" />
      Download Prescription PDF
    </motion.button>
  );
}