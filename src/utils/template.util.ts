import { Injectable, Global } from '@nestjs/common';
import { Pagination } from 'src/common/dto/pagination.dto';

@Injectable()
@Global()
export class TemplateUtil {
  constructor(
  ) { }

  /**
   * 生成加密数据
   *
   */
  toString(array: any[], seed: string) {
    let result: string = '';
    array.map((i, index) => {
      if (index < array.length - 1) {
        return result += `${i}${seed}`
      }
      result += i
    })
    return result
  }

  /**
   * 去重
   *
   */
  uniq(array: string[]) {
    const obj: any = {}
    const result: string[] = []
    for (const i of array) {
      if (!obj[i]) {
        result.push(i)
        obj[i] = 1
      }
    }
    return result
  }
}

