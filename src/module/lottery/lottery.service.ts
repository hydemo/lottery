import { Model, Types } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as uuid from 'uuid';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { Pagination } from 'src/common/dto/pagination.dto';
import { PaginationUtil } from 'src/utils/pagination.util';
import { IList } from 'src/common/interface/list.interface';
import { ILottery } from './lottery.interfaces';
import { CreateLotteryDTO } from './lottery.dto';
import { RedisService } from 'nestjs-redis';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { UserService } from '../user/user.service';
import { async } from 'rxjs/internal/scheduler/async';

const data = [
  {
    name:
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满100元减30元(此优惠不可与酒店其它优惠同时使用)',
    count: 420,
    image: 'https://gw.alicdn.com/tfs/TB1yNoyXicKOu4jSZKbXXc19XXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满300元减120元(此优惠不可与酒店其它优惠同时使用)',
    count: 150,
    image: 'https://gw.alicdn.com/tfs/TB1UeRnfIKfxu4jSZPfXXb3dXXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满500元减250元(此优惠不可与酒店其它优惠同时使用)',
    count: 200,
    image: 'https://gw.alicdn.com/tfs/TB1YrYoD4D1gK0jSZFyXXciOVXa-481-481.png',
  },
  {
    name:
      '瑞颐大酒店2楼琴岸咖啡厅自助午/晚餐人民币158元/一大一小（1.4米以下儿童）此优惠不可与酒店其它优惠同时使用。使用须知：1、需要在使用前1天的18:00前进行预约，在有效期内方可使用。2、超过1.4米的儿童请多买一份。',
    count: 100,
    image: 'https://qn.imusheng.net/choujiangerqi5.jpg',
  },
  {
    name:
      '厦门瑞颐大酒店健身中心满300元减150元(此优惠不可与酒店其它优惠同时使用)',
    count: 20,
    image: 'https://gw.alicdn.com/tfs/TB1CDbiD7L0gK0jSZFtXXXQCXXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐大酒店健身中心满600元减350元(此优惠不可与酒店其它优惠同时使用)',
    count: 50,
    image: 'https://gw.alicdn.com/tfs/TB1xfYkDYr1gK0jSZFDXXb9yVXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐大酒店豪华城景房888元买一送一特惠（需连住两晚，使用后不可变更与退款,不含早,需提前一天进行预订,此优惠不可与酒店其它优惠同时使用）',
    count: 135,
    image: 'https://gw.alicdn.com/tfs/TB13fzbD1L2gK0jSZPhXXahvXXa-481-481.png',
  },
  {
    name: '厦门瑞颐逸居酒店会议厅满5000元减2500元',
    count: 6,
    image: 'https://qn.imusheng.net/choujiang8.jpg',
  },
  {
    name: '厦门瑞颐逸居酒店会议厅满10000元减5500元',
    count: 1,
    image: 'https://qn.imusheng.net/choujiang9.jpg',
  },
  {
    name: '厦门瑞颐逸居酒店客房豪华房净价480元一晚（含双早），可赠送一晚免费',
    count: 49,
    image: 'https://qn.imusheng.net/choujiang10.jpg',
  },
  {
    name: '一叶舟小火锅（中华城店）50元无门槛现金券（单券只可使用一次）',
    count: 100,
    image: 'https://qn.imusheng.net/choujiang13.jpg',
  },
  {
    name: '冠军溜冰场中华城店100元滑冰券（单券只可使用一次）',
    count: 400,
    image: 'https://gw.alicdn.com/tfs/TB1WnDoDW61gK0jSZFlXXXDKFXa-481-481.png',
  },
  {
    name: 'GAP（中华城店）全场正价商品5折券',
    count: 1000,
    image: 'https://qn.imusheng.net/choujiang15.jpg',
  },
  {
    name: 'COODOO （中华城店）指定配件9折券',
    count: 500,
    image: 'https://qn.imusheng.net/choujiang16.jpg',
  },
  {
    name: 'Daniel Wellington （中华城店）满999减150元券',
    count: 500,
    image: 'https://qn.imusheng.net/choujiang17.jpg',
  },
  {
    name: 'PUMA（中华城店）全场5折券(单笔销售五折,不超过3000元）',
    count: 250,
    image: 'https://gw.alicdn.com/tfs/TB1xTYnDYj1gK0jSZFOXXc7GpXa-481-481.png',
  },
  {
    name:
      'fun（中华城店）满300元减50元（折扣与店铺同享，不能与其它优惠券一起使用，满300抵用一张，单笔只使用一张）',
    count: 300,
    image: 'https://qn.imusheng.net/choujiang19.jpg',
  },
  {
    name: '高兴的小鸟（中华城店）满100元减20元',
    count: 500,
    image: 'https://gw.alicdn.com/tfs/TB1wn6kD7L0gK0jSZFAXXcA9pXa-481-481.png',
  },
  {
    name: '西贝（中华城店）消费100元返50元代金券（只限堂食和外带）',
    count: 1000,
    image: 'https://qn.imusheng.net/choujiangerqi20.jpg',
  },
  {
    name: '蓝蛙（中华城店）经典单人汉堡套餐，原价：128元，现价：78元 ',
    count: 500,
    image: 'https://qn.imusheng.net/choujiangerqi21.jpg',
  },
  {
    name: '蓝蛙（中华城店）蓝蛙踏春双人套餐，原价：432元，现价：268元 ',
    count: 500,
    image: 'https://qn.imusheng.net/choujiangerqi22.jpg',
  },
  {
    name: '桃园眷村（中华城店）品质早餐九块九（每人仅限选择一样）',
    count: 500,
    image: 'https://qn.imusheng.net/choujiangerqi23.jpg',
  },
  {
    name:
      '中华城20元美妆通用券，满200使用，单笔限用一张参与品牌： LANCOME、BOBBI BROWN、SULWHASOO 、SK-II 、KIEHL’S、SHU UEMURA 、ORIGINS、CLINIQUE、 LANEIGE、 L’OCCITANE、 MAKE UP FOR EVER 、GIVENCHY 、MAC、ESTEE LAUDER、ARMANI、CPB、SHISEIDO、YSL、FRESH、FANCL、IPSA',
    count: 1000,
    image: 'https://qn.imusheng.net/choujiangerqi24.jpg',
  },
  {
    name: '川二代·原汁·把把烧满200元减100元',
    count: 250,
    image: 'https://gw.alicdn.com/tfs/TB1746nD.Y1gK0jSZFCXXcwqXXa-481-481.png',
  },
  {
    name: '7C CARDLE（七彩摇篮）全场七折券',
    count: 3000,
    image: 'https://qn.imusheng.net/choujiang28.jpg',
  },
  {
    name: '财神到海沧店炒钉螺消费券一份',
    count: 500,
    image: 'https://gw.alicdn.com/tfs/TB1o4_nD7T2gK0jSZPcXXcKkpXa-481-481.png',
  },
  {
    name: '财神到莲花店烤串套餐五折券',
    count: 491,
    image: 'https://gw.alicdn.com/tfs/TB1jmrjD4n1gK0jSZKPXXXvUXXa-481-481.png',
  },
  {
    name: '形馆健身房300元现金抵用券一张',
    count: 50,
    image: 'https://gw.alicdn.com/tfs/TB1SWbnD4D1gK0jSZFKXXcJrVXa-481-481.png',
  },
  {
    name: '医世家500元现金券',
    count: 20,
    image: 'https://gw.alicdn.com/tfs/TB1ExgyXicKOu4jSZKbXXc19XXa-481-481.png',
  },
  {
    name: '医世家价值600元单节龙骨理疗消费券',
    count: 5,
    image: 'https://gw.alicdn.com/tfs/TB1TCLfDWL7gK0jSZFBXXXZZpXa-481-481.png',
  },
  {
    name: '盈众汽车厦门区域8大品牌保养工时七折券',
    count: 200,
    image: 'https://gw.alicdn.com/tfs/TB1dCrjD4n1gK0jSZKPXXXvUXXa-481-481.png',
  },
  {
    name: '厦门易新二手车二手车1000元购车抵用券',
    count: 100,
    image: 'https://gw.alicdn.com/tfs/TB1vTYkD7L0gK0jSZFAXXcA9pXa-481-481.png',
  },
  {
    name: '醉堂酒业旗下葡萄牙酒庄公牛系列红葡萄酒满1000元减300元',
    count: 250,
    image: 'https://gw.alicdn.com/tfs/TB1zDYnDYj1gK0jSZFOXXc7GpXa-481-481.png',
  },
  {
    name: '醉堂酒业旗下葡萄牙酒庄澳洲奔富系列389、407产品满3000元减1000元',
    count: 20,
    image: 'https://gw.alicdn.com/tfs/TB1b6jiD.z1gK0jSZLeXXb9kVXa-481-481.png',
  },
  {
    name: '兴林灯饰城灯饰通用券满2000元减200元（特价产品除外）',
    count: 150,
    image: 'https://gw.alicdn.com/tfs/TB1PhYnD.Y1gK0jSZFCXXcwqXXa-481-481.png',
  },
  {
    name: '兴林家具城红木家具通用券满10000元减3000元（特价产品除外）',
    count: 150,
    image: 'https://gw.alicdn.com/tfs/TB1b42nD7T2gK0jSZPcXXcKkpXa-481-481.png',
  },
  {
    name: '兴林家具城红木家具通用券满20000元减6400元（特价产品除外）',
    count: 150,
    image: 'https://gw.alicdn.com/tfs/TB1FaYiDVY7gK0jSZKzXXaikpXa-481-481.png',
  },
  {
    name:
      '方心眼镜太阳镜、光学镜、老花眼镜、隐形眼镜、隐形眼镜护理液等折后消费每满100抵10',
    count: 50,
    image: 'https://gw.alicdn.com/tfs/TB1v8DlD7Y2gK0jSZFgXXc5OFXa-481-481.png',
  },
  {
    name: 'thank u mom（宝龙一城店）满100元减20元',
    count: 10,
    image: 'https://qn.imusheng.net/choujiang59.jpg',
  },
  {
    name: '留萌（宝龙一城店）自助火锅特价券138元/位（不与店铺其他活动同享）',
    count: 20,
    image: 'https://qn.imusheng.net/choujiang60.jpg',
  },
  {
    name: '金橄榄（宝龙一城店）满200元减50元',
    count: 20,
    image: 'https://qn.imusheng.net/choujiang61.jpg',
  },
  {
    name: '七匹狼服装门店50元春夏服装折后抵用券',
    count: 4000,
    image: 'https://gw.alicdn.com/tfs/TB10nLoDW61gK0jSZFlXXXDKFXa-481-481.png',
  },
  {
    name: '七匹狼服装门店全场折上九折券',
    count: 10,
    image: 'https://gw.alicdn.com/tfs/TB17GbnD4D1gK0jSZFKXXcJrVXa-481-481.png',
  },
  {
    name: '外图厦门书城全场图书单笔消费满100元减30元（不与其他优惠同时使用）',
    count: 4000,
    image: 'https://qn.imusheng.net/choujiangerqi51.jpg',
  },
  {
    name: '外图厦门书城100元实体书券（不与其他优惠同时使用）',
    count: 5,
    image: 'https://qn.imusheng.net/choujiangerqi52.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店网络公开价100元抵用券，所有房型通用',
    count: 991,
    image: 'https://qn.imusheng.net/choujiangerqi53.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店网络公开价豪华湾景房200元抵用券',
    count: 500,
    image: 'https://qn.imusheng.net/choujiangerqi54.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店网络公开价300元套房抵用券',
    count: 500,
    image: 'https://qn.imusheng.net/choujiangerqi55.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店自助晚餐门市价7折券',
    count: 1500,
    image: 'https://qn.imusheng.net/choujiangerqi56.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店中餐满1000元减250元',
    count: 1000,
    image: 'https://qn.imusheng.net/choujiangerqi57.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店康乐健身游泳次卡门市价2.5折券',
    count: 2000,
    image: 'https://qn.imusheng.net/choujiangerqi58.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店会议场租满10000元减3000元',
    count: 100,
    image: 'https://qn.imusheng.net/choujiangerqi59.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店宴会500元抵用券（一次性消费5桌及以上可用）',
    count: 1000,
    image: 'https://qn.imusheng.net/choujiangerqi60.jpg',
  },
  {
    name: '万元大礼包2',
    count: 3,
    image: 'https://qn.imusheng.net/choujiangerqi61.jpg',
  },
  {
    name: '万元大礼包1',
    count: 3,
    image: 'https://qn.imusheng.net/choujiangerqi62.jpg',
  },
];

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
  async lottery(user: string, time: number) {
    // const now = moment().format('HH:mm:ss');
    // if (now > '12:21:44') {
    //   return 'null';
    // }
    // if (now < '12:12:00') {
    //   return 'noStart';
    // }
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
    if (time === 2) {
      await this.userService.updateById(user, { signTime: Date.now() });
    } else {
      await this.userService.updateById(user, { firstSignTime: Date.now() });
    }
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
      // .populate({ path: 'user', model: 'user', select: '_id nickname avatar' })
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
    const client = this.redis.getClient();
    const rewards: any = [];
    const codes: string[] = [];
    for (let i = 0; i < data.length; i++) {
      const lottery = data[i];
      for (let j = 0; j < lottery.count; j++) {
        const code = this.genCode(codes);
        codes.push(code);
        rewards.push({
          reward: i + 1,
          code,
        });
      }
      await client.hset('lottery', String(i + 1), lottery.count);
    }
    const newRewards = this.shuffle(rewards);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < newRewards.length; i++) {
      await client.rpush('reward', JSON.stringify(newRewards[i]));
    }
  }

  // 下载
  async download(path: string) {
    const filename = `${uuid()}.xlsx`;
    const pathExist = fs.existsSync(path);
    if (!pathExist) {
      fs.mkdirSync(path);
    }
    const condition: any = {};
    // if (reward) {
    //   condition.reward = reward;
    // }
    const lotterys: ILottery[] = await this.lotteryModel
      .find(condition)
      .sort({ createdAted: -1 })
      .lean()
      .exec();
    const list: any = [];
    for (const lottery of lotterys) {
      const lotteryData = {
        用户ID: String(lottery.user),
        兑换码: lottery.code,
        券名: data[lottery.reward - 1] ? data[lottery.reward - 1].name : '',
        领用时间: moment(lottery.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        是否使用: lottery.exchange ? '是' : '否',
        使用时间: lottery.exchangeTime
          ? moment(lottery.exchangeTime).format('YYYY-MM-DD HH:mm:ss')
          : '',
      };
      list.push(lotteryData);
    }
    const wch: any = [];
    for (let w = 0; w < 7; w++) {
      wch.push({ wch: 25 });
    }

    const sheet = XLSX.utils.json_to_sheet(list);
    sheet['!cols'] = wch;
    const workbook = {
      SheetNames: ['领券总表'],
      Sheets: { 领券总表: sheet },
    };
    XLSX.writeFile(workbook, `${path}/${filename}`);
    return filename;
  }

  async reset() {
    // const count = await this.lotteryModel.countDocuments({
    //   createdAt: { $gt: '2020:04:30 12:21:44' },
    // });
    // console.log(count, 'ss');
    // const list = await this.lotteryModel.find();
    // const existData: any = {};
    // const codes: string[] = [];
    // list.map(li => {
    //   codes.push(li.code);
    //   const exist = existData[li.reward];
    //   if (exist) {
    //     existData[li.reward] = exist + 1;
    //   } else {
    //     existData[li.reward] = 1;
    //   }
    // });
    let oriCount = 0;
    for (const i of data) {
      oriCount += i.count;
    }
    // let addCount = 0;
    // const newList: any = [];
    // for (let i = 1; i <= 65; i++) {
    //   const count = existData[i];
    //   const ori = data[i - 1];
    //   oriCount += ori.count;
    //   let length = ori.count;
    //   if (count) {
    //     length = ori.count - count;
    //   }
    //   for (let j = 0; j < length; j++) {
    //     const code = this.genCode(codes);
    //     codes.push(code);
    //     const seed = Math.floor(Math.random() * 580);
    //     const newLottery: CreateLotteryDTO = {
    //       user: String(Types.ObjectId()),
    //       reward: i,
    //       code,
    //       cache: true,
    //       createdAt: moment('2020-04-30 12:12:00').add(seed, 's'),
    //     };
    //     addCount += 1;
    //     newList.push(newLottery);
    //   }
    // }
    // await Promise.all(
    //   newList.map(async ss => await this.lotteryModel.create(ss)),
    // );
    // console.log(oriCount, addCount, oriCount - addCount, 'ss');
  }
}
