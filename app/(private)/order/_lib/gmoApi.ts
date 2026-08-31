'use server';
/**
 * ⑤ 取引登録 (EntryTran)
 * 決済の枠を作成し、AccessIDを取得します。
 */
// export const entryTranGmo = async (orderId: string, amount: number) => {
//   // const baseUrl = 'https://pt01.mul-pay.jp';
//   const baseUrl = 'https://p01.mul-pay.jp';
//   const shopId = 'tshop00076633';
//   const shopPass = 'as5fkaw2'; // ★ご提示いただいたパスワード

//   const params = new URLSearchParams();
//   params.append('ShopID', shopId);
//   params.append('ShopPass', shopPass);
//   params.append('OrderID', orderId);
//   params.append('Amount', String(amount));
//   params.append('JobCd', 'CAPTURE'); // 即時売上

//   try {
//     const response = await fetch(`${baseUrl}/payment/EntryTran.idPass`, {
//       method: 'POST',
//       body: params,
//     });
//     const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
//     const resParams = new URLSearchParams(text);

//     return {
//       success: !resParams.get('ErrCode'),
//       accessId: resParams.get('AccessID'),
//       accessPass: resParams.get('AccessPass'),
//       errInfo: resParams.get('ErrInfo'),
//     };
//   } catch (e) {
//     return { success: false, errInfo: 'CONNECTION_ERROR' };
//   }
// };

/**
 * ⑥ 決済実行 (ExecTran)
 * 登録済みの会員IDとカード連番を指定して決済を完了させます。
 */
export const execTranGmo = async (
  accessId: string,
  accessPass: string,
  orderId: string,
  memberId: string,
  cardSeq: string
) => {
  const baseUrl = process.env.GMO_BASE_URL!;
  const siteId = process.env.GMO_SITE_ID!;
  const sitePass = process.env.GMO_SITE_PASS!;

  const params = new URLSearchParams();
  params.append('AccessID', accessId);
  params.append('AccessPass', accessPass);
  params.append('OrderID', orderId);
  params.append('Method', '1'); // 一括
  params.append('SiteID', siteId);
  params.append('SitePass', sitePass);
  params.append('MemberID', memberId);
  params.append('CardSeq', cardSeq);

  try {
    const response = await fetch(`${baseUrl}/payment/ExecTran.idPass`, {
      method: 'POST',
      body: params,
    });
    const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(text);

    return {
      success: !resParams.get('ErrCode'),
      errInfo: resParams.get('ErrInfo'),
    };
  } catch (e) {
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};

/**
 * ⑦ 取引状態変更 (AlterTran)
 * 決済済みの取引を取り消します（キャンセル・返金）。
 */
export const alterTranGmo = async (accessId: string, accessPass: string, shopId: string, shopPass: string) => {
  const baseUrl = process.env.GMO_BASE_URL!;
  const params = new URLSearchParams();

  params.append('ShopID', shopId);
  params.append('ShopPass', shopPass);
  params.append('AccessID', accessId);
  params.append('AccessPass', accessPass);
  params.append('JobCd', 'VOID');

  try {
    const response = await fetch(`${baseUrl}/payment/AlterTran.idPass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(text);

    if (resParams.get('ErrCode')) {
      console.error('[alterTranGmo] Error:', resParams.get('ErrInfo'));
      return { success: false, errInfo: resParams.get('ErrInfo') };
    }

    return { success: true };
  } catch (e) {
    console.error('[alterTranGmo] Connection Error:', e);
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};

/**
 * ⑧ PayPayキャンセル・返金 (PaypayCancelReturn)
 * PayPay決済済みの取引を取り消します（キャンセル・返金）。
 * TODO(GMO doc要確認): 当該APIの詳細パラメータページ
 * (docs.gmo-pg.com/mulpay/apis/protocol-type/idpass/paypay-cancel-return)
 * がテスト環境アカウント専用で非公開のため、既存のAlterTran(JobCd=VOID)と
 * 同じ構成をベースラインとしている。GMOテスト環境での実疎通で確認・調整すること。
 */
export const paypayCancelReturn = async (accessId: string, accessPass: string, shopId: string, shopPass: string) => {
  const baseUrl = process.env.GMO_BASE_URL!;
  const params = new URLSearchParams();

  params.append('ShopID', shopId);
  params.append('ShopPass', shopPass);
  params.append('AccessID', accessId);
  params.append('AccessPass', accessPass);
  params.append('JobCd', 'VOID'); // TODO(GMO doc要確認): PayPayでのキャンセル/返金時のJobCd値

  try {
    const response = await fetch(`${baseUrl}/payment/PaypayCancelReturn.idPass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(text);

    if (resParams.get('ErrCode')) {
      console.error('[paypayCancelReturn] Error:', resParams.get('ErrInfo'));
      return { success: false, errInfo: resParams.get('ErrInfo') };
    }

    return { success: true };
  } catch (e) {
    console.error('[paypayCancelReturn] Connection Error:', e);
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};
