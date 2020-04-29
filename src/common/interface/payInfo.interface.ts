import { string } from "joi";

export interface IPayInfo {

  readonly fee: number;

  readonly openId: string;

  readonly orderId: string;


}
