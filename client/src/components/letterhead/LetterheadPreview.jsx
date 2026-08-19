import React from 'react';
import { formatDate, calculateBMI } from '../../utils/formatters';
import { Stethoscope, Calendar, Phone, MapPin, QrCode } from 'lucide-react';

export const LetterheadPreview = ({
  clinic,
  doctor,
  patient,
  vitals,
  complaints = [],
  diagnosis = [],
  medicines = [],
  investigations = [],
  advice = '',
  followUpDate,
  prescriptionNumber,
  createdAt,
}) => {
  const bmi = vitals?.bmi || calculateBMI(vitals?.weight_kg, vitals?.height_cm);
  const letterheadSettings = clinic?.letterhead_settings || {};
  const showHeader = letterheadSettings.show_header !== false;

  return (
    <div
      id="print-area"
      className="bg-white text-slate-900 mx-auto w-full max-w-4xl p-8 sm:p-12 shadow-sm print:p-0 print:shadow-none border print:border-none border-slate-200 rounded-2xl min-h-[1050px] flex flex-col justify-between"
      style={{
        marginTop: `${letterheadSettings.header_space_mm || 0}mm`,
      }}
    >
      {/* 1. Header & Doctor Credentials */}
      <div>
        {showHeader && (
          <div className="border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    {clinic?.name || 'Docpa Multispeciality Clinic'}
                  </h1>
                </div>
                <p className="text-xs font-semibold text-teal-700 tracking-wide">
                  {clinic?.tagline || 'Advanced Patient Care & Diagnostics'}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-2">
                  {clinic?.address?.street && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {clinic.address.street}, {clinic.address.city} - {clinic.address.pincode}
                    </span>
                  )}
                  {clinic?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      +91 {clinic.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Doctor Credentials */}
              <div className="text-right">
                <h2 className="text-base font-extrabold text-slate-900">
                  Dr. {doctor?.name || 'Abhishek Sharma'}
                </h2>
                <p className="text-xs font-semibold text-slate-700">
                  {doctor?.doctor_profile?.qualifications || 'MBBS, MD (Medicine)'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {doctor?.doctor_profile?.specialization || 'Consultant Physician'}
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Reg No: {doctor?.doctor_profile?.registration_number || 'MCI-847291'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Patient Demographics & Vitals Banner */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Patient Name
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {patient?.name || 'Walk-in Patient'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Age / Gender / Blood
              </span>
              <span className="font-semibold text-slate-800">
                {patient?.age_years ? `${patient.age_years} Y` : '-'} /{' '}
                {patient?.gender ? patient.gender.toUpperCase() : '-'} /{' '}
                <span className="font-bold text-rose-600">{patient?.blood_group || 'Unknown'}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                UHID / Rx No.
              </span>
              <span className="font-mono font-semibold text-slate-800">
                {patient?.uhid || 'UHID-000000'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Date & Time
              </span>
              <span className="font-semibold text-slate-800">
                {formatDate(createdAt || new Date())}
              </span>
            </div>
          </div>

          {/* Vitals Snapshot */}
          {(vitals?.bp_systolic || vitals?.pulse_rate || vitals?.weight_kg || vitals?.spo2_percent) && (
            <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px]">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Vitals:
              </span>
              {vitals.bp_systolic && (
                <span>
                  BP:{' '}
                  <strong className="text-slate-900 font-semibold">
                    {vitals.bp_systolic}/{vitals.bp_diastolic || 80} mmHg
                  </strong>
                </span>
              )}
              {vitals.pulse_rate && (
                <span>
                  Pulse:{' '}
                  <strong className="text-slate-900 font-semibold">
                    {vitals.pulse_rate} bpm
                  </strong>
                </span>
              )}
              {vitals.temperature_f && (
                <span>
                  Temp:{' '}
                  <strong className="text-slate-900 font-semibold">
                    {vitals.temperature_f} °F
                  </strong>
                </span>
              )}
              {vitals.spo2_percent && (
                <span>
                  SpO2:{' '}
                  <strong className="text-slate-900 font-semibold">
                    {vitals.spo2_percent}%
                  </strong>
                </span>
              )}
              {vitals.weight_kg && (
                <span>
                  Weight:{' '}
                  <strong className="text-slate-900 font-semibold">
                    {vitals.weight_kg} kg
                  </strong>
                </span>
              )}
              {bmi && (
                <span>
                  BMI:{' '}
                  <strong className="text-slate-900 font-semibold">{bmi}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. Clinical Findings (Complaints & Diagnosis) */}
        {(complaints?.length > 0 || diagnosis?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
            {complaints?.length > 0 && (
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block mb-1">
                  Chief Complaints
                </span>
                <p className="text-slate-800 font-medium">{complaints.join(', ')}</p>
              </div>
            )}
            {diagnosis?.length > 0 && (
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                <span className="font-bold text-teal-900 uppercase text-[10px] tracking-wider block mb-1">
                  Clinical Diagnosis
                </span>
                <p className="text-slate-900 font-bold">{diagnosis.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* 4. Rx (Medications Table) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-serif font-black italic text-teal-700">℞</span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Prescribed Medications
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-[11px] font-bold text-slate-700">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-2">Medicine & Composition</th>
                  <th className="py-2 px-2">Dosage & Frequency</th>
                  <th className="py-2 px-2">Timing</th>
                  <th className="py-2 px-2">Duration</th>
                  <th className="py-2 px-2">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines?.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-2 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-slate-900">
                        {med.dosage_form ? `${med.dosage_form}. ` : ''}
                        {med.name}
                      </div>
                      {med.generic_name && (
                        <div className="text-[10px] text-slate-500 font-normal italic">
                          ({med.generic_name})
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                        {med.frequency || '1-0-1'}
                      </span>
                      {med.dose && (
                        <span className="text-[11px] text-slate-500 ml-1.5">{med.dose}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-slate-700">
                      {med.timing || 'After Food'}
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-slate-800">
                      {med.duration_days ? `${med.duration_days} Days` : '5 Days'}
                    </td>
                    <td className="py-2.5 px-2 text-slate-600 italic">
                      {med.instructions || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Diagnostic Investigations / Tests */}
        {investigations?.length > 0 && (
          <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block mb-1">
              Lab Tests / Radiology Advised
            </span>
            <p className="font-medium text-slate-800">{investigations.join(' • ')}</p>
          </div>
        )}

        {/* 6. General Advice & Diet */}
        {advice && (
          <div className="mb-5 text-xs">
            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block mb-1">
              General Advice & Instructions:
            </span>
            <p className="text-slate-600 leading-relaxed">{advice}</p>
          </div>
        )}
      </div>

      {/* 7. Follow-up & Footer */}
      <div className="border-t-2 border-slate-900 pt-4 mt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {followUpDate && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold mb-2">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Next Follow-up: {formatDate(followUpDate)}</span>
              </div>
            )}
            <p className="text-[10px] text-slate-400 max-w-sm">
              {letterheadSettings.footer_text ||
                'This prescription is valid for medical reference. Please consult the doctor immediately in case of severe allergic reaction or worsening symptoms.'}
            </p>
          </div>

          <div className="text-right">
            <div className="h-12 flex items-end justify-end mb-1">
              {doctor?.doctor_profile?.signature_url ? (
                <img
                  src={doctor.doctor_profile.signature_url}
                  alt="Doctor Signature"
                  className="max-h-10 object-contain"
                />
              ) : (
                <div className="font-serif italic text-sm text-slate-600 border-b border-slate-400 pb-0.5 px-4">
                  Dr. {doctor?.name || 'Consulting Doctor'}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};
