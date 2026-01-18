/**
 * Chinese Kinship Terms Data
 * 中国亲戚称呼数据
 *
 * relation_path: 关系路径，用点分隔
 * gender: 目标人物的性别
 * term_standard: 标准称呼（我叫Ta）
 * term_reverse: 反向称呼（Ta叫我）
 * region: 地区（default 为通用）
 */

export interface KinshipTermData {
  relation_path: string;
  gender: 'male' | 'female';
  term_standard: string;
  term_reverse: string;
  region: string;
  priority: number;
}

export const KINSHIP_TERMS: KinshipTermData[] = [
  // ============ 直系长辈 ============

  // 父母
  { relation_path: 'father', gender: 'male', term_standard: '爸爸/父亲', term_reverse: '儿子/女儿', region: 'default', priority: 100 },
  { relation_path: 'mother', gender: 'female', term_standard: '妈妈/母亲', term_reverse: '儿子/女儿', region: 'default', priority: 100 },

  // 祖父母
  { relation_path: 'father.father', gender: 'male', term_standard: '爷爷/祖父', term_reverse: '孙子/孙女', region: 'default', priority: 100 },
  { relation_path: 'father.mother', gender: 'female', term_standard: '奶奶/祖母', term_reverse: '孙子/孙女', region: 'default', priority: 100 },

  // 外祖父母
  { relation_path: 'mother.father', gender: 'male', term_standard: '外公/外祖父', term_reverse: '外孙/外孙女', region: 'default', priority: 100 },
  { relation_path: 'mother.mother', gender: 'female', term_standard: '外婆/外祖母', term_reverse: '外孙/外孙女', region: 'default', priority: 100 },

  // 曾祖父母
  { relation_path: 'father.father.father', gender: 'male', term_standard: '曾祖父/太爷爷', term_reverse: '曾孙/曾孙女', region: 'default', priority: 100 },
  { relation_path: 'father.father.mother', gender: 'female', term_standard: '曾祖母/太奶奶', term_reverse: '曾孙/曾孙女', region: 'default', priority: 100 },
  { relation_path: 'mother.mother.father', gender: 'male', term_standard: '外曾祖父', term_reverse: '外曾孙/外曾孙女', region: 'default', priority: 100 },
  { relation_path: 'mother.mother.mother', gender: 'female', term_standard: '外曾祖母', term_reverse: '外曾孙/外曾孙女', region: 'default', priority: 100 },

  // ============ 直系晚辈 ============

  // 子女
  { relation_path: 'son', gender: 'male', term_standard: '儿子', term_reverse: '爸爸/妈妈', region: 'default', priority: 100 },
  { relation_path: 'daughter', gender: 'female', term_standard: '女儿', term_reverse: '爸爸/妈妈', region: 'default', priority: 100 },

  // 孙子女
  { relation_path: 'son.son', gender: 'male', term_standard: '孙子', term_reverse: '爷爷/奶奶', region: 'default', priority: 100 },
  { relation_path: 'son.daughter', gender: 'female', term_standard: '孙女', term_reverse: '爷爷/奶奶', region: 'default', priority: 100 },
  { relation_path: 'daughter.son', gender: 'male', term_standard: '外孙', term_reverse: '外公/外婆', region: 'default', priority: 100 },
  { relation_path: 'daughter.daughter', gender: 'female', term_standard: '外孙女', term_reverse: '外公/外婆', region: 'default', priority: 100 },

  // 曾孙
  { relation_path: 'son.son.son', gender: 'male', term_standard: '曾孙', term_reverse: '曾祖父/曾祖母', region: 'default', priority: 100 },
  { relation_path: 'son.son.daughter', gender: 'female', term_standard: '曾孙女', term_reverse: '曾祖父/曾祖母', region: 'default', priority: 100 },

  // ============ 配偶 ============

  { relation_path: 'spouse', gender: 'male', term_standard: '老公/丈夫', term_reverse: '老婆/妻子', region: 'default', priority: 100 },
  { relation_path: 'spouse', gender: 'female', term_standard: '老婆/妻子', term_reverse: '老公/丈夫', region: 'default', priority: 100 },

  // ============ 兄弟姐妹 ============

  // 父亲的子女（同父）
  { relation_path: 'father.son', gender: 'male', term_standard: '哥哥/弟弟', term_reverse: '哥哥/弟弟/姐姐/妹妹', region: 'default', priority: 90 },
  { relation_path: 'father.daughter', gender: 'female', term_standard: '姐姐/妹妹', term_reverse: '哥哥/弟弟/姐姐/妹妹', region: 'default', priority: 90 },
  // 母亲的子女（同母）
  { relation_path: 'mother.son', gender: 'male', term_standard: '哥哥/弟弟', term_reverse: '哥哥/弟弟/姐姐/妹妹', region: 'default', priority: 90 },
  { relation_path: 'mother.daughter', gender: 'female', term_standard: '姐姐/妹妹', term_reverse: '哥哥/弟弟/姐姐/妹妹', region: 'default', priority: 90 },

  // ============ 父系旁系 ============

  // 叔伯姑（父亲的兄弟姐妹）
  { relation_path: 'father.father.son', gender: 'male', term_standard: '伯伯/叔叔', term_reverse: '侄子/侄女', region: 'default', priority: 80 },
  { relation_path: 'father.father.daughter', gender: 'female', term_standard: '姑姑/姑妈', term_reverse: '侄子/侄女', region: 'default', priority: 80 },
  { relation_path: 'father.mother.son', gender: 'male', term_standard: '伯伯/叔叔', term_reverse: '侄子/侄女', region: 'default', priority: 80 },
  { relation_path: 'father.mother.daughter', gender: 'female', term_standard: '姑姑/姑妈', term_reverse: '侄子/侄女', region: 'default', priority: 80 },

  // 堂兄弟姐妹（父亲的兄弟的子女）
  { relation_path: 'father.father.son.son', gender: 'male', term_standard: '堂哥/堂弟', term_reverse: '堂哥/堂弟/堂姐/堂妹', region: 'default', priority: 70 },
  { relation_path: 'father.father.son.daughter', gender: 'female', term_standard: '堂姐/堂妹', term_reverse: '堂哥/堂弟/堂姐/堂妹', region: 'default', priority: 70 },

  // 表兄弟姐妹（父亲的姐妹的子女）
  { relation_path: 'father.father.daughter.son', gender: 'male', term_standard: '表哥/表弟', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },
  { relation_path: 'father.father.daughter.daughter', gender: 'female', term_standard: '表姐/表妹', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },

  // ============ 母系旁系 ============

  // 舅姨（母亲的兄弟姐妹）
  { relation_path: 'mother.father.son', gender: 'male', term_standard: '舅舅/舅父', term_reverse: '外甥/外甥女', region: 'default', priority: 80 },
  { relation_path: 'mother.father.daughter', gender: 'female', term_standard: '姨妈/阿姨', term_reverse: '外甥/外甥女', region: 'default', priority: 80 },
  { relation_path: 'mother.mother.son', gender: 'male', term_standard: '舅舅/舅父', term_reverse: '外甥/外甥女', region: 'default', priority: 80 },
  { relation_path: 'mother.mother.daughter', gender: 'female', term_standard: '姨妈/阿姨', term_reverse: '外甥/外甥女', region: 'default', priority: 80 },

  // 表兄弟姐妹（母亲的兄弟姐妹的子女）
  { relation_path: 'mother.father.son.son', gender: 'male', term_standard: '表哥/表弟', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },
  { relation_path: 'mother.father.son.daughter', gender: 'female', term_standard: '表姐/表妹', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },
  { relation_path: 'mother.father.daughter.son', gender: 'male', term_standard: '表哥/表弟', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },
  { relation_path: 'mother.father.daughter.daughter', gender: 'female', term_standard: '表姐/表妹', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },
  { relation_path: 'mother.mother.son.son', gender: 'male', term_standard: '表哥/表弟', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },
  { relation_path: 'mother.mother.son.daughter', gender: 'female', term_standard: '表姐/表妹', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },
  { relation_path: 'mother.mother.daughter.son', gender: 'male', term_standard: '表哥/表弟', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },
  { relation_path: 'mother.mother.daughter.daughter', gender: 'female', term_standard: '表姐/表妹', term_reverse: '表哥/表弟/表姐/表妹', region: 'default', priority: 70 },

  // ============ 侄子女 ============

  // 兄弟的子女
  { relation_path: 'father.son.son', gender: 'male', term_standard: '侄子', term_reverse: '伯伯/叔叔/姑姑', region: 'default', priority: 70 },
  { relation_path: 'father.son.daughter', gender: 'female', term_standard: '侄女', term_reverse: '伯伯/叔叔/姑姑', region: 'default', priority: 70 },
  { relation_path: 'mother.son.son', gender: 'male', term_standard: '侄子', term_reverse: '伯伯/叔叔/姑姑', region: 'default', priority: 70 },
  { relation_path: 'mother.son.daughter', gender: 'female', term_standard: '侄女', term_reverse: '伯伯/叔叔/姑姑', region: 'default', priority: 70 },

  // 姐妹的子女
  { relation_path: 'father.daughter.son', gender: 'male', term_standard: '外甥', term_reverse: '舅舅/姨妈', region: 'default', priority: 70 },
  { relation_path: 'father.daughter.daughter', gender: 'female', term_standard: '外甥女', term_reverse: '舅舅/姨妈', region: 'default', priority: 70 },
  { relation_path: 'mother.daughter.son', gender: 'male', term_standard: '外甥', term_reverse: '舅舅/姨妈', region: 'default', priority: 70 },
  { relation_path: 'mother.daughter.daughter', gender: 'female', term_standard: '外甥女', term_reverse: '舅舅/姨妈', region: 'default', priority: 70 },

  // ============ 姻亲关系 ============

  // 公婆（配偶的父母）
  { relation_path: 'spouse.father', gender: 'male', term_standard: '公公/岳父', term_reverse: '儿媳/女婿', region: 'default', priority: 90 },
  { relation_path: 'spouse.mother', gender: 'female', term_standard: '婆婆/岳母', term_reverse: '儿媳/女婿', region: 'default', priority: 90 },

  // 儿媳女婿
  { relation_path: 'son.spouse', gender: 'female', term_standard: '儿媳妇', term_reverse: '公公/婆婆', region: 'default', priority: 90 },
  { relation_path: 'daughter.spouse', gender: 'male', term_standard: '女婿', term_reverse: '岳父/岳母', region: 'default', priority: 90 },

  // 嫂子弟媳
  { relation_path: 'father.son.spouse', gender: 'female', term_standard: '嫂子/弟媳', term_reverse: '小叔子/大伯子/小姑子', region: 'default', priority: 70 },
  { relation_path: 'mother.son.spouse', gender: 'female', term_standard: '嫂子/弟媳', term_reverse: '小叔子/大伯子/小姑子', region: 'default', priority: 70 },

  // 姐夫妹夫
  { relation_path: 'father.daughter.spouse', gender: 'male', term_standard: '姐夫/妹夫', term_reverse: '大舅子/小舅子/大姨子/小姨子', region: 'default', priority: 70 },
  { relation_path: 'mother.daughter.spouse', gender: 'male', term_standard: '姐夫/妹夫', term_reverse: '大舅子/小舅子/大姨子/小姨子', region: 'default', priority: 70 },

  // 妯娌（兄弟的妻子之间）
  { relation_path: 'spouse.father.son.spouse', gender: 'female', term_standard: '妯娌', term_reverse: '妯娌', region: 'default', priority: 60 },
  { relation_path: 'spouse.mother.son.spouse', gender: 'female', term_standard: '妯娌', term_reverse: '妯娌', region: 'default', priority: 60 },

  // 连襟（姐妹的丈夫之间）
  { relation_path: 'spouse.father.daughter.spouse', gender: 'male', term_standard: '连襟/襟兄弟', term_reverse: '连襟/襟兄弟', region: 'default', priority: 60 },
  { relation_path: 'spouse.mother.daughter.spouse', gender: 'male', term_standard: '连襟/襟兄弟', term_reverse: '连襟/襟兄弟', region: 'default', priority: 60 },

  // 配偶的兄弟姐妹
  { relation_path: 'spouse.father.son', gender: 'male', term_standard: '大伯子/小叔子', term_reverse: '嫂子/弟媳', region: 'default', priority: 70 },
  { relation_path: 'spouse.father.daughter', gender: 'female', term_standard: '大姑子/小姑子', term_reverse: '嫂子/弟媳', region: 'default', priority: 70 },
  { relation_path: 'spouse.mother.son', gender: 'male', term_standard: '大舅子/小舅子', term_reverse: '姐夫/妹夫', region: 'default', priority: 70 },
  { relation_path: 'spouse.mother.daughter', gender: 'female', term_standard: '大姨子/小姨子', term_reverse: '姐夫/妹夫', region: 'default', priority: 70 },

  // ============ 地区变体示例 ============

  // 北方变体
  { relation_path: 'mother.father', gender: 'male', term_standard: '姥爷', term_reverse: '外孙/外孙女', region: '北方', priority: 110 },
  { relation_path: 'mother.mother', gender: 'female', term_standard: '姥姥', term_reverse: '外孙/外孙女', region: '北方', priority: 110 },

  // 南方变体
  { relation_path: 'father.father', gender: 'male', term_standard: '阿公/公公', term_reverse: '孙/孙女', region: '南方', priority: 110 },
  { relation_path: 'father.mother', gender: 'female', term_standard: '阿婆/婆婆', term_reverse: '孙/孙女', region: '南方', priority: 110 },

  // 广东变体
  { relation_path: 'father', gender: 'male', term_standard: '老豆/阿爸', term_reverse: '仔/女', region: '广东', priority: 110 },
  { relation_path: 'mother', gender: 'female', term_standard: '老母/阿妈', term_reverse: '仔/女', region: '广东', priority: 110 },

  // 四川变体
  { relation_path: 'father.father.son', gender: 'male', term_standard: '大爷/幺爸', term_reverse: '侄儿/侄女', region: '四川', priority: 110 },
  { relation_path: 'mother.father.son', gender: 'male', term_standard: '舅子', term_reverse: '外侄/外侄女', region: '四川', priority: 110 },
];

/**
 * Get kinship terms as SQL INSERT statements for database seeding
 */
export function getKinshipTermsInsertSQL(): string {
  const values = KINSHIP_TERMS.map(term =>
    `('${term.relation_path}', '${term.gender}', '${term.term_standard}', '${term.term_reverse}', '${term.region}', ${term.priority})`
  ).join(',\n  ');

  return `INSERT INTO kinship_terms (relation_path, gender, term_standard, term_reverse, region, priority)
VALUES
  ${values}
ON CONFLICT (relation_path, gender, region) DO UPDATE SET
  term_standard = EXCLUDED.term_standard,
  term_reverse = EXCLUDED.term_reverse,
  priority = EXCLUDED.priority;`;
}
