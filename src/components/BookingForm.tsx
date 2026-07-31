'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Phone, FileText, Download, CheckCircle, AlertCircle, Upload, Image as ImageIcon, X, Banknote } from 'lucide-react';
import { addDoc, collection, serverTimestamp, doc, onSnapshot, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { formatDate, formatDateShort, getDoctorTimings, generateTimeSlots, generateAppointmentToken, isDateOnLeave, DoctorLeave } from '@/lib/slotEngine';
import CustomCalendar from '@/components/CustomCalendar';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import { downloadAppointmentReceipt, downloadTempBookingSlip } from '@/lib/pdfReceipt';
import { addPendingAppointment } from '@/lib/appointmentState';
import { format } from 'date-fns';

interface DoctorData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'doctor';
  avatar?: string;
  profilePicture?: string;
  profileCompleted?: boolean;
  doctorProfile?: {
    education?: string;
    experience?: string;
    specialization?: string;
    availableDays?: string[];
    timings?: string;
    about?: string;
    qualifications?: string;
    slotDuration?: number;
    consultationFee?: number;
    profilePicture?: string;
  };
}

interface BookingFormData {
  patientName: string;
  patientPhone: string;
}

export default function BookingForm({
  doctor,
  onBookingComplete,
}: {
  doctor: DoctorData;
  onBookingComplete?: () => void;
}) {
  const timings = getDoctorTimings(doctor);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    patientName: '',
    patientPhone: '',
  });
  const [bookingStatus, setBookingStatus] = useState<'form' | 'payment_proof' | 'confirmed' | 'error'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [appointmentToken, setAppointmentToken] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<'pending_verification' | 'confirmed'>('pending_verification');

  const CONSULTATION_FEE = doctor.doctorProfile?.consultationFee || 1000;

  const [transactionId, setTransactionId] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const unsubscribe = onSnapshot(doc(db, 'appointments', appointmentId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfirmationStatus(data.status || 'pending_verification');
      }
    });

    return () => unsubscribe();
  }, [appointmentId]);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [doctorLeaves, setDoctorLeaves] = useState<DoctorLeave[]>([]);

  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const fetchBookedSlots = async () => {
      const q = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctor?.id || doctor?.id),
        where('date', '==', dateStr),
      );

      const snapshot = await getDocs(q);
      const slots: string[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.slot) {
          slots.push(data.slot);
        }
      });
      setBookedSlots(slots);
    };

    fetchBookedSlots();
  }, [selectedDate, doctor]);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const q = query(
          collection(db, 'doctorLeaves'),
          where('doctorId', '==', doctor.id)
        );
        const snapshot = await getDocs(q);
        const leaves = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as DoctorLeave[];
        setDoctorLeaves(leaves);
      } catch (err) {
        console.error('Error fetching leaves:', err);
      }
    };

    fetchLeaves();
  }, [doctor]);

  const handleDateSelect = (date: Date) => {
    if (isDateOnLeave(date, doctorLeaves)) return;
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot.time);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedSlot || !formData.patientName || !formData.patientPhone) {
      setError('Please fill in all fields and select a date and time slot.');
      return;
    }
    setError('');
    setBookingStatus('payment_proof');
  };

  const uploadPaymentProof = async (file: File, appointmentId: string): Promise<string> => {
    const extension = file.name.split('.').pop();
    const fileName = `payment_proof_${appointmentId}.${extension}`;
    const storageDestination = storageRef(storage, `payment_proofs/${fileName}`);
    const snapshot = await uploadBytes(storageDestination, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmitPaymentDetails = async () => {
    if (!selectedDate || !selectedSlot || !formData.patientName || !formData.patientPhone) {
      setError('Please fill in all required fields.');
      return;
    }

    const hasTransactionId = transactionId.trim().length > 0;
    const hasPaymentProof = !!paymentProof;

    if (!hasTransactionId && !hasPaymentProof) {
      setError('Please provide either a Transaction ID or upload a payment proof screenshot.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const existingTokens = await getDocs(
        query(
          collection(db, 'appointments'),
          where('doctorId', '==', doctor.id),
          where('date', '==', format(selectedDate, 'yyyy-MM-dd')),
        )
      );

      const token = generateAppointmentToken(selectedDate, existingTokens.size);

      const docRef = await addDoc(collection(db, 'appointments'), {
        patientId: '',
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        doctorId: doctor.id,
        doctorName: `Dr. ${doctor.name}`,
        doctorSpecialty: doctor.doctorProfile?.specialization || 'General Physician',
        date: format(selectedDate, 'yyyy-MM-dd'),
        slot: selectedSlot,
        token,
        amount: CONSULTATION_FEE,
        status: 'pending_verification',
        type: 'specific',
        transactionId: transactionId.trim() || '',
        paymentProofUrl: '',
        paymentProofUploaded: false,
        createdAt: serverTimestamp(),
      });

      setAppointmentId(docRef.id);
      setAppointmentToken(token);

      let proofUrl = '';

      if (paymentProof) {
        proofUrl = await uploadPaymentProof(paymentProof, docRef.id);
        await updateDoc(doc(db, 'appointments', docRef.id), {
          paymentProofUrl: proofUrl,
          paymentProofUploaded: true,
        });
      }

      // Persist to localStorage pendingAppointments for Admin review
      addPendingAppointment({
        appointmentId: docRef.id,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        doctorId: doctor.id,
        doctorName: `Dr. ${doctor.name}`,
        doctorSpecialty: doctor.doctorProfile?.specialization || 'General Physician',
        date: format(selectedDate, 'yyyy-MM-dd'),
        slot: selectedSlot,
        token,
        amount: CONSULTATION_FEE,
        transactionId: transactionId.trim() || undefined,
        paymentProofUrl: proofUrl || undefined,
        status: 'pending_verification',
      });

      // Smooth transition: simulate 500ms submission state
      await new Promise(resolve => setTimeout(resolve, 500));

      setBookingStatus('confirmed');
      setConfirmationStatus('pending_verification');
      onBookingComplete?.();
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to submit payment details. Please try again.');
      setBookingStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTempSlip = () => {
    if (!selectedDate || !selectedSlot || !appointmentToken) return;

    downloadTempBookingSlip({
      appointmentToken: appointmentToken,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      doctorName: `Dr. ${doctor.name}`,
      doctorSpecialty: doctor.doctorProfile?.specialization || 'General Physician',
      appointmentDate: formatDate(selectedDate),
      appointmentTime: selectedSlot,
      amount: CONSULTATION_FEE,
      transactionId: transactionId || undefined,
    });
  };

  const handleDownloadPDF = () => {
    if (!selectedDate || !selectedSlot || !appointmentId) return;

    downloadAppointmentReceipt({
      clinicName: 'Body Experts Clinic',
      clinicAddress: '123 Wellness Street, Health District',
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      doctorName: `Dr. ${doctor.name}`,
      doctorSpecialty: doctor.doctorProfile?.specialization || 'General Physician',
      appointmentDate: formatDate(selectedDate),
      appointmentTime: selectedSlot,
      amount: CONSULTATION_FEE,
      token: appointmentToken || '',
      appointmentId: appointmentId,
      status: confirmationStatus,
      verifiedBy: confirmationStatus === 'confirmed' ? 'Admin' : undefined,
      verifiedAt: confirmationStatus === 'confirmed' ? new Date().toLocaleDateString() : undefined,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous preview URL to avoid memory leaks
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview);
    }

    setPaymentProof(file);
    setPaymentProofPreview(URL.createObjectURL(file));
  };

  const handleRemoveProof = () => {
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview);
    }
    setPaymentProof(null);
    setPaymentProofPreview(null);
  };

  const resetPaymentProof = () => {
    setTransactionId('');
    setPaymentProof(null);
    setPaymentProofPreview(null);
    setError('');
  };

  const handleBackToForm = () => {
    setBookingStatus('form');
    resetPaymentProof();
  };

  const slideUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Doctor Info Header */}
      <motion.div
        variants={slideUpVariant}
        className="glass-card p-6 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-600 to-crimson-700 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
          {doctor.profilePicture || doctor.avatar ? (
            <img
              src={doctor.profilePicture || doctor.avatar}
              alt={doctor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{doctor.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{doctor.name}</h2>
          <p className="text-rose-400 text-sm">{doctor.doctorProfile?.specialization || 'General Physician'}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>Available: {doctor.doctorProfile?.availableDays?.join(', ') || 'Not specified'}</span>
          </div>
        </div>
      </motion.div>

      {bookingStatus === 'form' && (
        <>
          {/* Step 1: Calendar */}
          <motion.div variants={slideUpVariant}>
            <h3 className="text-lg font-semibold text-white mb-3">Select Date</h3>
            <CustomCalendar
              availableDays={timings.availableDays}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              doctorLeaves={doctorLeaves}
            />
          </motion.div>

          {/* Step 2: Time Slots */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                key="time-slots"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                variants={slideUpVariant}
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  Available Time Slots — {formatDateShort(selectedDate)}
                </h3>
                <TimeSlotSelector
                  startTime={timings.timingFrom}
                  endTime={timings.timingTo}
                  duration={timings.slotDuration}
                  bookedSlots={bookedSlots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Patient Info */}
          <AnimatePresence>
            {selectedSlot && (
              <motion.div
                key="patient-info"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-3">Tarika 1: Instant Guest Booking</h3>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Full Name</label>
                  <div className="flex items-center gap-3 glass-input w-full px-4">
                    <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      required
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Mobile Number</label>
                  <div className="flex items-center gap-3 glass-input w-full px-4">
                    <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="tel"
                      required
                      value={formData.patientPhone}
                      onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                      className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-400"
                      placeholder="Enter your mobile number"
                    />
                  </div>
                </div>

                {/* Payment Notice */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-amber-400 font-semibold text-sm">Payment Required</p>
                      <p className="text-slate-300 text-sm">
                        Fee: <span className="font-bold text-white">PKR {CONSULTATION_FEE.toLocaleString()}</span> required for booking confirmation.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-primary text-sm">{error}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

           {/* Submit Button */}
           <AnimatePresence>
             {selectedSlot && formData.patientName && formData.patientPhone && (
               <motion.div
                 key="submit"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 10 }}
               >
                 <motion.button
                   type="button"
                   whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(225, 29, 72, 0.4)' }}
                   whileTap={{ scale: 0.98 }}
                   onClick={handleConfirmBooking}
                   disabled={isLoading}
                   className="w-full py-4 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 border border-white/10 flex items-center justify-center gap-2 disabled:opacity-60"
                 >
                   <Clock className="w-5 h-5" />
                   <span>Confirm Booking (PKR {CONSULTATION_FEE.toLocaleString()})</span>
                 </motion.button>
               </motion.div>
             )}
           </AnimatePresence>
         </>
       )}

       {/* Step 4: Payment Proof Submission */}
       {bookingStatus === 'payment_proof' && selectedDate && selectedSlot && (
         <motion.div
           key="payment-proof"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="space-y-6"
         >
           {/* Bank Details Card */}
           <motion.div
             variants={slideUpVariant}
             className="glass-card p-6 border border-amber-500/20"
           >
             <div className="flex items-center gap-3 mb-4">
               <Banknote className="w-6 h-6 text-amber-400" />
               <h3 className="text-lg font-semibold text-white">Payment Instructions</h3>
             </div>
             <p className="text-slate-300 text-sm mb-4">
               Please transfer <span className="font-bold text-white">PKR {CONSULTATION_FEE.toLocaleString()}</span> via Bank Transfer, JazzCash, or Easypaisa to the account below.
             </p>
             <div className="space-y-2 text-sm">
               <div className="flex justify-between">
                 <span className="text-slate-400">Account Title:</span>
                 <span className="text-white font-medium">Body Experts Clinic</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Bank:</span>
                 <span className="text-white font-medium">HBL – 1234-5678-9012-3456</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">JazzCash:</span>
                 <span className="text-white font-medium">0300-1234567</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-400">Easypaisa:</span>
                 <span className="text-white font-medium">0300-7654321</span>
               </div>
             </div>
           </motion.div>

           {/* Transaction ID Input */}
           <motion.div variants={slideUpVariant}>
             <label className="block text-sm text-slate-300 mb-2">Transaction ID</label>
             <div className="flex items-center gap-3 glass-input w-full px-4">
               <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
               <input
                 type="text"
                 required
                 value={transactionId}
                 onChange={(e) => setTransactionId(e.target.value)}
                 className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-400"
                 placeholder="Enter Transaction ID (e.g. TID: 983201923)"
               />
             </div>
           </motion.div>

           {/* Payment Proof Upload */}
           <motion.div variants={slideUpVariant}>
             <label className="block text-sm text-slate-300 mb-2">Upload Payment Proof</label>
             <div className="space-y-3">
               {!paymentProofPreview ? (
                 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-amber-500/50 hover:bg-white/5 transition-all">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleFileChange}
                     className="hidden"
                   />
                   <Upload className="w-8 h-8 text-slate-400 mb-2" />
                   <span className="text-slate-300 text-sm">Click to upload screenshot</span>
                   <span className="text-slate-500 text-xs mt-1">PNG, JPG up to 5MB</span>
                 </label>
               ) : (
                 <div className="relative flex items-center justify-center w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                   <img
                     src={paymentProofPreview}
                     alt="Payment proof preview"
                     className="max-w-full max-h-full object-contain"
                   />
                   <button
                     type="button"
                     onClick={handleRemoveProof}
                     className="absolute top-2 right-2 p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               )}
             </div>
           </motion.div>

           {error && (
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
             >
               <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
               <p className="text-primary text-sm">{error}</p>
             </motion.div>
           )}

           <div className="flex gap-3">
             <motion.button
               type="button"
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={handleBackToForm}
               className="flex-1 py-3 px-6 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl font-medium hover:text-white transition-colors"
             >
               Back
             </motion.button>
             <motion.button
               type="button"
               whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(225, 29, 72, 0.4)' }}
               whileTap={{ scale: 0.98 }}
                onClick={handleSubmitPaymentDetails}
                disabled={isLoading || (transactionId.trim().length === 0 && !paymentProof)}
               className="flex-1 py-3 px-6 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-bold rounded-xl shadow-lg shadow-rose-900/30 border border-white/10 flex items-center justify-center gap-2 disabled:opacity-60"
             >
               {isLoading ? (
                 <motion.div
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                   className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                 />
               ) : (
                 <Clock className="w-5 h-5" />
               )}
               <span>{isLoading ? 'Submitting...' : 'Submit Payment Details & Book'}</span>
             </motion.button>
           </div>
         </motion.div>
       )}

       {/* Temp Booking Slip (Pending Verification) */}
       {bookingStatus === 'confirmed' && (
         <AnimatePresence>
           <motion.div
             key="temp-slip"
             initial={{ opacity: 0, y: 20, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -20, scale: 0.95 }}
             className="space-y-6"
           >
             <motion.div
               variants={slideUpVariant}
               className="glass-card p-8 text-center space-y-6 border border-amber-500/20"
             >
               <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                 <CheckCircle className="w-10 h-10 text-amber-400" />
               </div>

               <div>
                 <h3 className="text-2xl font-bold text-white mb-2">Booking Submitted!</h3>
                 <p className="text-slate-400 text-sm">
                   Your appointment is pending admin payment verification.
                 </p>
               </div>

               {appointmentToken && (
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.2 }}
                   className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4"
                 >
                   <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                     Appointment Reference Token
                   </p>
                   <p className="text-3xl font-bold text-white">{appointmentToken}</p>
                   <div className="flex items-center justify-center gap-2 pt-2">
                     <Clock className="w-4 h-4 text-amber-400" />
                     <span className="text-amber-400 text-sm font-medium">
                       Status: Pending Admin Verification
                     </span>
                   </div>
                 </motion.div>
               )}

               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleDownloadTempSlip}
                 className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30"
               >
                 <Download className="w-5 h-5" />
                 Download Temporary Booking Slip (PDF)
               </motion.button>

               <p className="text-slate-500 text-xs">
                 Present this slip at the clinic. Bring your payment receipt for verification.
               </p>
             </motion.div>

             {/* Official Receipt (when confirmed by admin) */}
             <AnimatePresence>
               {confirmationStatus === 'confirmed' && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="glass-card p-6 text-center space-y-4 border border-emerald-500/20"
                 >
                   <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                     <CheckCircle className="w-8 h-8 text-emerald-400" />
                   </div>
                   <p className="text-emerald-400 text-sm font-medium">
                     Payment confirmed by admin ✓
                   </p>
                   <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={handleDownloadPDF}
                     className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                   >
                     <Download className="w-4 h-4" />
                     Download Official Confirmed Receipt (PDF)
                   </motion.button>
                 </motion.div>
               )}
             </AnimatePresence>
           </motion.div>
         </AnimatePresence>
       )}

      {/* Error State */}
      {bookingStatus === 'error' && (
        <AnimatePresence>
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 text-center space-y-4 border border-red-500/20"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Something went wrong</h3>
            <p className="text-slate-300 text-sm">{error}</p>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
