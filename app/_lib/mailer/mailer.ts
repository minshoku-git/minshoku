import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

/* transport
------------------------------------------------------------------ */
/** SMTPTransport.Options */
const options: SMTPTransport.Options = {
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_MAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
};
/** transport */
const transporter = nodemailer.createTransport(options);

/* send
------------------------------------------------------------------ */
/**
 * メールを送信します。
 * @param {ApiRequest<string>} req - 差出人
 */
export const send = async (req: ApiRequest<string>): Promise<ApiResponse<string>> => {
  return await transporter
    .sendMail({
      to: 's.abe@refact.co.jp',
      subject: '[みんしょく]ユーザー承認依頼',
      text: 'text',
      html: temp,
      // html: `
      //   <a
      //     href="http://localhost:3000/api/testplace/approval?id=12345"
      //     style="padding:10px 20px;background-color:#007bff;color:white;text-decoration:none;border-radius:5px;">
      //     クリックして確認
      //   </a>
      // `,
    })
    .then(() => {
      const result: ApiResponse<string> = { success: true, data: '' };
      return result;
    })
    .catch((error) => {
      console.error((error as Error).message);
      const result: ApiResponse<string> = {
        success: false,
        error: { code: ErrorCodes.EMAIL_SEND_FAILED.code, message: ErrorCodes.EMAIL_SEND_FAILED.message },
      };
      return result;
    });
};

