import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Pagination } from 'src/common/dto/pagination.dto';
import { PaginationUtil } from 'src/utils/pagination.util';
import { IList } from 'src/common/interface/list.interface';
import { ILottery } from './lottery.interfaces';
import { CreateLotteryDTO } from './lottery.dto';
import { RedisService } from 'nestjs-redis';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { UserService } from '../user/user.service';

@Injectable()
export class LotteryService {
  constructor(
    @Inject('LotteryModelToken') private readonly lotteryModel: Model<ILottery>,
    @Inject(PaginationUtil) private readonly paginationUtil: PaginationUtil,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  shuffle(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const rIndex = Math.floor(Math.random() * (i + 1));
      // 打印交换值
      // console.log(i, rIndex);
      const temp = arr[rIndex];
      arr[rIndex] = arr[i];
      arr[i] = temp;
    }
    return arr;
  }

  genCode(codes: string[]): string {
    let code = '';
    const codeLength = 8;
    const selectChar: any[] = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'G',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    for (let i = 0; i < codeLength; i++) {
      const charIndex = Math.floor(Math.random() * 32);
      code += selectChar[charIndex];
    }
    if (code.length !== codeLength) {
      return this.genCode(codes);
    }
    if (codes.includes(code)) {
      return this.genCode(codes);
    }
    return code;
  }

  // 查询已抽中奖品
  async listOfToday(): Promise<string[]> {
    const client = this.redis.getClient();
    return await client.hkeys('lottery');
  }

  // 生产抽奖结果
  async lottery(user: string) {
    const now = moment().format('HH:mm:ss');
    if (now > '12:42:00') {
      return 'null';
    }
    const client = this.redis.getClient();

    const lua =
      "if redis.call('llen', 'lotteryreward') == 0 then\n" +
      'return nil\n' +
      'else\n' +
      "local lottery = redis.call('rpop', 'lotteryreward');\n" +
      // 'if lottery then\n' +
      // 'local x = cjson.decode(lottery);\n' +
      // 'local code = x.reward\n' +
      // "redis.call('incrby', 'lottery'..code, -1);\n" +
      // "local reward = redis.call('GET', 'lottery'..code);\n" +
      // 'if reward==0 then\n' +
      // "redis.call('del', 'lottery'..code);\n" +
      'return lottery;\n' +
      // 'end\n' +
      // 'end\n' +
      'end\n';
    client.defineCommand('echo', {
      numberOfKeys: 0,
      lua,
    });
    const result = await client.echo('');
    if (!result) {
      return 'null';
    }
    const lottery = JSON.parse(result);
    await client.hincrby('lottery', lottery.reward, -1);
    const count = await client.hget('lottery', lottery.reward);
    if (Number(count) <= 0) {
      await client.hdel('lottery', lottery.reward);
    }

    const newLottery: CreateLotteryDTO = {
      code: lottery.code,
      reward: lottery.reward,
      user,
    };
    await this.userService.updateById(user, { signTime: Date.now() });
    return await this.lotteryModel.create(newLottery);
  }

  // 分页查询数据
  async list(pagination: Pagination): Promise<IList<ILottery>> {
    const condition = this.paginationUtil.genCondition(
      pagination,
      ['code'],
      'createdAt',
    );
    const list = await this.lotteryModel
      .find(condition)
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .sort({ createdAt: -1 })
      .populate({ path: 'user', model: 'user', select: '_id nickname avatar' })
      .lean()
      .exec();
    const total = await this.lotteryModel.countDocuments(condition);
    return { list, total };
  }

