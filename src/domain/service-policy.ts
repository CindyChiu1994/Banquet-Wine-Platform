export const budgetLimit=(budget:number):bigint=>{if(!Number.isSafeInteger(budget)||budget<1)throw Error('預算須為正安全整數');return BigInt(budget)*105n/100n;};
export function proposalAmount(p:{items:{quantity:number;price:number}[];shipping:number}){const amount=p.items.reduce((n,w)=>n+w.quantity*w.price,0)+p.shipping;if(!Number.isSafeInteger(amount)||amount<0)throw Error('提案金額超出可處理範圍');return amount;}
export function withinBudget(p:{items:{quantity:number;price:number}[];shipping:number},budget:number){return BigInt(proposalAmount(p))<=budgetLimit(budget);}
export const moneyText=(n:number|bigint)=>'NT$ '+n.toLocaleString('zh-TW');
const quoted=/(?:NT\s*[$＄]|NTD|新[臺台]幣)|\d[\d,]*(?:\.\d+)?\s*元|(?:報價|單價|運費|配送費|運送費)\s*[:：]?\s*\d|分潤|佣金|\d+\s*%|免運/iu;
export function validatePublicText(texts:string[]){if(texts.some(s=>quoted.test(s)))throw Error('價格請填在內部金額欄位；搭配理由、備酒條件及備貨限制不可填報價或分潤。');}
export function redactCommerce(s:string,hidePrices:boolean){let text=s.replace(/[^。\n]*(?:分潤|佣金|待結算|成本登錄)[^。\n]*/gu,'');if(hidePrices)text=text.replace(/(?:(?:NT\s*[$＄]|NTD|新[臺台]幣)\s*[\d,.]+|[\d,.]+\s*元|免運)/giu,'價格於現場確認');return text;}
