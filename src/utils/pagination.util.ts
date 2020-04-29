import { Injectable, Global } from '@nestjs/common';
import * as moment from 'moment'
import { Pagination } from 'src/common/dto/pagination.dto';

@Injectable()
@Global()
export class PaginationUtil {
  constructor(
  ) { }

  /**
   * 生成加密数据
   *
   */
  genCondition(pagination: Pagination, keywords: string[], rangePickerKey?: string): any {
    const search: any = []
    const condition: any = {};
    const { filter, value } = pagination
    if (value) {
      const reg = new RegExp(value, 'i')
      keywords.map(key => {
        const regCondition: any = {}
        regCondition[key] = reg
        search.push(regCondition);

      })
    }
    if (filter) {
      const filterParse = JSON.parse(filter)
      for (const key in filterParse) {
        if (key === 'rangePicker') {
          if (rangePickerKey && filterParse[key].length === 2) {
            condition[rangePickerKey] = {
              $gte: moment(filterParse[key][0]).startOf('d'),
              $lte: moment(filterParse[key][1]).endOf('d')
            }
          }
        } else if (filterParse[key] || filterParse[key] === 0 || filterParse[key] === false) {
          condition[key] = filterParse[key];

        }
      }
    }
    if (search.length) {
      condition.$or = search;
    }
    return condition

  }

}

