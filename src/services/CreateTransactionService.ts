import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  nameCategory: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    nameCategory,
  }: RequestDTO): Promise<Transaction | null> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      const newTotal = balance.total - value;
      if (newTotal < 0) {
        throw new AppError('Not authorized');
      }
    }

    let category = await categoryRepository.findOne({
      where: { title: nameCategory },
    });

    if (!category) {
      category = categoryRepository.create({ title: nameCategory });
      await categoryRepository.save(category);
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: category.id,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
