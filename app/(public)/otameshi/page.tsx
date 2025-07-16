import '../../_ui/styles/style.scss'; // SCSSファイルのインポート

import { Button, Typography } from '@mui/material';
import Image from 'next/image';

import hum_close from '../../_ui/styles/images/hum-close.svg';
import hum_show from '../../_ui/styles/images/hum-show.svg';
import item_image_curry from "../../_ui/styles/images/item-image-curry.jpg"

const page: React.FC = () => {
  return (
    <div id="menu">
      <header className="bl-header">
        <div className="bl-header-body">
          <div className="ly-header ly-content">
            <h1 className="bl-header-logo ff-mobo fc-theme fs-28">ABC建設食堂</h1>
            <div className="bl-header-ui">
              <Button className="bl-header-ui-button menu-show">
                <Image src={hum_show} alt="close" layout="fill" />
              </Button>
              <Button className="bl-header-ui-button menu-close">
                <Image src={hum_close} alt="close" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="bl-content bg-content-roundedtop">
          <div className="ly-content-body ly-content">
            <div className="p-t-30 p-b-10 bl-pager">
              <Button className="bl-pager-button prev" />
              <Typography variant="h6" align="center">
                5月23日（金）のメニュー
              </Typography>
              <Button className="bl-pager-button next" />
            </div>
            <div className="bl-card bg-w" id="item01">
              <div className="bl-card-body">
                <picture className="bl-card-thumb">
                  <Image src={item_image_curry} alt="" />
                  <Button className="bl-card-thumb-ui">
                    <Image src={item_image_curry} alt="icon_shop_b" />
                  </Button>
                </picture>

                <nav className="bl-card-links p-t-10">
                  <ul className="bl-card-links-ul">
                    <li className="bl-card-link">
                      <a href="#" className="bl-card-link-body">
                        <Image src={item_image_curry} alt="" />
                      </a>
                    </li>
                  </ul>
                </nav>

                <div className="bl-card-text-content">
                  <Typography variant="h6" className="recipe-name p-t-10 p-b-10 ta-l">
                    <Image src={item_image_curry} alt="" />
                  </Typography>
                  <div className="recipe-prices">
                    <Typography variant="h4" className="recipe-price fs-32 fc-theme">
                      ¥<span className="recipe-price p-l-10 fs-32 fc-theme">500</span>
                    </Typography>
                    <Typography variant="body2">
                      <s className="recipe-original-price fs-20">¥1,100</s>
                      <span className="fs-14 fc-gray">（税込）</span>
                    </Typography>
                  </div>

                  <div className="recipe-description m-b-20 m-t-10" id="item01-description">
                    <Typography variant="body2" className="fs-14">
                      商品説明商品説明商品説明商品説明商品説明商品説明商品説明...
                    </Typography>
                    <Button className="recipe-description-toggle">詳細</Button>
                  </div>
                </div>

                <div className="bl-card-ui p-t-10">
                  <div className="bl-card-ui-body">
                    <div className="bl-card-ui-order">
                      <div className="bl-card-ui-quantity">
                        <Typography variant="body2" className="fc-gray fs-18">
                          残り<span className="fc-gray fs-16 restofstock">32</span> 食
                        </Typography>
                        <div className="bl-card-ui-counter mt-8">
                          <Button className="fs-21 fw-b">−</Button>
                          <input type="text" className="fs-21" value="1" readOnly />
                          <Button className="fs-21 fw-b">+</Button>
                        </div>
                      </div>
                    </div>

                    <div className="bl-card-ui-buy">
                      <Button className="btn bg-theme d-b m-a ta-c p-t-8">
                        <Typography variant="button" className="fc-w fw-b fs-18">
                          注文する
                        </Typography>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Typography variant="body2" align="center" className="fs-15 fw-b p-t-20 p-b-40">
              注文期限：当日13:00まで
              <br />
              キャンセル期限：当日13:00まで
            </Typography>
          </div>
        </section>
      </main>

      {/* Dialog */}
      {/* <Dialog open={false} onClose={() => { }}>
        <DialogTitle>
          <Button className="close-btn" onClick={() => { }}>
            <img src="/assets/images/modal-close.svg" alt="" />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            カレーショップ初恋
          </Typography>
          <Typography variant="body2" className="fs-16">
            店舗紹介店舗紹介店舗紹介60年続いたスナック跡地にオープンした渋谷のスパイスカレー&クラフトビリヤニ専門店...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { }} color="primary">
            閉じる
          </Button>
        </DialogActions>
      </Dialog> */}
    </div>
  );
};

export default page;
