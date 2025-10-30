import { hasDuplicate } from './utils';

/**
 * 郵便番号検索結果
 */
export type AddressResponse = {
  errorMessage: string;
  prefecture: string;
  city: string;
  suburb: string;
};

/**
 * Zipcloud JsonType
 */
export type JsonResponse = {
  message: string | null;
  results:
    | {
        address1: string;
        address2: string;
        address3: string;
        kana1: string;
        kana2: string;
        prefcode: string;
        zipcode: string;
      }[]
    | null;
  status: string;
};

/**
 * getAddress
 * 郵便番号を条件に住所(都道府県・市区・町村)を取得します。
 * 現在、作成中・・・
 *
 * @param {string} postcode - 郵便番号
 * @returns {AddressResponse} 住所(都道府県・市区・町村)
 */
export const getAddress = async (postcode: string): Promise<AddressResponse> => {
  // 入力文字数確認
  if (postcode.length !== 7) {
    return {
      city: '',
      prefecture: '',
      suburb: '',
      errorMessage: '郵便番号7桁を入力後、再度お試しください。',
    };
  }

  // MEMO:市区被りの郵便番号
  // https://zipcloud.ibsnet.co.jp/api/search?zipcode=9070000

  // POSTくん（複数住所を取得できないので使わない）
  // const url = `https://postcode.teraren.com/postcodes/${postcode}.json`;

  const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postcode}`;

  // 住所取得
  const res: AddressResponse = await fetch(url)
    .then((response) => response.json())
    .then((json: JsonResponse) => {
      if (!json.results) {
        console.log(json.message);
        return {
          errorMessage: '住所を取得できませんでした。郵便番号をお確かめの上、再度お試しください。',
          prefecture: '',
          city: '',
          suburb: '',
        };
      }
      if (json.results.length === 1) {
        console.log(json.results[0]);
        return {
          errorMessage: '',
          prefecture: json.results[0].address1,
          city: json.results[0].address2,
          suburb: json.results[0].address3,
        };
      } else {
        // 重複結果を返却する
        if (hasDuplicate(json.results, 'address1') || hasDuplicate(json.results, 'address2')) {
          return {
            errorMessage: '',
            prefecture: json.results[0].address1,
            city: '',
            suburb: '',
          };
        } else if (hasDuplicate(json.results, 'address3')) {
          return {
            errorMessage: '',
            prefecture: json.results[0].address1,
            city: json.results[0].address2,
            suburb: '',
          };
        } else {
          return {
            errorMessage: '',
            prefecture: json.results[0].address1,
            city: json.results[0].address2,
            suburb: json.results[0].address3,
          };
        }
      }
    })
    .catch((error) => {
      console.error(error);
      return { ...res, errorMessage: '住所を取得できませんでした。郵便番号をお確かめの上、再度お試しください。' };
    });

  console.log('返却値:', res);
  return res;
};
