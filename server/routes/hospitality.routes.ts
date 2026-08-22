import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

type Booking = {
  id: string;
  hotel: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  promoCode?: string;
  createdAt: string;
  status: 'requested';
};

type Subscriber = { email: string; createdAt: string };
type HospitalityStore = { bookings: Booking[]; subscribers: Subscriber[] };

const router = Router();
const storePath = path.resolve(process.cwd(), 'server', 'data', 'hospitality.json');

async function readStore(): Promise<HospitalityStore> {
  try {
    const raw = await fs.readFile(storePath, 'utf8');
    const value = JSON.parse(raw) as Partial<HospitalityStore>;
    return { bookings: value.bookings || [], subscribers: value.subscribers || [] };
  } catch {
    return { bookings: [], subscribers: [] };
  }
}

async function writeStore(store: HospitalityStore) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const tempPath = `${storePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(store, null, 2), 'utf8');
  await fs.rename(tempPath, storePath);
}

router.post('/bookings', async (req, res, next) => {
  try {
    const { hotel, checkIn, checkOut, guests, promoCode } = req.body || {};
    if (!hotel || hotel === 'Select a Hotel' || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ success: false, error: 'Please complete your hotel, dates and guest details.' });
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({ success: false, error: 'Check-out must be after check-in.' });
    }
    const store = await readStore();
    const booking: Booking = { id: `booking-${Date.now()}`, hotel, checkIn, checkOut, guests, promoCode, createdAt: new Date().toISOString(), status: 'requested' };
    store.bookings.unshift(booking);
    await writeStore(store);
    res.status(201).json({ success: true, booking });
  } catch (error) { next(error); }
});

router.post('/newsletter', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
    const store = await readStore();
    if (!store.subscribers.some((subscriber) => subscriber.email === email)) {
      store.subscribers.unshift({ email, createdAt: new Date().toISOString() });
      await writeStore(store);
    }
    res.status(201).json({ success: true, message: 'You are now on the list.' });
  } catch (error) { next(error); }
});

router.get('/bookings', async (_req, res, next) => {
  try { res.json({ success: true, bookings: (await readStore()).bookings }); } catch (error) { next(error); }
});

export { router as hospitalityRouter };
