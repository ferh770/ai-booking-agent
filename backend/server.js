import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// Mock available slots (replace with real calendar later)
const AVAILABLE_SLOTS = [
  "2025-04-05T09:00:00",
  "2025-04-05T09:30:00",
  "2025-04-05T10:00:00",
  "2025-04-05T14:00:00",
  "2025-04-05T15:00:00",
  "2025-04-05T16:00:00"
];

// Handle conversation (text or voice input → AI reply)
app.post('/api/conversation', async (req, res) => {
  const { message, businessId } = req.body;

  // Get business info (name, voice ID)
  const { data: business } = await supabase
    .from('businesses')
    .select('name, voice_id')
    .eq('id', businessId)
    .single();

  // Ask GPT to generate human-like reply
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a friendly booking agent for ${business?.name || 'this business'}. Available times: 9AM-4:30PM. Slots: ${AVAILABLE_SLOTS.join(', ')}. Ask for name, phone, email. Confirm clearly. Allow rescheduling.`
      },
      { role: "user", content: message }
    ],
    temperature: 0.3
  });

  const reply = completion.choices[0].message.content;

  // SIMPLIFIED: Save booking if reply contains "confirmed"
  if (reply.toLowerCase().includes("confirm") || reply.toLowerCase().includes("booked")) {
    const mockBooking = {
      customer_name: "Guest User",
      customer_phone: "+1000000000",
      customer_email: "guest@example.com",
      appointment_time: "2025-04-05T10:00:00",
      business_id: businessId,
      status: "confirmed"
    };

    await supabase.from('bookings').insert(mockBooking);
    // Later: Add Twilio/SendGrid confirmations here
  }

  res.json({ reply });
});

// Generate voice using ElevenLabs
app.post('/api/tts', async (req, res) => {
  const { text, businessId } = req.body;

  const { data: business } = await supabase
    .from('businesses')
    .select('voice_id')
    .eq('id', businessId)
    .single();

  if (!business?.voice_id) {
    return res.status(400).send('No voice configured for this business.');
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${business.voice_id}`,
      { text: text.substring(0, 250) }, // Limit length
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(response.data, 'binary'));
  } catch (error) {
    console.error("TTS Error:", error.message);
    res.status(500).send('Voice generation failed.');
  }
});

// Test endpoint
app.get('/', (req, res) => {
  res.send('AI Booking Agent Backend is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});