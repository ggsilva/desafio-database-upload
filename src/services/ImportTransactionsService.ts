import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionFile {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const createService = new CreateTransactionService();
    const transactionsFile = await this.readCsvFile(fileName);

    const transactions: Transaction[] = [];

    const proccessTransactionFile = async ({
      title,
      type,
      value,
      category,
    }: TransactionFile): Promise<void> => {
      const transaction = await createService.execute({
        title,
        type,
        value,
        nameCategory: category,
      });

      if (transaction) {
        transactions.push(transaction);
      }
    };

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < transactionsFile.length; index++) {
      // eslint-disable-next-line no-await-in-loop
      await proccessTransactionFile(transactionsFile[index]);
    }

    return transactions;
  }

  private async readCsvFile(fileName: string): Promise<TransactionFile[]> {
    const csvFilePath = path.join(uploadConfig.directory, fileName);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: TransactionFile[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      lines.push({ title, type, value, category });
    });
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });
    return lines;
  }
}

export default ImportTransactionsService;
