export interface Env {
  NOTION_TOKEN: string;
  NOTION_DUTY_DATA_SOURCE_ID: string;
  NOTION_CLOSURE_LOG_DATA_SOURCE_ID: string;
  NOTION_FAQ_DATA_SOURCE_ID: string;
  ADMIN_KEY: string;
  ASSETS: Fetcher;
}

export interface Orchard {
  slug: string;
  name: string;
  catch: string;
  address: string;
  phone: string;
  website?: string;
  photo?: string;
  quote?: string;
}

export const ORCHARDS: Orchard[] = [
  {
    slug: "okumoto",
    name: "奥本みかん園",
    catch: "太陽のような笑顔で出迎え。減農薬で育て、直売所には朝採り野菜も並ぶ。",
    address: "三浦市南下浦町上宮田2103",
    phone: "046-888-0895",
    photo: "/images/orchard-okumoto.jpg",
  },
  {
    slug: "yamasa",
    name: "ヤマサみかん園",
    catch: "リゾートホテル「マホロバマインズ三浦」目の前。三浦海岸駅からも近い立地。",
    address: "三浦市南下浦町上宮田3377",
    phone: "080-5087-1583",
    photo: "/images/orchard-yamasa.jpg",
  },
  {
    slug: "okayasu",
    name: "岡安みかん園",
    catch: "公園の目の前。大型バスも駐車可能。直売所では朝採り野菜も購入できる。",
    address: "三浦市南下浦町上宮田925",
    phone: "046-888-0954",
    photo: "/images/orchard-okayasu.jpg",
  },
  {
    slug: "yoshida",
    name: "よしだみかん園",
    catch: "三浦最大級の広さ。入口には十月桜、奥には京急線が走るロケーション。",
    address: "三浦市南下浦町上宮田1020",
    phone: "046-888-1102",
    photo: "/images/yoshida-booth.jpg",
  },
  {
    slug: "ishii",
    name: "石井みかん園",
    catch: "しっかり手入れの行き届いた清潔感のあるみかん園で、はじけるような笑顔で出迎えてくれます。",
    address: "三浦市南下浦町菊名614",
    phone: "046-888-0382",
    website: "http://www.thesakube.com/",
    photo: "/images/orchard-ishii.jpg",
    quote: `来てくれたお客様を喜ばせたい、その一心です。農家にとって一番の喜びである"収穫"を、一緒に分かちあえたらと思います`,
  },
  {
    slug: "shimoto",
    name: "しもとみかん園",
    catch: "坂を登り切った先に現れる、秘密のみかん園。低い木も多く子ども連れに人気。まるで公園のような趣です。",
    address: "三浦市南下浦町菊名281",
    phone: "090-9512-3505",
    photo: "/images/orchard-shimoto.jpg",
    quote: "幼い頃から、父の作るみかんが大好きでした。『あんなみかんを自分も作れるようになりたい』、そんな気持ちでみかんを育てています。今も試行錯誤の日々です",
  },
  {
    slug: "iijima",
    name: "飯島みかん園",
    catch: "遠くに望む青い海、房総半島……気持ちの良い風が吹き抜けます。螺旋状に坂を降りていけば、四方八方にたわわに実ったみかんの木が。",
    address: "三浦市南下浦町金田634",
    phone: "080-5548-8654",
    photo: "/images/orchard-iijima.jpg",
    quote: "1日中、子供と走り回って遊んでいく人も多い農園です。野性味溢れるみかんを楽しんでいってください",
  },
  {
    slug: "shindo",
    name: "進藤みかん園",
    catch: "三浦縦貫道(三崎港方面出口)を降りてすぐの絶好の立地です。四方を畑に囲まれた、深呼吸したくなるみかん園です。",
    address: "三浦市初声町和田923",
    phone: "046-888-2550",
    photo: "/images/orchard-shindo.jpg",
    quote: "うちは幼稚園のみかん狩りが多いので、子供が摘みやすいように育てた背の低いみかんの木も多い。子供連れでのみかん狩りもお気軽にどうぞ",
  },
  {
    slug: "maruyu",
    name: "長澤マルユみかん園",
    catch: "こちらも三浦縦貫道(林出口)を降りてすぐ行けるみかん園。車を停め、ゆるやかな坂を登っていくと、一気に風景が開けます。振り返れば、畑越しに相模湾や富士山を一望。",
    address: "三浦市初声町和田2771",
    phone: "046-888-1523",
    website: "https://www.nagasawamaruyu-mikan.com",
    photo: "/images/orchard-maruyu.jpg",
    quote: "園内は平坦で誰もが安全にみかん狩りを楽しむことができます。お客様に『美味しいね』と言ってもらえるのを励みに、心をこめてみかんを育てています",
  },
];
