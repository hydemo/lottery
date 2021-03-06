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
import { RedisService } from 'nestjs-redis';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { UserService } from '../user/user.service';
import { CreateLotteryDTO } from './lottery.dto';

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
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满500元减250元(此优惠不可与酒店其它优惠同时使用)',
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
      '厦门瑞颐大酒店健身中心满600元减350元(此优惠不可与酒店其它优惠同时使用)',
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
    name:
      '厦门瑞颐逸居酒店会议厅满5000元减2500元(此优惠不可与酒店其它优惠同时使用)',
    count: 4,
    image: 'https://qn.imusheng.net/choujiang8.jpg',
  },
  {
    name:
      '厦门瑞颐逸居酒店会议厅满10000元减5500元(此优惠不可与酒店其它优惠同时使用)',
    count: 1,
    image: 'https://qn.imusheng.net/choujiang9.jpg',
  },
  {
    name:
      '厦门瑞颐逸居酒店客房豪华房净价480元一晚（含双早），可赠送一晚免费(此优惠不可与酒店其它优惠同时使用)',
    count: 51,
    image: 'https://qn.imusheng.net/choujiang10.jpg',
  },
  {
    name:
      '厦门瑞颐逸居酒店客房豪华童趣房净价840元一晚（含双早），可赠送一晚免费（需提前一天进行预订，此优惠不可与酒店其它优惠同时使用）',
    count: 20,
    image: 'https://qn.imusheng.net/choujiang11.jpg',
  },
  {
    name: '水融石（厦门）数字科技有限公司电梯广告流量电梯广告10000元现金抵用券',
    count: 11,
    image: 'https://gw.alicdn.com/tfs/TB1HuLmD7L0gK0jSZFxXXXWHVXa-481-481.png',
  },
  {
    name: '一叶舟小火锅（中华城店）50元无门槛现金券（单券只可使用一次）',
    count: 100,
    image: 'https://qn.imusheng.net/choujiang13.jpg',
  },
  {
    name: '冠军溜冰场中华城店100元滑冰券（单券只可使用一次）',
    count: 100,
    image: 'https://gw.alicdn.com/tfs/TB1WnDoDW61gK0jSZFlXXXDKFXa-481-481.png',
  },
  {
    name: 'GAP（中华城店）全场正价商品5折券',
    count: 2000,
    image: 'https://qn.imusheng.net/choujiang15.jpg',
  },
  {
    name: 'COODOO （中华城店）指定配件9折券',
    count: 500,
    image: 'https://qn.imusheng.net/choujiang103.png',
  },
  {
    name: 'Daniel Wellington （中华城店）满999减150元券',
    count: 500,
    image: 'https://qn.imusheng.net/choujiang17.jpg',
  },
  {
    name: 'PUMA（中华城店）全场5折券(单笔销售五折,不超过3000元）',
    count: 250,
    image: 'https://qn.imusheng.net/choujiang100.png',
  },
  {
    name:
      'fun（中华城店）满300元减50元（折扣与店铺同享，不能与其它优惠券一起使用，满300抵用一张，单笔只使用一张）',
    count: 200,
    image: 'https://qn.imusheng.net/choujiang19.jpg',
  },
  {
    name: '卡雷拉（中华城店）满100元减20元',
    count: 700,
    image: 'https://qn.imusheng.net/choujiang104.png',
  },
  {
    name: '高兴的小鸟（中华城店）满100元减20元',
    count: 700,
    image: 'https://qn.imusheng.net/choujiang105.png',
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
      '厦门日月谷温泉度假村舒逸馆SPA按摩50元现金券（满50.01元抵扣，每人/次限用一张）',
    count: 400,
    image: 'https://gw.alicdn.com/tfs/TB1refjD4z1gK0jSZSgXXavwpXa-481-481.png',
  },
  {
    name:
      '厦门日月谷温泉度假村温泉公园门票散客价抵扣150元现金券（每人/次限用一张）',
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
    image: 'https://qn.imusheng.net/choujiang28.jpg',
  },
  {
    name: '7C CARDLE（七彩摇篮）吊牌价满200元减60元',
    count: 2000,
    image: 'https://qn.imusheng.net/choujiang29.jpg',
  },
  {
    name: '洪记鲜粥猫仔粥消费券一份',
    count: 40,
    image: 'https://gw.alicdn.com/tfs/TB1k0_lD1H2gK0jSZFEXXcqMpXa-481-481.png',
  },
  {
    name: '招财晋宝山西菜馆鲜奶菠萝饼消费券一份',
    count: 80,
    image: 'https://qn.imusheng.net/choujiang31.jpg',
  },
  {
    name: '财神到海沧店炒钉螺消费券一份',
    count: 600,
    image: 'https://gw.alicdn.com/tfs/TB1o4_nD7T2gK0jSZPcXXcKkpXa-481-481.png',
  },
  {
    name: '财神到莲花店烤串套餐五折券',
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
    image: 'https://qn.imusheng.net/choujiang106.png',
  },
  {
    name: '厦门银河整形消费满10000元减3000元',
    count: 40,
    image: 'https://qn.imusheng.net/choujiang40.jpg',
  },
  {
    name: '厦门银河整形植发6.8折券',
    count: 40,
    image: 'https://qn.imusheng.net/choujiang41.jpg',
  },
  {
    name: '厦门银河整形价值3000元植发基金消费券',
    count: 40,
    image: 'https://qn.imusheng.net/choujiang42.jpg',
  },
  {
    name:
      '厦门银河整形2980元植发会员卡（购卡可享受5折植发优惠，赠送头皮检测+专利头皮保护套+4次头部水疗+4次头皮养护光疗+洗护产品）',
    count: 40,
    image: 'https://qn.imusheng.net/choujiang43.jpg',
  },
  {
    name: '形馆健身房200元现金抵用券一张',
    count: 40,
    image: 'https://qn.imusheng.net/choujiang102.png',
  },
  {
    name: '形馆健身房300元现金抵用券一张',
    count: 40,
    image: 'https://qn.imusheng.net/choujiang101.png',
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
    image: 'https://qn.imusheng.net/choujiang108.png',
  },
  {
    name: '片仔癀体验店全场任意产品满1000元减260',
    count: 400,
    image: 'https://qn.imusheng.net/choujiang107.png',
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
    name: '厦门易新二手车二手车1000元购车抵用券',
    count: 160,
    image: 'https://gw.alicdn.com/tfs/TB1vTYkD7L0gK0jSZFAXXcA9pXa-481-481.png',
  },
  {
    name: '醉堂酒业旗下葡萄牙酒庄公牛系列红葡萄酒满1000元减300元',
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
    image: 'https://qn.imusheng.net/choujiang59.jpg',
  },
  {
    name: '留萌（宝龙一城店）自助火锅特价券138元/位（不与店铺其他活动同享）',
    count: 30,
    image: 'https://qn.imusheng.net/choujiang60.jpg',
  },
  {
    name: '金橄榄（宝龙一城店）满200元减50元',
    count: 80,
    image: 'https://qn.imusheng.net/choujiang61.jpg',
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
  // 二期
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
    name:
      '厦门瑞颐逸居酒店会议厅满5000元减2500元(此优惠不可与酒店其它优惠同时使用)',
    count: 6,
    image: 'https://qn.imusheng.net/choujiang8.jpg',
  },
  {
    name: '厦门瑞颐逸居酒店会议厅满10000元减5500元（不与酒店其他优惠同时使用）',
    count: 1,
    image: 'https://qn.imusheng.net/choujiang9.jpg',
  },
  {
    name:
      '厦门瑞颐逸居酒店客房豪华房净价480元一晚（含双早），可赠送一晚免费（不与酒店其他优惠同时使用）',
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
    image: 'https://qn.imusheng.net/choujiang100.png',
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
    image: 'https://qn.imusheng.net/choujiang101.png',
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
  // 三期
  {
    name:
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满100元减30元(此优惠不可与酒店其它优惠同时使用)',
    count: 138,
    image: 'https://qn.imusheng.net/choujiangsanqi2.png',
  },
  {
    name:
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满300元减120元(此优惠不可与酒店其它优惠同时使用)',
    count: 45,
    image: 'https://qn.imusheng.net/choujiangsanqi3.png',
  },
  {
    name:
      '厦门瑞颐大酒店琴岸咖啡厅、中餐厅、逸趣酒廊满500元减250元(此优惠不可与酒店其它优惠同时使用)',
    count: 159,
    image: 'https://qn.imusheng.net/choujiangsanqi4.png',
  },
  {
    name:
      '瑞颐大酒店2楼琴岸咖啡厅自助午/晚餐人民币158元/一大一小（1.4米以下儿童）此优惠不可与酒店其它优惠同时使用。使用须知：1、需要在使用前1天的18:00前进行预约，在有效期内方可使用。2、超过1.4米的儿童请多买一份。',
    count: 125,
    image: 'https://qn.imusheng.net/choujiangsanqi5.jpg',
  },
  {
    name:
      '厦门瑞颐大酒店健身中心满300元减150元(此优惠不可与酒店其它优惠同时使用)',
    count: 9,
    image: 'https://qn.imusheng.net/choujiangsanqi6.png',
  },
  {
    name:
      '厦门瑞颐大酒店健身中心满600元减350元(此优惠不可与酒店其它优惠同时使用)',
    count: 71,
    image: 'https://qn.imusheng.net/choujiangsanqi7.png',
  },
  {
    name:
      '厦门瑞颐大酒店豪华城景房888元买一送一特惠（需连住两晚，使用后不可变更与退款,不含早,需提前一天进行预订,此优惠不可与酒店其它优惠同时使用）',
    count: 43,
    image: 'https://qn.imusheng.net/choujiangsanqi8.png',
  },
  {
    name:
      '厦门瑞颐逸居酒店会议厅满5000元减2500元(此优惠不可与酒店其它优惠同时使用)',
    count: 3,
    image: 'https://qn.imusheng.net/choujiangsanqi9.jpg',
  },
  {
    name:
      '厦门瑞颐逸居酒店客房豪华房净价480元一晚（含双早），可赠送一晚免费（不与酒店其他优惠同时使用）',
    count: 15,
    image: 'https://qn.imusheng.net/choujiangsanqi10.jpg',
  },
  {
    name: '一叶舟小火锅（中华城店）50元无门槛现金券（单券只可使用一次）',
    count: 143,
    image: 'https://qn.imusheng.net/choujiangsanqi11.jpg',
  },
  {
    name: '冠军溜冰场中华城店100元滑冰券（单券只可使用一次）',
    count: 129,
    image: 'https://qn.imusheng.net/choujiangsanqi12.png',
  },
  {
    name: 'PUMA（中华城店）全场5折券(单笔销售五折,不超过3000元）',
    count: 81,
    image: 'https://qn.imusheng.net/choujiangsanqi13.png',
  },
  {
    name:
      'fun（中华城店）满300元减50元（折扣与店铺同享，不能与其它优惠券一起使用，满300抵用一张，单笔只使用一张）',
    count: 105,
    image: 'https://qn.imusheng.net/choujiangsanqi14.jpg',
  },
  {
    name: '高兴的小鸟（中华城店）满100元减20元',
    count: 651,
    image: 'https://qn.imusheng.net/choujiangsanqi15.png',
  },
  {
    name: '西贝（中华城店）消费100元返50元代金券（只限堂食和外带）',
    count: 835,
    image: 'https://qn.imusheng.net/choujiangsanqi16.jpg',
  },
  {
    name: '蓝蛙（中华城店）经典单人汉堡套餐，原价：128元，现价：78元 ',
    count: 655,
    image: 'https://qn.imusheng.net/choujiangsanqi17.jpg',
  },
  {
    name: '蓝蛙（中华城店）蓝蛙踏春双人套餐，原价：432元，现价：268元 ',
    count: 667,
    image: 'https://qn.imusheng.net/choujiangsanqi18.jpg',
  },
  {
    name: '桃园眷村（中华城店）品质早餐九块九（每人仅限选择一样）',
    count: 672,
    image: 'https://qn.imusheng.net/choujiangsanqi19.jpg',
  },
  {
    name:
      '中华城20元美妆通用券，满200使用，单笔限用一张参与品牌： LANCOME、BOBBI BROWN、SULWHASOO 、SK-II 、KIEHL’S、SHU UEMURA 、ORIGINS、CLINIQUE、 LANEIGE、 L’OCCITANE、 MAKE UP FOR EVER 、GIVENCHY 、MAC、ESTEE LAUDER、ARMANI、CPB、SHISEIDO、YSL、FRESH、FANCL、IPSA',
    count: 1321,
    image: 'https://qn.imusheng.net/choujiangsanqi20-1.png',
  },
  {
    name: '川二代·原汁·把把烧满200元减100元',
    count: 329,
    image: 'https://qn.imusheng.net/choujiangsanqi21.png',
  },
  {
    name: '厦门艾美酒店基础房型-高级房连住两晚优惠价888元（不含早餐）',
    count: 300,
    image: 'https://qn.imusheng.net/choujiangsanqi22.png',
  },
  {
    name: '7C CARDLE（七彩摇篮）全场七折券',
    count: 959,
    image: 'https://qn.imusheng.net/choujiangsanqi23.jpg',
  },
  {
    name: '尚柏奥莱7C CARDLE（七彩摇篮）吊牌价满200元减60',
    count: 2960,
    image: 'https://qn.imusheng.net/choujiangsanqi24.jpg',
  },
  {
    name: '洪记鲜粥猫仔粥消费券一份',
    count: 50,
    image: 'https://qn.imusheng.net/choujiangsanqi25.png',
  },
  {
    name: '财神到海沧店炒钉螺消费券一份',
    count: 655,
    image: 'https://qn.imusheng.net/choujiangsanqi26.png',
  },
  {
    name: '财神到莲花店烤串套餐五折券',
    count: 652,
    image: 'https://qn.imusheng.net/choujiangsanqi27.png',
  },
  {
    name: '老桐桉土菜馆同安封肉五折券',
    count: 40,
    image: 'https://qn.imusheng.net/choujiangsanqi28.png',
  },
  {
    name: '雀越餐厅皇咖喱牛肉五折券',
    count: 100,
    image: 'https://qn.imusheng.net/choujiangsanqi29.jpg',
  },
  {
    name: '厦门银河整形1980特惠卡（NIR+胶原微针+水光针+瘦脸针+DPL 项目五选三）',
    count: 10,
    image: 'https://qn.imusheng.net/choujiangsanqi30.png',
  },
  {
    name: '厦门银河整形消费满10000元减3000元',
    count: 10,
    image: 'https://qn.imusheng.net/choujiangsanqi31.jpg',
  },
  {
    name: '厦门银河整形植发6.8折券',
    count: 10,
    image: 'https://qn.imusheng.net/choujiangsanqi32.jpg',
  },
  {
    name: '厦门银河整形价值3000元植发基金消费券',
    count: 10,
    image: 'https://qn.imusheng.net/choujiangsanqi33.jpg',
  },
  {
    name:
      '厦门银河整形2980元植发会员卡（购卡可享受5折植发优惠，赠送头皮检测+专利头皮保护套+4次头部水疗+4次头皮养护光疗+洗护产品）',
    count: 10,
    image: 'https://qn.imusheng.net/choujiangsanqi34.jpg',
  },
  {
    name: '形馆健身房300元现金抵用券一张',
    count: 24,
    image: 'https://qn.imusheng.net/choujiangsanqi35.png',
  },
  {
    name: '医世家500元现金券',
    count: 7,
    image: 'https://qn.imusheng.net/choujiangsanqi36.png',
  },
  {
    name: '医世家价值600元单节龙骨理疗消费券',
    count: 4,
    image: 'https://qn.imusheng.net/choujiangsanqi37.png',
  },
  {
    name: '片仔癀体验店化妆品五折券',
    count: 100,
    image: 'https://qn.imusheng.net/choujiangsanqi38.png',
  },
  {
    name: '片仔癀体验店全场任意产品满1000元减260元',
    count: 100,
    image: 'https://qn.imusheng.net/choujiangsanqi39.png',
  },
  {
    name: '厦门乐莲乐生物科技有限公司免费获得价值598元莲乐纯金线莲茶一份',
    count: 7,
    image: 'https://qn.imusheng.net/choujiangsanqi40.png',
  },
  {
    name: '厦门乐莲乐生物科技有限公司满200元减50',
    count: 50,
    image: 'https://qn.imusheng.net/choujiangsanqi41.png',
  },
  {
    name: '钰通源酒业法国原装原瓶进口干红堡恩格系列团购价八八折',
    count: 500,
    image: 'https://qn.imusheng.net/choujiangsanqi42.png',
  },
  {
    name: '盈众汽车厦门区域8大品牌保养工时七折券',
    count: 58,
    image: 'https://qn.imusheng.net/choujiangsanqi43.png',
  },
  {
    name: '厦门易新二手车二手车1000元购车抵用券',
    count: 126,
    image: 'https://qn.imusheng.net/choujiangsanqi44.png',
  },
  {
    name: '醉堂酒业旗下葡萄牙酒庄公牛系列红葡萄酒满1000元减300元',
    count: 335,
    image: 'https://qn.imusheng.net/choujiangsanqi45.png',
  },
  {
    name: '醉堂酒业旗下葡萄牙酒庄澳洲奔富系列389、407产品满3000元减1000元',
    count: 5,
    image: 'https://qn.imusheng.net/choujiangsanqi46.png',
  },
  {
    name:
      '如逸家纺产品三口之家婚庆系列、曼伦家纺四件套、珍珠鸟四件套、绿庭冬被、春秋被、空调被等满1000元减250元',
    count: 700,
    image: 'https://qn.imusheng.net/choujiangsanqi47.png',
  },
  {
    name: '兴林灯饰城灯饰通用券满2000元减200元（特价产品除外）',
    count: 43,
    image: 'https://qn.imusheng.net/choujiangsanqi48.png',
  },
  {
    name: '兴林家具城红木家具通用券满10000元减3000元（特价产品除外）',
    count: 53,
    image: 'https://qn.imusheng.net/choujiangsanqi49.png',
  },
  {
    name: '兴林家具城红木家具通用券满20000元减6400元（特价产品除外）',
    count: 56,
    image: 'https://qn.imusheng.net/choujiangsanqi50.png',
  },
  {
    name: '兴林家具城现代馆家具通用券满10000元减3000元（特价产品除外）',
    count: 200,
    image: 'https://qn.imusheng.net/choujiangsanqi51.png',
  },
  {
    name: '兴林家具城现代馆家具通用券满20000元减6400元（特价产品除外）',
    count: 200,
    image: 'https://qn.imusheng.net/choujiangsanqi52.png',
  },
  {
    name:
      '方心眼镜太阳镜、光学镜、老花眼镜、隐形眼镜、隐形眼镜护理液等折后消费每满100抵10',
    count: 16,
    image: 'https://qn.imusheng.net/choujiangsanqi53.png',
  },
  {
    name: 'thank u mom（宝龙一城店）满100元减20元',
    count: 4,
    image: 'https://qn.imusheng.net/choujiangsanqi54.jpg',
  },
  {
    name: '留萌（宝龙一城店）自助火锅特价券138元/位（不与店铺其他活动同享）',
    count: 6,
    image: 'https://qn.imusheng.net/choujiangsanqi55.jpg',
  },
  {
    name: '金橄榄（宝龙一城店）满200元减50元',
    count: 6,
    image: 'https://qn.imusheng.net/choujiangsanqi56.jpg',
  },
  {
    name: '七匹狼服装门店50元春夏服装折后抵用券',
    count: 1323,
    image: 'https://qn.imusheng.net/choujiangsanqi57.png',
  },
  {
    name: '七匹狼服装门店全场折上九折券',
    count: 3,
    image: 'https://qn.imusheng.net/choujiangsanqi58.png',
  },
  {
    name:
      '七匹狼服装门店2450元夏装满减券包（800减150，1200减300，1500减400,2000减600,3000减1000）',
    count: 2500,
    image: 'https://qn.imusheng.net/choujiangsanqi59.jpg',
  },
  {
    name:
      '七匹狼EFC100元春夏工厂福利会津贴券包（10元裤子券、10元T恤券、20元新品T恤券、20元新品商务衬衫券、20元西服券）',
    count: 100,
    image: 'https://qn.imusheng.net/choujiangsanqi60.png',
  },
  {
    name: '福建米亚贸易有限公司价值208元西班牙葡萄酒消费券一份',
    count: 20,
    image: 'https://qn.imusheng.net/choujiangsanqi61.png',
  },
  {
    name: '福建米亚贸易有限公司任选酒类产品5折劵',
    count: 30,
    image: 'https://qn.imusheng.net/choujiangsanqi62.png',
  },
  {
    name: '厦门兆联实业有限公司汾酒青花系列2500元减500元',
    count: 200,
    image: 'https://qn.imusheng.net/choujiangsanqi63.jpg',
  },
  {
    name: '厦门兆联实业有限公司汾酒海峡情系列1000元减200元',
    count: 200,
    image: 'https://qn.imusheng.net/choujiangsanqi64.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店网络公开价100元抵用券，所有房型通用',
    count: 338,
    image: 'https://qn.imusheng.net/choujiangsanqi65.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店网络公开价豪华湾景房200元抵用券',
    count: 173,
    image: 'https://qn.imusheng.net/choujiangsanqi66.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店网络公开价300元套房抵用券',
    count: 156,
    image: 'https://qn.imusheng.net/choujiangsanqi67.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店自助晚餐门市价7折券',
    count: 499,
    image: 'https://qn.imusheng.net/choujiangsanqi68.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店中餐满1000元减250元',
    count: 296,
    image: 'https://qn.imusheng.net/choujiangsanqi69.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店康乐健身游泳次卡门市价2.5折券',
    count: 608,
    image: 'https://qn.imusheng.net/choujiangsanqi70.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店会议场租满10000元减3000元',
    count: 21,
    image: 'https://qn.imusheng.net/choujiangsanqi71.jpg',
  },
  {
    name: '厦门特房波特曼七星湾酒店宴会500元抵用券（一次性消费5桌及以上可用）',
    count: 339,
    image: 'https://qn.imusheng.net/choujiangsanqi72.jpg',
  },
  {
    name: '外图厦门书城全场图书单笔消费满100元减30元（不与其他优惠同时使用）',
    count: 2300,
    image: 'https://qn.imusheng.net/choujiangsanqi73.jpg',
  },
  {
    name: '外图厦门书城100元实体书券（不与其他优惠同时使用）',
    count: 5,
    image: 'https://qn.imusheng.net/choujiangsanqi74.jpg',
  },
  {
    name: '艾草香包一个（自提）',
    count: 200,
    image: 'https://qn.imusheng.net/choujiangsanqi75.jpg',
  },
  {
    name:
      '厦门泰和康复医院 298元/次现代肩颈循环促进套餐200元抵扣券（内含1.现代理疗设备辅助项目4选2：电脉冲肌肉舒缓治疗20min、动态神经干扰治疗20min、超声波介入调理15min、特定电磁波治疗10min；2.头颈部推拿放松项目3选1：头部筋膜放松25min、肩颈僵硬舒缓25min、头颈经络疏通25min）',
    count: 30,
    image: 'https://qn.imusheng.net/choujiangsanqi76.jpg',
  },
  {
    name:
      '厦门泰和康复医院 298元/次传统肩颈损伤修复套餐200元抵扣券（内含1.古法针灸治疗项目2选1：古法头部针刺30min、古法肩颈针刺30min）；2.头颈部推拿放松项目4选2：肩颈部穴位拔罐10min、颈背部经络刮痧15min、古法经络推拿15min、古法肩颈艾灸15min',
    count: 30,
    image: 'https://qn.imusheng.net/choujiangsanqi77.jpg',
  },
  {
    name:
      '厦门泰和康复医院 298元/次私人定制古法暖宫套餐200元抵扣券（项目五选三：腰腹穴位针刺30min，肝肾调理艾灸25min，经络疏通刮痧15min，古法暖宫推拿25min，生物陶瓷袋暖宫治疗10min） ',
    count: 30,
    image: 'https://qn.imusheng.net/choujiangsanqi78.jpg',
  },
  {
    name:
      '厦门泰和康复医院 398元/次私人定制脊柱保养套餐250元抵扣券（项目四选三：古法手指点穴，颈肩部经络推拿，古法脊柱艾灸，现代脊柱调理） ',
    count: 30,
    image: 'https://qn.imusheng.net/choujiangsanqi79.jpg',
  },
  {
    name: '中达电商园1楼农产品展厅全场8.8折券',
    count: 50,
    image: 'https://qn.imusheng.net/choujiangsanqi80.jpg',
  },
  {
    name: '中达电商园1楼农产品展厅全场满200-20',
    count: 50,
    image: 'https://qn.imusheng.net/choujiangsanqi81.jpg',
  },
  {
    name: '中达电商园1楼农产品展厅全场满500-80',
    count: 50,
    image: 'https://qn.imusheng.net/choujiangsanqi82.jpg',
  },
  {
    name: '中达电商园1楼农产品展厅全场满300送枣夹核桃250g',
    count: 50,
    image: 'https://qn.imusheng.net/choujiangsanqi83.jpg',
  },
  {
    name: '万元大礼包3',
    count: 3,
    image: 'https://qn.imusheng.net/choujiangsanqi84.jpg',
  },
  {
    name: '万元大礼包2',
    count: 3,
    image: 'https://qn.imusheng.net/choujiangsanqi85.jpeg',
  },
  {
    name: '万元大礼包1',
    count: 2,
    image: 'https://qn.imusheng.net/choujiangsanqi86.jpeg',
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
    if (moment().format('YYYY-MM-DD HH:mm:ss') < '2020-05-08 12:12:00') {
      return 'noStart';
    }
    // if (moment().format('YYYY-MM-DD HH:mm:ss') > '2020-05-04 12:36:51') {
    //   return 'null';
    // }

    const client = this.redis.getClient();
    const lua =
      "local count = redis.call('hget','lottery_count',KEYS[1]);\n" +
      "if(count and count =='3') then\n" +
      "return 'exist';\n" +
      'else\n' +
      "local lottery = redis.call('rpop', 'lotteryreward');\n" +
      'if lottery then\n' +
      'local lottery_json = cjson.decode(lottery)\n' +
      'local lottery_set = {reward=lottery_json.reward,code=lottery_json.code,time=KEYS[2]}\n' +
      "redis.call('hincrby','lottery_count',KEYS[1],1);\n" +
      "local lottery_get = redis.call('hget', 'lottery_get',KEYS[1]);\n" +
      'if lottery_get then\n' +
      'local lottery_user = cjson.decode(lottery_get)\n' +
      "if(count and count =='1') then\n" +
      'lottery_user[2]=lottery_set\n' +
      'else\n' +
      'lottery_user[3]=lottery_set\n' +
      'end\n' +
      "redis.call('hset','lottery_get',KEYS[1],cjson.encode(lottery_user));\n" +
      'else\n' +
      'local lottery_user = {lottery_set}\n' +
      "redis.call('hset','lottery_get',KEYS[1],cjson.encode(lottery_user));\n" +
      'end\n' +
      'return lottery\n' +
      'else\n' +
      'return nil\n' +
      'end\n' +
      'end\n';
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const result = await client.eval(lua, 2, user, now);
    if (!result) {
      return 'null';
    }
    if (result === 'exist') {
      return 'exist';
    }
    return JSON.parse(result);
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
      .lean()
      .exec();
    const total = await this.lotteryModel.countDocuments(condition);
    return { list, total };
  }

  // 用户抽奖结果列表
  async listByUser(user: string): Promise<ILottery[]> {
    const condition = { user };
    const list = await this.lotteryModel
      .find(condition)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    const client = this.redis.getClient();
    const redisList = await client.hget('_get', `lottery${user}`);
    if (redisList) {
      const newList = JSON.parse(redisList);
      return [...newList, ...list];
    }
    return list;
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
    for (let i = 120; i < data.length; i++) {
      const lottery = data[i];
      for (let j = 0; j < lottery.count; j++) {
        const code = this.genCode(codes);
        codes.push(code);
        rewards.push({
          reward: i + 1,
          code,
        });
      }
    }
    const newRewards = this.shuffle(rewards);
    await Promise.all(
      newRewards.map(async newReward => {
        await client.rpush('reward', JSON.stringify(newReward));
      }),
    );
  }

  async genUserLoggery() {
    const client = this.redis.getClient();
    const keys = await client.hkeys('_get');
    const addList: any = [];
    await Promise.all(
      keys.map(async key => {
        const redisList = await client.hget('_get', key);
        if (redisList) {
          const newList = JSON.parse(redisList);
          for (const lottery of newList) {
            const newLottery: CreateLotteryDTO = {
              code: lottery.code,
              reward: lottery.reward,
              user: key.replace('lottery', ''),
              createdAt: lottery.time.replace('lottery', ''),
            };
            addList.push(newLottery);
            // await this.lotteryModel.create(newLottery);
          }

          // await client.hdel('_get', key);
        }
      }),
    );
  }

  // 下载
  async download(path: string) {
    const filename = `${uuid()}.xlsx`;
    const pathExist = fs.existsSync(path);
    if (!pathExist) {
      fs.mkdirSync(path);
    }
    const condition: any = { reward: { $gt: 65 } };
    // if (reward) {
    //   condition.reward = reward;
    // }
    const lotterys: ILottery[] = await this.lotteryModel
      .find(condition)
      .sort({ reward: 1 })
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
    // let count = 0;
    // data.map(da => (count += da.count));
    // console.log(data.length, count, 'sss');
    const list = await this.lotteryModel.find({ reward: { $gt: 65 } });
    const existData: any = {};
    const codes: string[] = [];
    list.map(li => {
      codes.push(li.code);
      const exist = existData[li.reward];
      if (exist) {
        existData[li.reward] = exist + 1;
      } else {
        existData[li.reward] = 1;
      }
    });
    const newList: any = [];
    for (let i = 66; i <= data.length; i++) {
      const count = existData[i];
      const ori = data[i - 1];
      let length = ori.count;
      if (count) {
        length = ori.count - count;
      }
      for (let j = 0; j < length; j++) {
        const code = this.genCode(codes);
        codes.push(code);
        const seed = Math.floor(Math.random() * 1791);
        const newLottery: CreateLotteryDTO = {
          user: String(Types.ObjectId()),
          reward: i,
          code,
          cache: true,
          createdAt: moment('2020-05-04 12:12:00').add(seed, 's'),
        };
        newList.push(newLottery);
      }
    }
    const randomList = this.shuffle(newList);
    const addList = randomList
      .map((ran, index) => {
        if (index > 4) {
          return null;
        } else {
          return ran;
        }
      })
      .filter(v => v);
    await Promise.all(
      addList.map(async ss => await this.lotteryModel.create(ss)),
    );
  }
}
