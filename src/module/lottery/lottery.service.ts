import { Model } from 'mongoose';
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

const data = [
  {
    name:
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满100元减30元(此优惠不可与酒店其它优惠同时使用)',
    count: 280,
    image: 'https://gw.alicdn.com/tfs/TB1yNoyXicKOu4jSZKbXXc19XXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满300元减120元(此优惠不可与酒店其它优惠同时使用)',
    count: 177,
    image: 'https://gw.alicdn.com/tfs/TB1UeRnfIKfxu4jSZPfXXb3dXXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满300元减120元(此优惠不可与酒店其它优惠同时使用)',
    count: 120,
    image: 'https://gw.alicdn.com/tfs/TB1YrYoD4D1gK0jSZFyXXciOVXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐大酒店健身中心满300元减150元(此优惠不可与酒店其它优惠同时使用)',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1CDbiD7L0gK0jSZFtXXXQCXXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐大酒店健身中心满300元减150元(此优惠不可与酒店其它优惠同时使用)',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1xfYkDYr1gK0jSZFDXXb9yVXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐大酒店豪华城景房888元买一送一特惠（需连住两晚，使用后不可变更与退款,不含早,需提前一天进行预订,此优惠不可与酒店其它优惠同时使用）',
    count: 90,
    image: 'https://gw.alicdn.com/tfs/TB13fzbD1L2gK0jSZPhXXahvXXa-481-481.png',
  },
  {
    name: '厦门瑞颐逸居酒店会议厅满5000元减2500元',
    count: 4,
    image: 'https://gw.alicdn.com/tfs/TB1ZDYkD7L0gK0jSZFAXXcA9pXa-481-481.png',
  },
  {
    name: '厦门瑞颐逸居酒店会议厅满10000元减5500元',
    count: 1,
    image: 'https://gw.alicdn.com/tfs/TB1hAHnDYY1gK0jSZTEXXXDQVXa-481-481.png',
  },
  {
    name: '厦门瑞颐逸居酒店客房豪华房净价480元一晚（含双早），可赠送一晚免费',
    count: 51,
    image: 'https://gw.alicdn.com/tfs/TB1kRLlD7Y2gK0jSZFgXXc5OFXa-481-481.png',
  },
  {
    name:
      '厦门瑞颐逸居酒店客房豪华童趣房净价840元一晚（含双早），可赠送一晚免费（需提前一天进行预订）',
    count: 20,
    image: 'https://gw.alicdn.com/tfs/TB1ElDlD7Y2gK0jSZFgXXc5OFXa-481-481.png',
  },
  {
    name: '水融石（厦门）数字科技有限公司电梯广告流量电梯广告10000元现金抵用券',
    count: 11,
    image: 'https://gw.alicdn.com/tfs/TB1HuLmD7L0gK0jSZFxXXXWHVXa-481-481.png',
  },
  {
    name: '水融石（厦门）数字科技有限公司电梯广告流量电梯广告10000元现金抵用券',
    count: 100,
    image: 'https://gw.alicdn.com/tfs/TB15gDjDVP7gK0jSZFjXXc5aXXa-481-481.png',
  },
  {
    name: '冠军溜冰场中华城店100元滑冰券（单券只可使用一次）',
    count: 100,
    image: 'https://gw.alicdn.com/tfs/TB1WnDoDW61gK0jSZFlXXXDKFXa-481-481.png',
  },
  {
    name: 'GAP（中华城店）全场正价商品5折券',
    count: 2000,
    image: 'https://gw.alicdn.com/tfs/TB1ElLlD7Y2gK0jSZFgXXc5OFXa-481-481.png',
  },
  {
    name: 'COODOO （中华城店）指定配件9折券',
    count: 500,
    image: 'https://gw.alicdn.com/tfs/TB1x_6kD7L0gK0jSZFAXXcA9pXa-481-481.png',
  },
  {
    name: 'Daniel Wellington （中华城店）满999减150元券',
    count: 500,
    image: 'https://gw.alicdn.com/tfs/TB1RY2kDYr1gK0jSZR0XXbP8XXa-481-481.png',
  },
  {
    name: 'PUMA（中华城店）全场5折券(单笔销售五折,不超过3000元）',
    count: 250,
    image: 'https://gw.alicdn.com/tfs/TB1xTYnDYj1gK0jSZFOXXc7GpXa-481-481.png',
  },
  {
    name:
      'fun（中华城店）满300元减50元（折扣与店铺同享，不能与其它优惠券一起使用，满300抵用一张，单笔只使用一张）',
    count: 200,
    image: 'https://gw.alicdn.com/tfs/TB1PHvnD4v1gK0jSZFFXXb0sXXa-481-481.png',
  },
  {
    name: '卡雷拉（中华城店）满100元减20元',
    count: 700,
    image: 'https://gw.alicdn.com/tfs/TB1lTLoDW61gK0jSZFlXXXDKFXa-481-481.png',
  },
  {
    name: '卡雷拉（中华城店）满100元减20元',
    count: 700,
    image: 'https://gw.alicdn.com/tfs/TB1wn6kD7L0gK0jSZFAXXcA9pXa-481-481.png',
  },
  {
    name: '川二代·原汁·把把烧满200元减100元',
    count: 491,
    image: 'https://gw.alicdn.com/tfs/TB1746nD.Y1gK0jSZFCXXcwqXXa-481-481.png',
  },
  {
    name: '厦门艾美酒店基础房型-高级房连住两晚优惠价888元（不含早餐）',
    count: 291,
    image: 'https://gw.alicdn.com/tfs/TB1b26kDYr1gK0jSZFDXXb9yVXa-481-481.png',
  },
  {
    name:
      '厦门日月谷温泉度假村中餐厅、西餐厅及月光亭餐厅20元现金券（满20.01元抵扣，每桌/次限用一张）',
    count: 391,
    image: 'https://gw.alicdn.com/tfs/TB16bDnD4v1gK0jSZFFXXb0sXXa-481-481.png',
  },
  {
    name:
      '厦门日月谷温泉度假村中餐厅、西餐厅及月光亭餐厅20元现金券（满20.01元抵扣，每桌/次限用一张）',
    count: 400,
    image: 'https://gw.alicdn.com/tfs/TB1refjD4z1gK0jSZSgXXavwpXa-481-481.png',
  },
  {
    name:
      '厦门日月谷温泉度假村中餐厅、西餐厅及月光亭餐厅20元现金券（满20.01元抵扣，每桌/次限用一张）',
    count: 400,
    image: 'https://gw.alicdn.com/tfs/TB1lY2oD4D1gK0jSZFyXXciOVXa-481-481.png',
  },
  {
    name:
      '厦门日月谷温泉度假村酒店客房散客价抵扣200元现金券（每人/次限用一张）',
    count: 400,
    image: 'https://gw.alicdn.com/tfs/TB13nYnDYj1gK0jSZFOXXc7GpXa-481-481.png',
  },
  {
    name: '7C CARDLE（七彩摇篮）全场七折券',
    count: 2000,
    image: 'https://gw.alicdn.com/tfs/TB1Q9TfDWL7gK0jSZFBXXXZZpXa-481-481.png',
  },
  {
    name: '7C CARDLE（七彩摇篮）吊牌价满200元减60元',
    count: 2000,
    image: 'https://gw.alicdn.com/tfs/TB1i1flD1H2gK0jSZFEXXcqMpXa-481-481.png',
  },
  {
    name: '7C CARDLE（七彩摇篮）吊牌价满200元减60元',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1k0_lD1H2gK0jSZFEXXcqMpXa-481-481.png',
  },
  {
    name: '招财晋宝山西菜馆鲜奶菠萝饼消费券一份',
    count: 80,
    image: 'https://gw.alicdn.com/tfs/TB1SFLjD4D1gK0jSZFsXXbldVXa-481-481.png',
  },
  {
    name: '招财晋宝山西菜馆鲜奶菠萝饼消费券一份',
    count: 600,
    image: 'https://gw.alicdn.com/tfs/TB1o4_nD7T2gK0jSZPcXXcKkpXa-481-481.png',
  },
  {
    name: '招财晋宝山西菜馆鲜奶菠萝饼消费券一份',
    count: 591,
    image: 'https://gw.alicdn.com/tfs/TB1jmrjD4n1gK0jSZKPXXXvUXXa-481-481.png',
  },
  {
    name: '老桐桉土菜馆同安封肉五折券',
    count: 60,
    image: 'https://gw.alicdn.com/tfs/TB1p2vbD1L2gK0jSZPhXXahvXXa-481-481.png',
  },
  {
    name: '厦门银河整形1980特惠卡（NIR+胶原微针+水光针+瘦脸针+DPL 项目五选三）',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1XrznD4v1gK0jSZFFXXb0sXXa-481-481.png',
  },
  {
    name: '厦门银河整形消费满10000元减3000元',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1fN2nD.Y1gK0jSZFCXXcwqXXa-481-481.png',
  },
  {
    name: '厦门银河整形植发6.8折券',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1irToD4D1gK0jSZFyXXciOVXa-481-481.png',
  },
  {
    name: '厦门银河整形价值3000元植发基金消费券',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB17hgyXicKOu4jSZKbXXc19XXa-481-481.png',
  },
  {
    name:
      '厦门银河整形2980元植发会员卡（购卡可享受5折植发优惠，赠送头皮检测+专利头皮保护套+4次头部水疗+4次头皮养护光疗+洗护产品）',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1E1blD1H2gK0jSZFEXXcqMpXa-481-481.png',
  },
  {
    name: '厦门诺卡健身俱乐部有限公司形馆健身房200元现金抵用券一张',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1abznD4v1gK0jSZFFXXb0sXXa-481-481.png',
  },
  {
    name: '厦门诺卡健身俱乐部有限公司形馆健身房200元现金抵用券一张',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1SWbnD4D1gK0jSZFKXXcJrVXa-481-481.png',
  },
  {
    name: '医世家500元现金券',
    count: 80,
    image: 'https://gw.alicdn.com/tfs/TB1ExgyXicKOu4jSZKbXXc19XXa-481-481.png',
  },
  {
    name: '医世家价值600元单节龙骨理疗消费券',
    count: 15,
    image: 'https://gw.alicdn.com/tfs/TB1TCLfDWL7gK0jSZFBXXXZZpXa-481-481.png',
  },
  {
    name: '医世家价值720元润白水密码消费券',
    count: 20,
    image: 'https://gw.alicdn.com/tfs/TB1k6HkD9f2gK0jSZFPXXXsopXa-481-481.png',
  },
  {
    name: '片仔癀体验店化妆品五折券',
    count: 394,
    image: 'https://gw.alicdn.com/tfs/TB1rn6kD7L0gK0jSZFAXXcA9pXa-481-481.png',
  },
  {
    name: '片仔癀体验店全场任意产品满1000元减300',
    count: 400,
    image: 'https://gw.alicdn.com/tfs/TB1OFPjD4D1gK0jSZFsXXbldVXa-481-481.png',
  },
  {
    name: '钰通源酒业法国原装原瓶进口干红堡恩格系列团购价八八折',
    count: 250,
    image: 'https://gw.alicdn.com/tfs/TB14_YnDYj1gK0jSZFOXXc7GpXa-481-481.png',
  },
  {
    name: '盈众汽车厦门区域8大品牌保养工时七折券',
    count: 791,
    image: 'https://gw.alicdn.com/tfs/TB1dCrjD4n1gK0jSZKPXXXvUXXa-481-481.png',
  },
  {
    name: '盈众汽车厦门区域8大品牌新车500元购车抵用券',
    count: 800,
    image: 'https://gw.alicdn.com/tfs/TB1fnjiD7L0gK0jSZFtXXXQCXXa-481-481.png',
  },
  {
    name: '盈众汽车厦门区域8大品牌新车500元购车抵用券',
    count: 160,
    image: 'https://gw.alicdn.com/tfs/TB1vTYkD7L0gK0jSZFAXXcA9pXa-481-481.png',
  },
  {
    name: '盈众汽车厦门区域8大品牌新车500元购车抵用券',
    count: 400,
    image: 'https://gw.alicdn.com/tfs/TB1zDYnDYj1gK0jSZFOXXc7GpXa-481-481.png',
  },
  {
    name:
      '如逸家纺产品三口之家婚庆系列、曼伦家纺四件套、珍珠鸟四件套、绿庭冬被、春秋被、空调被等满1000元减250元',
    count: 300,
    image: 'https://gw.alicdn.com/tfs/TB17zHiDVT7gK0jSZFpXXaTkpXa-481-481.png',
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
    name: '兴林家具城现代馆家具通用券满10000元减3000元（特价产品除外）',
    count: 300,
    image: 'https://gw.alicdn.com/tfs/TB1_9_iD7L0gK0jSZFtXXXQCXXa-481-481.png',
  },
  {
    name: '兴林家具城现代馆家具通用券满20000元减6400元（特价产品除外）',
    count: 300,
    image: 'https://gw.alicdn.com/tfs/TB1QCLfDWL7gK0jSZFBXXXZZpXa-481-481.png',
  },
  {
    name:
      '方心眼镜太阳镜、光学镜、老花眼镜、隐形眼镜、隐形眼镜护理液等折后消费每满100抵10',
    count: 250,
    image: 'https://gw.alicdn.com/tfs/TB1v8DlD7Y2gK0jSZFgXXc5OFXa-481-481.png',
  },
  {
    name: 'thank u mom（宝龙一城店）满100元减20元',
    count: 20,
    image: 'https://gw.alicdn.com/tfs/TB1iQHnDYY1gK0jSZTEXXXDQVXa-481-481.png',
  },
  {
    name: '留萌（宝龙一城店）自助火锅特价券138元/位（不与店铺其他活动同享）',
    count: 30,
    image: 'https://gw.alicdn.com/tfs/TB1i_PjD7P2gK0jSZPxXXacQpXa-481-481.png',
  },
  {
    name: '金橄榄（宝龙一城店）满200元减50元',
    count: 80,
    image: 'https://gw.alicdn.com/tfs/TB1ZnjoD1H2gK0jSZJnXXaT1FXa-481-481.png',
  },
  {
    name: '七匹狼服装门店50元春夏服装折后抵用券',
    count: 6000,
    image: 'https://gw.alicdn.com/tfs/TB10nLoDW61gK0jSZFlXXXDKFXa-481-481.png',
  },
  {
    name: '七匹狼服装门店全场折上九折券',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB17GbnD4D1gK0jSZFKXXcJrVXa-481-481.png',
  },
  {
    name:
      '七匹狼服装门店2450元夏装满减券包（800减150，1200减300，1500减400,2000减600,3000减1000）',
    count: 2491,
    image: 'https://gw.alicdn.com/tfs/TB1v2jiD2b2gK0jSZK9XXaEgFXa-481-481.jpg',
  },
  {
    name:
      '七匹狼EFC100元春夏工厂福利会津贴券包（10元裤子券、10元T恤券、20元新品T恤券、20元新品商务衬衫券、20元西服券）',
    count: 400,
    image: 'https://gw.alicdn.com/tfs/TB1MTjiD7L0gK0jSZFtXXXQCXXa-481-481.png',
  },
  {
    name:
      '豪客来牛排五一亲子套餐立省40元（喜马拉雅玫瑰盐牛排套餐+嘟嘟牛排套餐）',
    count: 2000,
    image: 'https://gw.alicdn.com/tfs/TB1KTjiD7L0gK0jSZFtXXXQCXXa-481-481.png',
  },
  // {
  //   name: '万元大礼包',
  //   count: 3,
  //   image:
  //     'https://gw.alicdn.com/tfs/TB1SgLiD2b2gK0jSZK9XXaEgFXa-2651-1761.jpg',
  // },
  // {
  //   count: 3,
  //   image:
  //     'https://gw.alicdn.com/tfs/TB1SgLiD2b2gK0jSZK9XXaEgFXa-2651-1761.jpg',
  // },
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
    const now = moment().format('HH:mm:ss');
    if (now > '12:21:44') {
      return 'null';
    }
    if (now < '12:12:00') {
      return 'noStart';
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
}
