const test = async () => {
  const email = `dr.test${Date.now()}@docpa.com`;
  const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  console.log(`Testing registration with both Email (${email}) and Phone (${phone})...`);

  const res = await fetch('http://localhost:5000/api/v1/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Test Physician',
      email,
      phone,
      password: 'password123',
      role: 'doctor',
      clinic_name: 'Test Healthcare Clinic',
      specialization: 'Cardiologist',
      registration_number: 'MCI-998877',
      consultation_fee: 600,
    }),
  });

  const data = await res.json();
  console.log('Registration Response Status:', res.status);
  console.log('Response Payload:', JSON.stringify(data, null, 2));
};

test().catch(console.error);