  // 用户抽奖结果列表
  async listByUser(user: string): Promise<ILottery[]> {
    const condition = { user };
    return await this.lotteryModel
      .find(condition)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // 兑换
  async exchange(user: string, id: string): Promise<string> {
    const lottery = await this.lotteryModel.findById(id);
    if (!lottery) {
      throw new ApiException('奖券不存在', ApiErrorCode.NO_EXIST, 404);
    }
    if (String(lottery.user) !== String(user)) {
      throw new ApiException('无权限', ApiErrorCode.NO_PERMISSION, 403);
    }
    await this.lotteryModel.findByIdAndUpdate(id, {
      exchange: true,
      exchangeTime: Date.now(),
    });
    return 'success';
  }

  async genLottery() {
    const data = [
      {
        count: 280,
        image:
          'https://gw.alicdn.com/tfs/TB1yNoyXicKOu4jSZKbXXc19XXa-481-481.png',
      },
      {
        count: 177,
        image:
          'https://gw.alicdn.com/tfs/TB1UeRnfIKfxu4jSZPfXXb3dXXa-481-481.png',
      },
      {
        count: 120,
        image:
          'https://gw.alicdn.com/tfs/TB1YrYoD4D1gK0jSZFyXXciOVXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB1CDbiD7L0gK0jSZFtXXXQCXXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB1xfYkDYr1gK0jSZFDXXb9yVXa-481-481.png',
      },
      {
        count: 90,
        image:
          'https://gw.alicdn.com/tfs/TB13fzbD1L2gK0jSZPhXXahvXXa-481-481.png',
      },
      {
        count: 4,
        image:
          'https://gw.alicdn.com/tfs/TB1ZDYkD7L0gK0jSZFAXXcA9pXa-481-481.png',
      },
      {
        count: 1,
        image:
          'https://gw.alicdn.com/tfs/TB1hAHnDYY1gK0jSZTEXXXDQVXa-481-481.png',
      },
      {
        count: 51,
        image:
          'https://gw.alicdn.com/tfs/TB1kRLlD7Y2gK0jSZFgXXc5OFXa-481-481.png',
      },
      {
        count: 20,
        image:
          'https://gw.alicdn.com/tfs/TB1ElDlD7Y2gK0jSZFgXXc5OFXa-481-481.png',
      },
      {
        count: 11,
        image:
          'https://gw.alicdn.com/tfs/TB1HuLmD7L0gK0jSZFxXXXWHVXa-481-481.png',
      },
      {
        count: 100,
        image:
          'https://gw.alicdn.com/tfs/TB15gDjDVP7gK0jSZFjXXc5aXXa-481-481.png',
      },
      {
        count: 100,
        image:
          'https://gw.alicdn.com/tfs/TB1WnDoDW61gK0jSZFlXXXDKFXa-481-481.png',
      },
      {
        count: 2000,
        image:
          'https://gw.alicdn.com/tfs/TB1ElLlD7Y2gK0jSZFgXXc5OFXa-481-481.png',
      },
      {
        count: 500,
        image:
          'https://gw.alicdn.com/tfs/TB1x_6kD7L0gK0jSZFAXXcA9pXa-481-481.png',
      },
      {
        count: 500,
        image:
          'https://gw.alicdn.com/tfs/TB1RY2kDYr1gK0jSZR0XXbP8XXa-481-481.png',
      },
      {
        count: 250,
        image:
          'https://gw.alicdn.com/tfs/TB1xTYnDYj1gK0jSZFOXXc7GpXa-481-481.png',
      },
      {
        count: 200,
        image:
          'https://gw.alicdn.com/tfs/TB1PHvnD4v1gK0jSZFFXXb0sXXa-481-481.png',
      },
      {
        count: 700,
        image:
          'https://gw.alicdn.com/tfs/TB1lTLoDW61gK0jSZFlXXXDKFXa-481-481.png',
      },
      {
        count: 700,
        image:
          'https://gw.alicdn.com/tfs/TB1wn6kD7L0gK0jSZFAXXcA9pXa-481-481.png',
      },
      {
        count: 491,
        image:
          'https://gw.alicdn.com/tfs/TB1746nD.Y1gK0jSZFCXXcwqXXa-481-481.png',
      },
      {
        count: 291,
        image:
          'https://gw.alicdn.com/tfs/TB1b26kDYr1gK0jSZFDXXb9yVXa-481-481.png',
      },
      {
        count: 391,
        image:
          'https://gw.alicdn.com/tfs/TB16bDnD4v1gK0jSZFFXXb0sXXa-481-481.png',
      },
      {
        count: 400,
        image:
          'https://gw.alicdn.com/tfs/TB1refjD4z1gK0jSZSgXXavwpXa-481-481.png',
      },
      {
        count: 400,
        image:
          'https://gw.alicdn.com/tfs/TB1lY2oD4D1gK0jSZFyXXciOVXa-481-481.png',
      },
      {
        count: 400,
        image:
          'https://gw.alicdn.com/tfs/TB13nYnDYj1gK0jSZFOXXc7GpXa-481-481.png',
      },
      {
        count: 2000,
        image:
          'https://gw.alicdn.com/tfs/TB1Q9TfDWL7gK0jSZFBXXXZZpXa-481-481.png',
      },
      {
        count: 2000,
        image:
          'https://gw.alicdn.com/tfs/TB1i1flD1H2gK0jSZFEXXcqMpXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB1k0_lD1H2gK0jSZFEXXcqMpXa-481-481.png',
      },
      {
        count: 80,
        image:
          'https://gw.alicdn.com/tfs/TB1SFLjD4D1gK0jSZFsXXbldVXa-481-481.png',
      },
      {
        count: 600,
        image:
          'https://gw.alicdn.com/tfs/TB1o4_nD7T2gK0jSZPcXXcKkpXa-481-481.png',
      },
      {
        count: 591,
        image:
          'https://gw.alicdn.com/tfs/TB1jmrjD4n1gK0jSZKPXXXvUXXa-481-481.png',
      },
      {
        count: 60,
        image:
          'https://gw.alicdn.com/tfs/TB1p2vbD1L2gK0jSZPhXXahvXXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB1XrznD4v1gK0jSZFFXXb0sXXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB1fN2nD.Y1gK0jSZFCXXcwqXXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB1irToD4D1gK0jSZFyXXciOVXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB17hgyXicKOu4jSZKbXXc19XXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB1E1blD1H2gK0jSZFEXXcqMpXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB1abznD4v1gK0jSZFFXXb0sXXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB1SWbnD4D1gK0jSZFKXXcJrVXa-481-481.png',
      },
      {
        count: 80,
        image:
          'https://gw.alicdn.com/tfs/TB1ExgyXicKOu4jSZKbXXc19XXa-481-481.png',
      },
      {
        count: 15,
        image:
          'https://gw.alicdn.com/tfs/TB1TCLfDWL7gK0jSZFBXXXZZpXa-481-481.png',
      },
      {
        count: 20,
        image:
          'https://gw.alicdn.com/tfs/TB1k6HkD9f2gK0jSZFPXXXsopXa-481-481.png',
      },
      {
        count: 394,
        image:
          'https://gw.alicdn.com/tfs/TB1rn6kD7L0gK0jSZFAXXcA9pXa-481-481.png',
      },
      {
        count: 400,
        image:
          'https://gw.alicdn.com/tfs/TB1OFPjD4D1gK0jSZFsXXbldVXa-481-481.png',
      },
      {
        count: 250,
        image:
          'https://gw.alicdn.com/tfs/TB14_YnDYj1gK0jSZFOXXc7GpXa-481-481.png',
      },
      {
        count: 791,
        image:
          'https://gw.alicdn.com/tfs/TB1dCrjD4n1gK0jSZKPXXXvUXXa-481-481.png',
      },
      {
        count: 800,
        image:
          'https://gw.alicdn.com/tfs/TB1fnjiD7L0gK0jSZFtXXXQCXXa-481-481.png',
      },
      {
        count: 160,
        image:
          'https://gw.alicdn.com/tfs/TB1vTYkD7L0gK0jSZFAXXcA9pXa-481-481.png',
      },
      {
        count: 400,
        image:
          'https://gw.alicdn.com/tfs/TB1zDYnDYj1gK0jSZFOXXc7GpXa-481-481.png',
      },
      {
        count: 300,
        image:
          'https://gw.alicdn.com/tfs/TB17zHiDVT7gK0jSZFpXXaTkpXa-481-481.png',
      },
      {
        count: 150,
        image:
          'https://gw.alicdn.com/tfs/TB1PhYnD.Y1gK0jSZFCXXcwqXXa-481-481.png',
      },
      {
        count: 150,
        image:
          'https://gw.alicdn.com/tfs/TB1b42nD7T2gK0jSZPcXXcKkpXa-481-481.png',
      },
      {
        count: 150,
        image:
          'https://gw.alicdn.com/tfs/TB1FaYiDVY7gK0jSZKzXXaikpXa-481-481.png',
      },
      {
        count: 300,
        image:
          'https://gw.alicdn.com/tfs/TB1_9_iD7L0gK0jSZFtXXXQCXXa-481-481.png',
      },
      {
        count: 300,
        image:
          'https://gw.alicdn.com/tfs/TB1QCLfDWL7gK0jSZFBXXXZZpXa-481-481.png',
      },
      {
        count: 250,
        image:
          'https://gw.alicdn.com/tfs/TB1v8DlD7Y2gK0jSZFgXXc5OFXa-481-481.png',
      },
      {
        count: 20,
        image:
          'https://gw.alicdn.com/tfs/TB1iQHnDYY1gK0jSZTEXXXDQVXa-481-481.png',
      },
      {
        count: 30,
        image:
          'https://gw.alicdn.com/tfs/TB1i_PjD7P2gK0jSZPxXXacQpXa-481-481.png',
      },
      {
        count: 80,
        image:
          'https://gw.alicdn.com/tfs/TB1ZnjoD1H2gK0jSZJnXXaT1FXa-481-481.png',
      },
      {
        count: 6000,
        image:
          'https://gw.alicdn.com/tfs/TB10nLoDW61gK0jSZFlXXXDKFXa-481-481.png',
      },
      {
        count: 40,
        image:
          'https://gw.alicdn.com/tfs/TB17GbnD4D1gK0jSZFKXXcJrVXa-481-481.png',
      },
      {
        count: 2491,
        image:
          'https://gw.alicdn.com/tfs/TB1v2jiD2b2gK0jSZK9XXaEgFXa-481-481.jpg',
      },
      {
        count: 400,
        image:
          'https://gw.alicdn.com/tfs/TB1MTjiD7L0gK0jSZFtXXXQCXXa-481-481.png',
      },
      {
        count: 2000,
        image:
          'https://gw.alicdn.com/tfs/TB1KTjiD7L0gK0jSZFtXXXQCXXa-481-481.png',
      },
      // {
      //   count: 3,
      //   image:
      //     'https://gw.alicdn.com/tfs/TB1SgLiD2b2gK0jSZK9XXaEgFXa-2651-1761.jpg',
      // },
    ];
    const client = this.redis.getClient();
    const rewards: any = [];
    const codes: string[] = [];
    for (let i = 0; i < data.length; i++) {
      const lottery = data[i];
      for (let j = 0; j < 2; j++) {
        const code = this.genCode(codes);
        codes.push(code);
        rewards.push({
          reward: i + 1,
          code,
        });
      }
      await client.hset('lottery', String(i + 1), 2);
    }
    const newRewards = this.shuffle(rewards);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < newRewards.length; i++) {
      await client.rpush('reward', JSON.stringify(newRewards[i]));
    }
  }
}
