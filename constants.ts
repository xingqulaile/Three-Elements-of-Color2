export const SUPABASE_URL = 'https://ofuerolgqjyocjzyymsw.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_k3FsLXY1RmJsJcgTz1FDtw_VrCFYBgk';

export const ADMIN_USER = 'admin';
export const ADMIN_PASS = '142587';

export const LEVEL_CONFIG = {
  1: {
    title: "第一关：寻找遗失的色相",
    description: "通过移动滑块，找到与目标完全一致的颜色！",
    tolerance: { h: 10, s: 100, l: 100 }, // Only H matters
    learning: "色相（Hue）是色彩的首要特征，是区别各种不同色彩的最准确的标准。简单来说，就是颜色的相貌，如红、黄、蓝等。",
    hint: "观察色相环，目标颜色在多少度附近？红色在0/360度，绿色在120度，蓝色在240度。"
  },
  2: {
    title: "第二关：明度的阶梯",
    description: "调整颜色的明暗程度，使其与目标一致。",
    tolerance: { h: 360, s: 100, l: 10 }, // Only L matters
    learning: "明度（Value/Lightness）指色彩的明暗程度。在一种颜色中加入白色，明度提高；加入黑色，明度降低。",
    hint: "向右滑动变亮（加白），向左滑动变暗（加黑）。"
  },
  3: {
    title: "第三关：纯度的魔法",
    description: "调整颜色的鲜艳程度。",
    tolerance: { h: 360, s: 10, l: 100 }, // Only S matters
    learning: "纯度（Saturation/Chroma）指色彩的鲜艳程度，也称饱和度。纯度越高，颜色越鲜艳；纯度越低，颜色越灰暗。",
    hint: "纯度最高时颜色最艳丽，纯度最低时颜色变成灰色。"
  },
  4: {
    title: "第四关：色彩大师挑战",
    description: "综合运用三要素，还原目标色彩！",
    tolerance: { h: 15, s: 15, l: 15 }, // All matter
    learning: "在实际调色中，色相、明度、纯度往往是同时变化的。只有掌握了三者的关系，才能调出心仪的色彩。",
    hint: "建议顺序：先定色相（颜色种类），再定明度（深浅），最后微调纯度（鲜艳度）。"
  },
  5: {
    title: "第五关：重绘色彩王国",
    description: "发挥你的创意，为这幅画填上色彩！",
    learning: "艺术创作是个性化的表达。利用色彩的情感属性来表达你的心情吧！",
    hint: "点击画面中的不同物体来选中它，然后调整下方的滑块。",
    tolerance: { h: 0, s: 0, l: 0 }
  }
};