const user_name = '阿部';
const user_email = 'xxxxxx@refact.co.jp';
const temp = `
<div role="main" dir="ltr" style="outline: none">
  <table
    role="presentation"
    cellpadding="0"
    cellspacing="0"
    border="0"
    width="100%"
    style="border-collapse: collapse; border-spacing: 0px"
  >
    <tbody>
      <tr>
        <td>
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="margin: auto; border-collapse: collapse; border-spacing: 0px"
            align="center"
          >
            <tbody>
              <tr>
                <td width="100%" align="center">
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    width="100%"
                    class="m_5663300358517733186gmail-yaqOZd"
                    style="
                      background-color: rgb(255, 255, 255);
                      background-size: cover;
                      display: table;
                      table-layout: fixed;
                      width: 100%;
                      border-collapse: collapse;
                      border-spacing: 0px;
                    "
                  >
                    <tbody>
                      <tr>
                        <td width="100%">
                          <table
                            width="100%"
                            style="
                              margin: auto;
                              max-width: 800px;
                              min-width: 320px;
                              border-collapse: collapse;
                              border-spacing: 0px;
                            "
                            align="center"
                          >
                            <tbody>
                              <tr>
                                <td style="min-width: 12px"></td>
                                <td
                                  width="100%"
                                  style="padding: 9px 0px"
                                  class="m_5663300358517733186gmail-fHaL6b"
                                >
                                  <table
                                    width="100%"
                                    style="
                                      vertical-align: top;
                                      display: inline-table;
                                      border-collapse: collapse;
                                      border-spacing: 0px;
                                    "
                                    class="m_5663300358517733186gmail-hJDwNd-AhqUyc-uQSCkd m_5663300358517733186gmail-purZT-AhqUyc-II5mzb m_5663300358517733186gmail-pSzOP-AhqUyc-qWD73c"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          width="100%"
                                          style="padding-left: 9px; padding-right: 9px; display: table-cell"
                                          class="m_5663300358517733186gmail-OjCsFc m_5663300358517733186gmail-dmUFtb m_5663300358517733186gmail-wHaque m_5663300358517733186gmail-g5GTcb"
                                        >
                                          <table
                                            cellpadding="7px"
                                            width="100%"
                                            style="border-collapse: collapse; border-spacing: 0px"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  width="100%"
                                                  align="center"
                                                  style="word-break: break-word"
                                                >
                                                  <div
                                                    id="m_5663300358517733186gmail-h.z32qo47bzyfe"
                                                    style="margin-bottom: 0px"
                                                  ></div>
                                                  <h1
                                                    id="m_5663300358517733186gmail-h.z32qo47bzyfe_l"
                                                    dir="ltr"
                                                    class="m_5663300358517733186gmail-duRjpb m_5663300358517733186gmail-CDt4Ke"
                                                    style="
                                                      text-align: center;
                                                      margin: 0px 0pt;
                                                      padding-top: 0px;
                                                      padding-bottom: 0px;
                                                      font-size: 34pt;
                                                      font-family: Arial;
                                                      font-weight: 700;
                                                      font-style: normal;
                                                      font-variant: normal;
                                                      vertical-align: baseline;
                                                      text-decoration: none;
                                                      display: block;
                                                      line-height: 1.2;
                                                      padding-left: 0pt;
                                                      text-indent: 0pt;
                                                      color: rgb(0, 123, 131);
                                                      outline: none;
                                                    "
                                                  >
                                                    <span>ユーザー承認依頼</span>
                                                  </h1>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                          width="100%"
                                          style="padding-left: 9px; padding-right: 9px; display: table-cell"
                                          class="m_5663300358517733186gmail-OjCsFc m_5663300358517733186gmail-dmUFtb m_5663300358517733186gmail-wHaque m_5663300358517733186gmail-g5GTcb"
                                        >
                                          <table
                                            cellpadding="7px"
                                            width="100%"
                                            style="border-collapse: collapse; border-spacing: 0px"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  width="100%"
                                                  align="center"
                                                  style="word-break: break-word"
                                                >
                                                  <p
                                                    dir="ltr"
                                                    class="m_5663300358517733186gmail-CDt4Ke"
                                                    style="
                                                      margin: 0px 0pt 0pt;
                                                      padding-top: 0px;
                                                      font-family: Arial;
                                                      font-weight: 400;
                                                      font-style: normal;
                                                      font-variant: normal;
                                                      vertical-align: baseline;
                                                      text-decoration: none;
                                                      display: block;
                                                      line-height: 1.2;
                                                      text-align: left;
                                                      padding-left: 0pt;
                                                      text-indent: 0pt;
                                                      font-size: 12pt;
                                                      color: rgb(28, 28, 28);
                                                      outline: none;
                                                    "
                                                  >
                                                    <span>承認または否認を押下してください。</span>
                                                  </p>
                                                  <p
                                                    dir="ltr"
                                                    class="m_5663300358517733186gmail-CDt4Ke"
                                                    style="
                                                      font-family: Arial;
                                                      font-weight: 400;
                                                      font-style: normal;
                                                      font-variant: normal;
                                                      vertical-align: baseline;
                                                      text-decoration: none;
                                                      display: block;
                                                      line-height: 1.2;
                                                      text-align: left;
                                                      margin: 6pt 0pt 0pt;
                                                      padding-left: 0pt;
                                                      text-indent: 0pt;
                                                      font-size: 12pt;
                                                      color: rgb(28, 28, 28);
                                                      outline: none;
                                                    "
                                                  >
                                                    <span>ユーザー名：${user_name}</span>
                                                  </p>
                                                  <p
                                                    dir="ltr"
                                                    class="m_5663300358517733186gmail-CDt4Ke"
                                                    style="
                                                      margin: 6pt 0pt 0px;
                                                      padding-bottom: 0px;
                                                      font-family: Arial;
                                                      font-weight: 400;
                                                      font-style: normal;
                                                      font-variant: normal;
                                                      vertical-align: baseline;
                                                      text-decoration: none;
                                                      display: block;
                                                      line-height: 1.2;
                                                      text-align: left;
                                                      padding-left: 0pt;
                                                      text-indent: 0pt;
                                                      font-size: 12pt;
                                                      color: rgb(28, 28, 28);
                                                      outline: none;
                                                    "
                                                  >
                                                    <span>メールアドレス：${user_email}</span>
                                                  </p>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                                <td style="min-width: 12px"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    width="100%"
                    class="m_5663300358517733186gmail-yaqOZd"
                    style="
                      background-color: rgb(255, 255, 255);
                      background-size: cover;
                      display: table;
                      table-layout: fixed;
                      width: 100%;
                      border-collapse: collapse;
                      border-spacing: 0px;
                    "
                  >
                    <tbody>
                      <tr>
                        <td width="100%">
                          <table
                            width="100%"
                            style="
                              margin: auto;
                              max-width: 800px;
                              min-width: 320px;
                              border-collapse: collapse;
                              border-spacing: 0px;
                            "
                            align="center"
                          >
                            <tbody>
                              <tr>
                                <td style="min-width: 12px"></td>
                                <td
                                  width="100%"
                                  style="padding: 9px 0px"
                                  class="m_5663300358517733186gmail-fHaL6b"
                                >
                                  <table
                                    width="41.66666666666667%"
                                    style="
                                      vertical-align: top;
                                      border-collapse: collapse;
                                      border-spacing: 0px;
                                    "
                                    class="m_5663300358517733186gmail-hJDwNd-AhqUyc-wNfPc m_5663300358517733186gmail-L6cTce-purZT m_5663300358517733186gmail-L6cTce-pSzOP m_5663300358517733186gmail-wqqOZe"
                                  ></table>
                                  <table
                                    width="16.666666666666664%"
                                    style="
                                      vertical-align: top;
                                      display: inline-table;
                                      border-collapse: collapse;
                                      border-spacing: 0px;
                                    "
                                    class="m_5663300358517733186gmail-hJDwNd-AhqUyc-ibL1re m_5663300358517733186gmail-purZT-AhqUyc-ibL1re m_5663300358517733186gmail-pSzOP-AhqUyc-ibL1re"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          width="100%"
                                          style="padding-left: 9px; padding-right: 9px; display: table-cell"
                                          class="m_5663300358517733186gmail-OjCsFc m_5663300358517733186gmail-dmUFtb m_5663300358517733186gmail-wHaque m_5663300358517733186gmail-g5GTcb"
                                        >
                                          <table
                                            cellpadding="0px"
                                            width="100%"
                                            style="border-collapse: collapse; border-spacing: 0px"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  width="100%"
                                                  align="center"
                                                  style="word-break: break-word"
                                                >
                                                  <table
                                                    role="button"
                                                    width="100%"
                                                    border="0"
                                                    cellspacing="0"
                                                    cellpadding="0"
                                                    style="
                                                      border-collapse: separate;
                                                      table-layout: fixed;
                                                      border-spacing: 0px;
                                                    "
                                                  >
                                                    <tbody>
                                                      <tr>
                                                        <td
                                                          style="
                                                            display: table-cell;
                                                            text-align: center;
                                                            overflow: hidden;
                                                            line-height: 36px;
                                                            text-overflow: ellipsis;
                                                            white-space: nowrap;
                                                            background-color: rgb(0, 123, 131);
                                                            color: rgb(249, 249, 249);
                                                            border: 1px solid rgb(0, 123, 131);
                                                            height: 27pt;
                                                            font-size: 12pt;
                                                            font-family: Arial;
                                                            font-weight: 400;
                                                            font-style: normal;
                                                            padding-left: 6px;
                                                            padding-right: 6px;
                                                            width: 100%;
                                                            border-radius: 4px;
                                                            max-width: 100%;
                                                            vertical-align: middle;
                                                          "
                                                          class="m_5663300358517733186gmail-NsaAfc"
                                                        >
                                                          <a
                                                            href="http://localhost:3000/api/testplace/approval?id=12345"
                                                            style="
                                                              width: 100%;
                                                              text-decoration: none;
                                                              background-color: rgb(0, 123, 131);
                                                              color: rgb(249, 249, 249);
                                                              border-color: rgb(0, 123, 131);
                                                            "
                                                            target="_blank"
                                                            ><span
                                                              class="m_5663300358517733186gmail-NsaAfc"
                                                              style="
                                                                overflow: hidden;
                                                                text-overflow: ellipsis;
                                                                white-space: nowrap;
                                                                text-align: center;
                                                                width: 100%;
                                                              "
                                                              >承認</span
                                                            ></a
                                                          >
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table
                                    width="41.66666666666667%"
                                    style="
                                      vertical-align: top;
                                      border-collapse: collapse;
                                      border-spacing: 0px;
                                    "
                                    class="m_5663300358517733186gmail-hJDwNd-AhqUyc-wNfPc m_5663300358517733186gmail-L6cTce-purZT m_5663300358517733186gmail-L6cTce-pSzOP m_5663300358517733186gmail-wqqOZe"
                                  ></table>
                                </td>
                                <td style="min-width: 12px"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    width="100%"
                    class="m_5663300358517733186gmail-yaqOZd"
                    style="
                      background-color: rgb(255, 255, 255);
                      padding-bottom: 0px;
                      padding-top: 0px;
                      background-size: cover;
                      display: table;
                      table-layout: fixed;
                      width: 100%;
                      border-collapse: collapse;
                      border-spacing: 0px;
                    "
                  >
                    <tbody>
                      <tr>
                        <td width="100%">
                          <table
                            width="100%"
                            style="
                              margin: auto;
                              max-width: 800px;
                              min-width: 320px;
                              border-collapse: collapse;
                              border-spacing: 0px;
                            "
                            align="center"
                          >
                            <tbody>
                              <tr>
                                <td style="min-width: 12px"></td>
                                <td
                                  width="100%"
                                  style="padding: 9px 0px"
                                  class="m_5663300358517733186gmail-fHaL6b"
                                >
                                  <table
                                    width="100%"
                                    style="
                                      vertical-align: top;
                                      display: inline-table;
                                      border-collapse: collapse;
                                      border-spacing: 0px;
                                    "
                                    class="m_5663300358517733186gmail-hJDwNd-AhqUyc-uQSCkd m_5663300358517733186gmail-purZT-AhqUyc-II5mzb m_5663300358517733186gmail-pSzOP-AhqUyc-qWD73c"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          width="100%"
                                          style="padding-left: 9px; padding-right: 9px; display: table-cell"
                                          class="m_5663300358517733186gmail-OjCsFc m_5663300358517733186gmail-dmUFtb m_5663300358517733186gmail-wHaque m_5663300358517733186gmail-g5GTcb"
                                        >
                                          <table
                                            cellpadding="0px"
                                            width="100%"
                                            style="border-collapse: collapse; border-spacing: 0px"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  width="100%"
                                                  align="center"
                                                  style="word-break: break-word"
                                                >
                                                  <table
                                                    width="100%"
                                                    cellspacing="0"
                                                    cellpadding="0"
                                                    border="0"
                                                    style="border-collapse: collapse; border-spacing: 0px"
                                                  >
                                                    <tbody>
                                                      <tr>
                                                        <td
                                                          width="100%"
                                                          style="line-height: 8.5px; font-size: 8.5px"
                                                        >
                                                          &nbsp;
                                                        </td>
                                                      </tr>
                                                      <tr>
                                                        <td
                                                          width="100%"
                                                          style="
                                                            background-color: rgb(217, 217, 217);
                                                            line-height: 2px;
                                                            font-size: 2px;
                                                          "
                                                        >
                                                          &nbsp;
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                                <td style="min-width: 12px"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    width="100%"
                    class="m_5663300358517733186gmail-yaqOZd"
                    style="
                      background-color: rgb(255, 255, 255);
                      background-size: cover;
                      display: table;
                      table-layout: fixed;
                      width: 100%;
                      border-collapse: collapse;
                      border-spacing: 0px;
                    "
                  >
                    <tbody>
                      <tr>
                        <td width="100%">
                          <table
                            width="100%"
                            style="
                              margin: auto;
                              max-width: 800px;
                              min-width: 320px;
                              border-collapse: collapse;
                              border-spacing: 0px;
                            "
                            align="center"
                          >
                            <tbody>
                              <tr>
                                <td style="min-width: 12px"></td>
                                <td
                                  width="100%"
                                  style="padding: 9px 0px"
                                  class="m_5663300358517733186gmail-fHaL6b"
                                >
                                  <table
                                    width="100%"
                                    style="
                                      vertical-align: top;
                                      display: inline-table;
                                      border-collapse: collapse;
                                      border-spacing: 0px;
                                    "
                                    class="m_5663300358517733186gmail-hJDwNd-AhqUyc-uQSCkd m_5663300358517733186gmail-purZT-AhqUyc-II5mzb m_5663300358517733186gmail-pSzOP-AhqUyc-qWD73c"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          width="100%"
                                          style="padding-left: 9px; padding-right: 9px; display: table-cell"
                                          class="m_5663300358517733186gmail-OjCsFc m_5663300358517733186gmail-dmUFtb m_5663300358517733186gmail-wHaque m_5663300358517733186gmail-g5GTcb"
                                        >
                                          <table
                                            cellpadding="7px"
                                            width="100%"
                                            style="border-collapse: collapse; border-spacing: 0px"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  width="100%"
                                                  align="center"
                                                  style="word-break: break-word"
                                                >
                                                  <p
                                                    dir="ltr"
                                                    class="m_5663300358517733186gmail-CDt4Ke"
                                                    style="
                                                      text-align: center;
                                                      margin: 0px 0pt;
                                                      padding-bottom: 0px;
                                                      padding-top: 0px;
                                                      font-family: Arial;
                                                      font-weight: 400;
                                                      font-style: normal;
                                                      font-variant: normal;
                                                      vertical-align: baseline;
                                                      text-decoration: none;
                                                      display: block;
                                                      line-height: 1.2;
                                                      padding-left: 0pt;
                                                      text-indent: 0pt;
                                                      font-size: 12pt;
                                                      color: rgb(28, 28, 28);
                                                      outline: none;
                                                    "
                                                  >
                                                    <a
                                                      href="http://localhost:3000"
                                                      style="color: inherit; text-decoration: none"
                                                      target="_blank"
                                                      ><span
                                                        style="
                                                          text-decoration: underline;
                                                          color: rgb(0, 123, 131);
                                                        "
                                                        >みんなの社食</span
                                                      ></a
                                                    >
                                                  </p>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                                <td style="min-width: 12px"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</div>
`;
