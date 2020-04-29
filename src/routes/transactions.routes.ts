import multer from 'multer';

import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const repository = getCustomRepository(TransactionsRepository);

  const transactions = await repository.find();
  const balance = await repository.getBalance();

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const service = new CreateTransactionService();

  const transactions = await service.execute({
    title,
    type,
    value,
    nameCategory: category,
  });

  return response.json(transactions);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const service = new DeleteTransactionService();

  await service.execute(id);

  return response.json({ status: 'ok' });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const service = new ImportTransactionsService();
    await service.execute(request.file.filename);
    return response.json({ status: 'ok' });
  },
);

export default transactionsRouter;
