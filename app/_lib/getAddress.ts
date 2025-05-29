export type response = {
  errorMessage: string;
  prefecture: string;
  city: string;
  suburb: string;
};

export type JsonResponse = {
  message: string;
  results: {
    address1: string;
    address2: string;
    address3: string;
    kana1: string;
    kana2: string;
    prefcode: string;
    zipcode: string;
  }[];
  status: string;
};

/**
 * getAddress
 * 郵便番号を条件に住所(都道府県・市区・町村)を取得します。
 * 現在、作成中・・・
 *
 * @param {string} postcode - 郵便番号
 * @returns {response} 住所(都道府県・市区・町村)
 */
export const kensaku = (postcode: string): response => {
  console.log('やほー！');

  // 入力文字数確認
  if (postcode.length !== 7) {
    return {
      errorMessage: '郵便番号を入力後、再度お試しください。',
      prefecture: '',
      city: '',
      suburb: '',
    };
  }

  // MEMO:市区被りの郵便番号
  // https://zipcloud.ibsnet.co.jp/api/search?zipcode=9070000

  // POSTくん（複数住所を取得できないので使わない）
  //   const url = `https://postcode.teraren.com/postcodes/${postcode}.json`;

  let res: response = { errorMessage: '', city: '', prefecture: '', suburb: '' };

  const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postcode}`;

  // 住所取得
  fetch(url)
    .then((response) => response.json())
    .then((json: JsonResponse) => {
      if (!json.results) {
        res = { ...res, errorMessage: '住所を取得できませんでした。番号をお確かめの上、再度お試しください。' };
        return;
      }
      // TODO:複数取得時のロジックを追加
      const prefecture = json.results[0].address1;
      const city = json.results[0].address2;
      const suburb = json.results[0].address3;
      const address = prefecture + city + suburb;
      console.log('address:' + address);
      if (!address) {
        res = { ...res, errorMessage: '住所を取得できませんでした。番号をお確かめの上、再度お試しください。' };
      } else {
        res = { ...res, prefecture, city, suburb: suburb };
      }
      return;
    })
    .catch((error) => {
      console.error(error);
      res = { ...res, errorMessage: '住所を取得できませんでした。番号をお確かめの上、再度お試しください。' };
    });
  return res;
};
