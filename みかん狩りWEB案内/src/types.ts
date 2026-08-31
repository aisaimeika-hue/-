export interface Env {
  NOTION_TOKEN: string;
  NOTION_DUTY_DATA_SOURCE_ID: string;
  NOTION_CLOSURE_LOG_DATA_SOURCE_ID: string;
  NOTION_FAQ_DATA_SOURCE_ID: string;
  ADMIN_KEY: string;
}

export interface Orchard {
  slug: string;
  name: string;
  catch: string;
  address: string;
  phone: string;
  website?: string;
}

export const ORCHARDS: Orchard[] = [
  {
    slug: "okumoto",
    name: "奥本みかん園",
    catch: "太陽のような笑顔で出迎え。減農薬で育て、直売所には朝採り野菜も並ぶ。",
    address: "三浦市南下浦町上宮田2103",
    phone: "046-888-0895",
  },
  {
    slug: "yamasa",
    name: "ヤマサみかん園",
    catch: "リゾートホテル「マホロバマインズ三浦」目の前。三浦海岸駅からも近い立地。",
    address: "三浦市南下浦町上宮田3377",
    phone: "080-5087-1583",
  },
  {
    slug: "okayasu",
    name: "岡安みかん園",
    catch: "公園の目の前。大型バスも駐車可能。直売所では朝採り野菜も購入できる。",
    address: "三浦市南下浦町上宮田925",
    phone: "046-888-0954",
  },
  {
    slug: "yoshida",
    name: "よしだみかん園",
    catch: "三浦最大級の広さ。入口には十月桜、奥には京急線が走るロケーション。",
    address: "三浦市南下浦町上宮田1020",
    phone: "046-888-1102",
  },
  {
    slug: "ishii",
    name: "石井みかん園",
    catch: "地元民から厚い信頼を集める清潔感のある農園。自家製シロップ・ジュースも直売。",
    address: "三浦市南下浦町菊名614",
    phone: "046-888-0382",
    website: "http://www.thesakube.com/",
  },
  {
    slug: "shimoto",
    name: "しもとみかん園",
    catch: "坂を登り切った先に現れる、公園のような趣の農園。低い木も多く子ども連れに人気。",
    address: "三浦市南下浦町菊名281",
    phone: "090-9512-3505",
  },
  {
    slug: "iijima",
    name: "飯島みかん園",
    catch: "遠くに房総半島と青い海を望む。野性味あふれるみかんが自慢。",
    address: "三浦市南下浦町金田634",
    phone: "080-5548-8654",
  },
  {
    slug: "shindo",
    name: "進藤みかん園",
    catch: "三浦縦貫道(三崎港方面出口)すぐ。背の低い木が多く、小さなお子様連れにも安心。",
    address: "三浦市初声町和田923",
    phone: "046-888-2550",
  },
  {
    slug: "maruyu",
    name: "長澤マルユみかん園",
    catch: "坂を登ると相模湾や富士山を一望。園内は平坦で、誰でも安全に楽しめる。",
    address: "三浦市初声町和田2771",
    phone: "046-888-1523",
    website: "https://www.nagasawamaruyu-mikan.com",
  },
];
