import { Connection } from 'mongoose';
import { LotterySchema } from './lottery.schema';

export const lotteryProviders = [
  {
    provide: 'LotteryModelToken',
    useFactory: (connection: Connection) =>
      connection.model('lottery', LotterySchema),
    inject: ['MongoDBConnection'],
  },
];
