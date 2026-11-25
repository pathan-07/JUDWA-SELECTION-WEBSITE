-- Prepaid orders are only authorised at checkout; the admin captures (accepts) or cancels later.
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'authorized';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'razorpay';
