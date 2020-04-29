import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    let income = 0;
    let outcome = 0;

    const proccessTransactions = (t: Transaction): void => {
      if (t.type === 'income') {
        income += parseFloat(`${t.value}`);
      } else if (t.type === 'outcome') {
        outcome += parseFloat(`${t.value}`);
      }
    };

    transactions.map(proccessTransactions);

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
