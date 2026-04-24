import {
  Noto_Sans_KR,
  Noto_Serif_KR,
  Gowun_Dodum,
  Jua,
  Do_Hyeon,
  Nanum_Pen_Script,
} from 'next/font/google';

export const notoSansKr = Noto_Sans_KR({ weight: ['400', '700'], preload: false });
export const notoSerifKr = Noto_Serif_KR({ weight: ['400', '700'], preload: false });
export const gowunDodum = Gowun_Dodum({ weight: ['400'], preload: false });
export const jua = Jua({ weight: ['400'], preload: false });
export const doHyeon = Do_Hyeon({ weight: ['400'], preload: false });
export const nanumPenScript = Nanum_Pen_Script({ weight: ['400'], preload: false });

export const fontOptions = [
  { name: '노토 산스 (Noto Sans KR)', className: notoSansKr.className },
  { name: '노토 세리프 (Noto Serif KR)', className: notoSerifKr.className },
  { name: '고운 돋움 (Gowun Dodum)', className: gowunDodum.className },
  { name: '주아 (Jua)', className: jua.className },
  { name: '도현 (Do Hyeon)', className: doHyeon.className },
  { name: '나눔 펜 (Nanum Pen Script)', className: nanumPenScript.className },
];
