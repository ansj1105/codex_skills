import { Router } from 'express';
import { z } from 'zod';
import { zodToDomainError } from '../../../core/validation.js';
import { tronAddressPattern } from '../../../domain/value-objects/tron-address.js';
import { OnchainService } from '../../../application/services/onchain-service.js';

const networkSchema = z.enum(['mainnet', 'testnet']);

const lookupSchema = z.object({
  network: networkSchema,
  address: z.string().regex(tronAddressPattern, 'invalid TRON address format')
});

const sendSchema = z.object({
  toAddress: z.string().regex(tronAddressPattern, 'invalid TRON address format'),
  amount: z.number().positive()
});

export const createOnchainRoutes = (onchainService: OnchainService): Router => {
  const router = Router();

  router.get('/networks/:network/wallets/:address/balance', async (req, res, next) => {
    try {
      const parsed = lookupSchema.safeParse(req.params);
      if (!parsed.success) {
        throw zodToDomainError(parsed.error);
      }

      const payload = await onchainService.lookupBalance(parsed.data);
      res.json(payload);
    } catch (error) {
      next(error);
    }
  });

  router.post('/networks/:network/transfers', async (req, res, next) => {
    try {
      const params = networkSchema.safeParse(req.params.network);
      if (!params.success) {
        throw zodToDomainError(params.error);
      }

      const body = sendSchema.safeParse(req.body);
      if (!body.success) {
        throw zodToDomainError(body.error);
      }

      const payload = await onchainService.sendFromHotWallet({
        network: params.data,
        toAddress: body.data.toAddress,
        amountKori: body.data.amount
      });
      res.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
