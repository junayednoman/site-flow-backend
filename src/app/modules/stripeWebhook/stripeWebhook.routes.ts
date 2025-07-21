import express from 'express';
import stripeWebhookHandler from './stripeWebhook.controller';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

export default router;
