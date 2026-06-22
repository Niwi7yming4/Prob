import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Book,
  Check,
  Edit3,
  FileText,
  Library,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

type NoteGroup =
  | '考試範圍'
  | 'Assignment 5'
  | 'Assignment 6'
  | 'Assignment 7'
  | 'Assignment 8';

type Note = {
  id: number;
  group: NoteGroup;
  title: string;
  content: string;
};

type EditForm = {
  title: string;
  content: string;
};

const initialNotes: Note[] = [
  {
    id: 1,
    group: '考試範圍',
    title: '考試範圍速讀',
    content: `## 必讀範圍
- 考 9.8 到 10.13。
- 不考 9.14、9.15、10.7。

## 選擇題
- 10.2 會考專有名詞：null hypothesis、alternative hypothesis、test statistic、critical region、type I error、type II error、level of significance、P-value。
- 10.3 重點是 Type I / Type II error、$\\alpha$、$\\beta$、sample size 對錯誤機率的影響。

## 計算題固定流程
1. 先寫參數：例如 $\\mu$、$p$、$\\sigma^2$、$\\mu_1-\\mu_2$。
2. 寫假設：$H_0$ 一定放等號；$H_1$ 由題目關鍵字決定方向。
3. 選統計量：平均數用 $z$ 或 $t$，變異數用 $\\chi^2$，兩變異數比用 $F$，比例用 binomial 或 $z$。
4. 決定拒絕域：看 $H_1$ 是 $<$、$>$、還是 $\\ne$。
5. 寫自由度：單一 $t$ 與 $\\chi^2$ 通常 $df=n-1$；兩樣本 pooled t 是 $df=n_1+n_2-2$；配對 t 是 $df=n-1$。
6. 做結論：只寫 reject $H_0$ 或 fail to reject $H_0$，再翻成題目語意。

## 第 9 章和第 10 章的對應
- 第 9 章：用樣本估母體參數，主題是 confidence interval。
- 第 10 章：用樣本檢定某個主張，主題是 hypothesis test。
- 背法：第 9 章問「範圍在哪裡」；第 10 章問「主張可不可信」。`
  },
  {
    id: 2,
    group: '考試範圍',
    title: '完整考試範圍整理：中英對照與概念題',
    content: `## 核心觀念總覽
考試範圍的主軸是「估計」和「檢定」的轉換。第 9 章先教你用 confidence interval 估參數；第 10 章再用 hypothesis test 判斷某個主張是否有足夠證據。

## 中英對照
| English | 中文 | 意思 | 常見考法 |
|---|---|---|---|
| Statistical hypothesis | 統計假設 | 對一個或多個母體參數的主張 | 問某句話要怎麼寫成 $H_0$ 和 $H_1$ |
| Null hypothesis, $H_0$ | 虛無假設 | 被檢定的基準說法，通常放等號 | 判斷 $H_0$ 是否應含 $=$、$\\le$、$\\ge$ |
| Alternative hypothesis, $H_1$ | 對立假設 | 研究者想找證據支持的方向 | 判斷左尾、右尾、雙尾 |
| Test statistic | 檢定統計量 | 把樣本資料標準化後用來做決策 | 選 $z$、$t$、$\\chi^2$、$F$ |
| Critical region | 拒絕域 | 落入此區就 reject $H_0$ | 給 $\\alpha$ 找臨界值 |
| Critical value | 臨界值 | 拒絕域的分界點 | $z_\\alpha$、$t_{\\alpha,df}$、$\\chi^2_\\alpha$ |
| Type I error | 第一型錯誤 | $H_0$ 為真卻 reject $H_0$ | 問 $\\alpha$ 的意思 |
| Type II error | 第二型錯誤 | $H_0$ 為假卻 fail to reject $H_0$ | 問 $\\beta$ 的意思 |
| Level of significance | 顯著水準 | Type I error 的最大容許機率 | 常見 $\\alpha=0.05$ 或 $0.01$ |
| P-value | P 值 | 在 $H_0$ 為真時，比目前結果更極端的機率 | 若 P-value $\\le\\alpha$ 則 reject $H_0$ |
| Degrees of freedom | 自由度 | 用來查 $t$、$\\chi^2$、$F$ 表的參數 | 單樣本常是 $n-1$ |

## 第 9 章：Confidence Interval 專業概念
- Confidence interval 不是說母體參數有某個機率落在區間中，而是長期重複抽樣時，有指定比例的區間會涵蓋真正參數。
- 估母體平均數 $\\mu$ 時，若母體標準差 $\\sigma$ 已知，用 $z$；若 $\\sigma$ 未知且資料近似常態，用 $t$。
- 估母體比例 $p$ 時，用 $\\hat p$ 和 $\\hat q=1-\\hat p$。
- 估母體變異數 $\\sigma^2$ 或標準差 $\\sigma$ 時，用 $\\chi^2$。
- 估兩母體變異數比 $\\sigma_1^2/\\sigma_2^2$ 時，用 $F$。

## 第 10 章：Hypothesis Test 專業概念
- $H_0$ 是「目前假設」或「基準假設」，沒有足夠證據時只能 fail to reject $H_0$。
- $H_1$ 決定拒絕域方向：$>$ 是右尾，$<$ 是左尾，$\\ne$ 是雙尾。
- Reject $H_0$ 表示資料提供足夠證據支持 $H_1$；fail to reject $H_0$ 只表示證據不足。
- 顯著水準 $\\alpha$ 越小，越不容易 reject $H_0$，Type I error 風險越低。
- 樣本數增加通常可以同時降低 Type I / Type II error 的壓力，讓檢定更有力。

## 可能選擇題方向
1. 問 null hypothesis 的角色：答案是被檢定的基準假設，通常包含等號。
2. 問 Type I error：答案是 $H_0$ true 但 reject $H_0$。
3. 問 Type II error：答案是 $H_0$ false 但 fail to reject $H_0$。
4. 問 P-value：答案是在 $H_0$ true 下，得到目前或更極端結果的機率。
5. 問 $H_1:\\mu>\\mu_0$ 的拒絕域：答案是右尾。
6. 問 paired t-test 自由度：答案是差值個數 $n$ 減 1。

## 可能計算題方向
1. 給題目敘述，寫出 $H_0$ 和 $H_1$。
2. 給 $\\bar x$、$s$、$n$，做單一母體平均數 $t$ 檢定。
3. 給 $s$、$n$、$\\sigma_0$，做母體標準差或變異數檢定。
4. 給兩組比例，做 $p_1-p_2$ 的信賴區間。
5. 給配對資料，先算差 $d$，再做 paired $t$ interval 或 test。
6. 給表格資料，判斷自由度與拒絕域，再寫統計結論。`
  },
  {
    id: 3,
    group: '考試範圍',
    title: '10.2~10.3 英文選擇題概念庫',
    content: `## 10.2 常考英文專有名詞
| English term | 中文 | 英文意思 | 選擇題辨認重點 |
|---|---|---|---|
| Statistical hypothesis | 統計假設 | An assertion or conjecture concerning one or more populations. | 看到 assertion、conjecture、population parameter 就想到 statistical hypothesis |
| Null hypothesis, $H_0$ | 虛無假設 | The hypothesis we wish to test. It often represents status quo or no effect. | 通常含等號；沒有足夠證據時是 fail to reject |
| Alternative hypothesis, $H_1$ | 對立假設 | The hypothesis accepted when $H_0$ is rejected. | 研究者想支持的方向；決定左尾、右尾、雙尾 |
| Test statistic | 檢定統計量 | A statistic computed from sample data and used to decide whether to reject $H_0$. | 問用哪個值做決策，就是 test statistic |
| Critical region / rejection region | 拒絕域 | The set of values of the test statistic for which $H_0$ is rejected. | 落入此區就 reject $H_0$ |
| Critical value | 臨界值 | The boundary value separating rejection and nonrejection regions. | 例如 $z_\\alpha$、$t_{\\alpha,df}$ |
| Level of significance | 顯著水準 | The probability of committing a type I error. | 就是 $\\alpha$ |
| P-value | P 值 | Probability, assuming $H_0$ is true, of observing a result at least as extreme as the sample result. | P-value $\\le\\alpha$ 則 reject $H_0$ |

## 10.3 常考錯誤類型
| English term | 中文 | 英文意思 | 公式或記憶 |
|---|---|---|---|
| Type I error | 第一型錯誤 | Rejecting $H_0$ when $H_0$ is true. | $\\alpha=P(\\text{reject }H_0\\mid H_0\\text{ true})$ |
| Type II error | 第二型錯誤 | Failing to reject $H_0$ when $H_0$ is false. | $\\beta=P(\\text{fail to reject }H_0\\mid H_0\\text{ false})$ |
| Power of a test | 檢定力 | Probability of rejecting $H_0$ when $H_0$ is false. | Power $=1-\\beta$ |
| Size of the test | 檢定大小 | The maximum probability of type I error. | 通常等於或小於 $\\alpha$ |
| Correct decision | 正確決策 | Reject false $H_0$ or fail to reject true $H_0$. | 對照 Type I / Type II error |

## 英文題目常見問法
- "Which statement represents the null hypothesis?"：找含等號、no difference、no effect、status quo 的選項。
- "Which statement represents the alternative hypothesis?"：找題目想證明的 claim，例如 greater than、less than、different from。
- "What is a type I error in this situation?"：把情境翻成「其實 $H_0$ 真的，但你說 reject」。
- "What is a type II error in this situation?"：把情境翻成「其實 $H_1$ 真的，但你沒有 reject $H_0$」。
- "What does the level of significance mean?"：答案是 probability of a type I error，不是 type II error。
- "If the P-value is less than $\\alpha$, what is the decision?"：reject $H_0$。
- "Failing to reject $H_0$ means..."：只代表 insufficient evidence，不代表 $H_0$ is proven true。

## 英文關鍵字對假設方向
- increase、greater than、more than、higher、exceeds：通常 $H_1:\\theta>\\theta_0$，右尾。
- decrease、less than、lower、below、reduced：通常 $H_1:\\theta<\\theta_0$，左尾。
- different、changed、not equal、has an effect：通常 $H_1:\\theta\\ne\\theta_0$，雙尾。
- no difference、no effect、same、equal：通常放在 $H_0$。

## 情境題翻譯範例
- "A new vaccine is superior"：superior 是更好，若參數是有效比例 $p$，常寫 $H_1:p>p_0$。
- "The machine is out of control if the variance exceeds..."：exceeds 是超過，常寫 $H_1:\\sigma^2>\\sigma_0^2$。
- "The average completion time is less than 35 minutes"：less than 是左尾，$H_1:\\mu<35$。
- "The two methods give different results"：different 是雙尾，$H_1:\\mu_1-\\mu_2\\ne0$。

## 容易錯的英文陷阱
- Do not reject $H_0$ 不等於 accept $H_0$；考試常用這點騙人。
- Significant difference 指的是統計上有足夠證據，不一定代表實務上差很多。
- $\\alpha$ 是你事先設定的風險；P-value 是樣本算出來的機率。
- Reject $H_0$ in favor of $H_1$ 表示支持對立假設，不是證明對立假設百分之百為真。
- Two-tailed test 的 $\\alpha$ 要分到兩邊，所以常用 $\\alpha/2$ 查臨界值。`
  },
  {
    id: 4,
    group: '考試範圍',
    title: 'H0/H1、拒絕域與自由度',
    content: `## 假設怎麼列
- 題目說「是否增加」：$H_0:\\theta=\\theta_0$，$H_1:\\theta>\\theta_0$。
- 題目說「是否減少」：$H_0:\\theta=\\theta_0$，$H_1:\\theta<\\theta_0$。
- 題目說「是否不同」：$H_0:\\theta=\\theta_0$，$H_1:\\theta\\ne\\theta_0$。
- 若題目說「至少」或「不低於」，通常主張含 $\\ge$；若要反駁，就用左尾。
- 若題目說「至多」或「不超過」，通常主張含 $\\le$；若要反駁，就用右尾。

## 拒絕域怎麼判斷
- $H_1:\\theta>\\theta_0$：右尾，拒絕域通常是 $z>z_\\alpha$ 或 $t>t_{\\alpha,df}$。
- $H_1:\\theta<\\theta_0$：左尾，拒絕域通常是 $z<-z_\\alpha$ 或 $t<-t_{\\alpha,df}$。
- $H_1:\\theta\\ne\\theta_0$：雙尾，拒絕域通常是 $|z|>z_{\\alpha/2}$ 或 $|t|>t_{\\alpha/2,df}$。
- $\\sigma^2$ 的檢定用 $\\chi^2$，左尾或右尾要看 $H_1$。
- $\\sigma_1^2/\\sigma_2^2$ 的檢定用 $F$，雙尾要同時看很小和很大的 $f$。

## 常見自由度
- 單一母體平均數，$\\sigma$ 未知：$df=n-1$。
- 單一母體變異數：$df=n-1$。
- 配對資料：先算差 $d$，再用 $df=n-1$。
- 兩獨立母體、假設變異數相等：$df=n_1+n_2-2$。
- 卡方適合度：$df=k-1$，若估了參數要再扣掉估計參數個數。
- 獨立性 / 齊一性檢定：$df=(r-1)(c-1)$。

## 結論句模板
- Reject $H_0$：有足夠證據支持 $H_1$ 的說法。
- Fail to reject $H_0$：沒有足夠證據支持 $H_1$，不是證明 $H_0$ 一定為真。`
  },
  {
    id: 5,
    group: '考試範圍',
    title: '第 9 章與第 10 章公式對照',
    content: `## 母體平均數
- 第 9 章信賴區間：$\\bar{x}\\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}$ 或 $\\bar{x}\\pm t_{\\alpha/2,n-1}\\frac{s}{\\sqrt n}$。
- 第 10 章假設檢定：$z=\\frac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt n}$ 或 $t=\\frac{\\bar{x}-\\mu_0}{s/\\sqrt n}$。

## 兩母體平均數
- 已知 $\\sigma_1,\\sigma_2$：$z=\\frac{(\\bar{x}_1-\\bar{x}_2)-d_0}{\\sqrt{\\sigma_1^2/n_1+\\sigma_2^2/n_2}}$。
- 未知但假設相等：先算 pooled variance $s_p^2$，再用 pooled $t$。
- 配對資料：先算 $d_i$，再用 $t=\\frac{\\bar{d}-d_0}{s_d/\\sqrt n}$。

## 母體比例
- 信賴區間：$\\hat p\\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat p\\hat q}{n}}$。
- 單一比例檢定：小樣本可用 binomial，大樣本用 $z=\\frac{\\hat p-p_0}{\\sqrt{p_0q_0/n}}$。
- 兩比例差信賴區間：$(\\hat p_1-\\hat p_2)\\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat p_1\\hat q_1}{n_1}+\\frac{\\hat p_2\\hat q_2}{n_2}}$。

## 母體標準差 / 變異數
- 估 $\\sigma^2$：$\\frac{(n-1)s^2}{\\chi^2_{\\alpha/2}}<\\sigma^2<\\frac{(n-1)s^2}{\\chi^2_{1-\\alpha/2}}$。
- 檢定 $\\sigma^2=\\sigma_0^2$：$\\chi^2=\\frac{(n-1)s^2}{\\sigma_0^2}$。
- 估兩變異數比：$\\frac{s_1^2/s_2^2}{f_{\\alpha/2}(v_1,v_2)}<\\frac{\\sigma_1^2}{\\sigma_2^2}<\\frac{s_1^2}{s_2^2}f_{\\alpha/2}(v_2,v_1)$。`
  },
  {
    id: 6,
    group: 'Assignment 5',
    title: 'Exercise 9.35',
    content: `## 題目目標
維吉尼亞州隨機抽取 $n=100$ 名車主，汽車每年平均行駛距離 $\\bar{x}=23500$ 公里，標準差 $s=3900$ 公里。

要求：
- (a) 求汽車每年平均行駛距離的 99% confidence interval。
- (b) 若以 23500 公里為估計值，99% confidence level 下可能誤差範圍是多少？

## 題型辨識
- 這是單一母體平均數 $\\mu$ 的信賴區間。
- 題目給的是樣本標準差 $s$，但樣本數 $n=100>30$，屬於大樣本。
- 大樣本時可用標準常態分配 $Z$ 近似。
- Part (b) 問 possible error，本質上就是 margin of error。

## 已知資料
$$ n=100,\\quad \\bar{x}=23500,\\quad s=3900 $$

99% confidence level：
$$ \\alpha=0.01,\\quad \\alpha/2=0.005 $$

查表：
$$ z_{0.005}=2.576 $$

## (a) 99% 信賴區間
公式：
$$ \\bar{x}\\pm z_{\\alpha/2}\\left(\\frac{s}{\\sqrt n}\\right) $$

代入：
$$ 23500\\pm2.576\\left(\\frac{3900}{\\sqrt{100}}\\right) $$
$$ 23500\\pm2.576(390) $$
$$ 23500\\pm1004.64 $$

下限：
$$ 23500-1004.64=22495.36 $$

上限：
$$ 23500+1004.64=24504.64 $$

## 答案
**(a) 99% confidence interval：$(22495.36,\\ 24504.64)$ 公里。**

## (b) 誤差範圍
誤差範圍 $E$ 就是信賴區間加減號後方的值：
$$ E=z_{\\alpha/2}\\left(\\frac{s}{\\sqrt n}\\right)=1004.64 $$

**(b) 我們有 99% 的信心斷言，估計誤差不會超過 1004.64 公里。**

## 考試提醒
- 大樣本平均數信賴區間常會問 margin of error。
- 若題目只問誤差範圍，不需要重新寫整個區間，直接算 $E$。
- 單位要保留：這題是公里。`
  },
  {
    id: 7,
    group: 'Assignment 5',
    title: 'Exercise 9.47',
    content: `## 題目目標
某品牌低脂穀物棒製造商聲稱其平均熱量為 130 卡。隨機抽取 $n=8$ 條，熱量分別為：
$$ 137,\\ 132,\\ 142,\\ 127,\\ 139,\\ 140,\\ 131,\\ 125 $$

假設熱量呈常態分配。

要求：
- (a) 求平均熱量的 99% confidence interval。
- (b) 製造商的聲明是否可信？

## 題型辨識
- 題目要估的是單一母體平均數 $\\mu$。
- 樣本數 $n=8<30$，屬於小樣本。
- 母體標準差未知，且題目假設常態分配，所以用 $t$ distribution。
- 要判斷聲明是否可信，就是看聲稱值 130 是否落在信賴區間內。

## 樣本統計量
總和：
$$ \\sum x_i=1073 $$

樣本平均數：
$$ \\bar{x}=\\frac{1073}{8}=134.125 $$

樣本變異數：
$$ s^2=\\frac{\\sum(x_i-\\bar{x})^2}{n-1}=\\frac{276.875}{7}=39.5536 $$

樣本標準差：
$$ s=\\sqrt{39.5536}=6.289 $$

## (a) 99% 信賴區間
自由度：
$$ df=n-1=7 $$

99% confidence level：
$$ \\alpha=0.01,\\quad \\alpha/2=0.005 $$

查 t 表：
$$ t_{0.005,7}=3.499 $$

公式：
$$ \\bar{x}\\pm t_{\\alpha/2}\\left(\\frac{s}{\\sqrt n}\\right) $$

代入：
$$ 134.125\\pm3.499\\left(\\frac{6.289}{\\sqrt8}\\right) $$
$$ 134.125\\pm3.499(2.2235) $$
$$ 134.125\\pm7.780 $$

下限：
$$ 134.125-7.780=126.345 $$

上限：
$$ 134.125+7.780=141.905 $$

## 答案
**(a) 平均熱量的 99% confidence interval：$(126.345,\\ 141.905)$。**

## (b) 聲明是否可信
製造商聲稱平均熱量為 130 卡。

因為 130 落在 99% confidence interval：
$$ (126.345,\\ 141.905) $$

所以這個聲明在 99% 信心水準下是可信的，也就是沒有足夠證據推翻製造商的說法。

## 考試提醒
- 小樣本、常態、$\\sigma$ 未知，請用 $t$。
- 聲明值是否可信，看它有沒有落在信賴區間內。
- 若區間包含聲稱值，不代表聲稱一定是真的，只代表沒有足夠證據反對。`
  },
  {
    id: 8,
    group: 'Assignment 6',
    title: 'Exercise 9.53',
    content: `## 題目目標
樣本 $n=200$，其中 $x=114$ 人支持。求支持比例的 96% confidence interval，並說明估計為 0.57 時誤差大小。

## 題型辨識
- 題目問 fraction、proportion、percentage，通常就是母體比例 $p$。
- 樣本比例是 $\\hat p=x/n$。
- 大樣本比例信賴區間用 normal approximation，所以查 $z$。
- Part (b) 問 possible size of error，其實就是 margin of error。

## 解題步驟
1. 算 $\\hat p=114/200$ 和 $\\hat q=1-\\hat p$。
2. 96% CI 表示 $\\alpha=0.04$，所以兩尾各 $0.02$。
3. 查 $z_{0.02}=2.054$。
4. 套比例信賴區間公式。
5. Part (b) 直接拿 margin of error 當最大誤差。

## (a) 96% confidence interval
$$ \\hat p=\\frac{114}{200}=0.57,\\quad \\hat q=0.43 $$

96% CI 中 $\\alpha=0.04$，所以 $z_{0.02}=2.054$。

$$ \\hat p\\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat p\\hat q}{n}} $$
$$ 0.57\\pm2.054\\sqrt{\\frac{(0.57)(0.43)}{200}} $$
$$ 0.57\\pm2.054(0.0350)=0.57\\pm0.0719 $$

**96% CI：$(0.4981,\\ 0.6419)$。**

## (b) 誤差大小
誤差界限就是 margin of error：
$$ E=0.0719 $$

所以用 0.57 估計母體比例時，有 96% 信心誤差不超過 **0.0719**，約 **7.19 個百分點**。`
  },
  {
    id: 9,
    group: 'Assignment 6',
    title: 'Exercise 9.67',
    content: `## 題目目標
未接種組 500 隻中 120 隻發病，接種組 500 隻中 98 隻發病。求 $p_1-p_2$ 的 90% confidence interval，其中 $p_1$ 是未接種發病率，$p_2$ 是接種發病率。

## 題型辨識
- 兩組各自統計「有沒有發病」，所以是 two proportions。
- 題目指定 $p_1-p_2$，不能反過來寫成 $p_2-p_1$。
- 這題是信賴區間，不是假設檢定，所以不用 pooled proportion。
- 信賴區間要分別用 $\\hat p_1\\hat q_1/n_1$ 和 $\\hat p_2\\hat q_2/n_2$。

## 解題步驟
1. 設 $p_1$ 為未接種發病率，$p_2$ 為接種發病率。
2. 分別算 $\\hat p_1$、$\\hat p_2$。
3. 計算點估計 $\\hat p_1-\\hat p_2$。
4. 90% CI 查 $z_{0.05}=1.645$。
5. 若區間全部大於 0，代表未接種發病率較高的證據較強。

## 解法
$$ \\hat p_1=\\frac{120}{500}=0.240,\\quad \\hat q_1=0.760 $$
$$ \\hat p_2=\\frac{98}{500}=0.196,\\quad \\hat q_2=0.804 $$

90% CI 中 $z_{0.05}=1.645$。

$$ (\\hat p_1-\\hat p_2)\\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat p_1\\hat q_1}{n_1}+\\frac{\\hat p_2\\hat q_2}{n_2}} $$
$$ \\hat p_1-\\hat p_2=0.240-0.196=0.044 $$
$$ SE=\\sqrt{\\frac{(0.240)(0.760)}{500}+\\frac{(0.196)(0.804)}{500}}=0.02608 $$
$$ E=1.645(0.02608)=0.0429 $$

## 答案
$$ 0.044\\pm0.0429=(0.0011,\\ 0.0869) $$

**90% CI：$(0.001,\\ 0.087)$。**

整個區間大於 0，表示未接種組發病率可能高於接種組，接種有降低發病率的跡象。`
  },
  {
    id: 10,
    group: 'Assignment 7',
    title: 'Exercise 9.75',
    content: `## 題目目標
隨機抽取 $n=20$ 名學生的大學數學分班測驗成績，樣本平均數 $\\bar{x}=72$，樣本變異數 $s^2=16$。假設成績呈常態分配，求母體變異數 $\\sigma^2$ 的 98% confidence interval。

## 題型辨識
- 題目要估的是母體變異數 $\\sigma^2$，不是母體平均數。
- 變異數的信賴區間要用 chi-square distribution，也就是 $\\chi^2$ 分配。
- 題目已假設常態分配，這是使用 $\\chi^2$ 變異數區間的重要前提。
- 這題問的是 $\\sigma^2$，所以最後不用開根號。

## 解題步驟
1. 寫出 $n=20$、$s^2=16$。
2. 自由度 $df=n-1=19$。
3. 98% confidence level 表示 $\\alpha=0.02$，所以 $\\alpha/2=0.01$。
4. 查 $\\chi^2$ 表的兩個臨界值。
5. 套單一母體變異數信賴區間公式。

## 已知資料
$$ n=20,\\quad s^2=16,\\quad df=19 $$

信心水準 98%：
$$ \\alpha=0.02,\\quad \\alpha/2=0.01 $$

查卡方分配表：
- 右尾 $\\chi^2_{0.01,19}=36.191$
- 左尾 $\\chi^2_{0.99,19}=7.633$

## 98% 信賴區間
公式：
$$ \\frac{(n-1)s^2}{\\chi^2_{\\alpha/2}}\\le\\sigma^2\\le\\frac{(n-1)s^2}{\\chi^2_{1-\\alpha/2}} $$

代入：
$$ \\frac{19\\times16}{36.191}\\le\\sigma^2\\le\\frac{19\\times16}{7.633} $$
$$ \\frac{304}{36.191}\\le\\sigma^2\\le\\frac{304}{7.633} $$
$$ 8.40\\le\\sigma^2\\le39.83 $$

## 答案
**母體變異數 $\\sigma^2$ 的 98% confidence interval：$(8.40,\\ 39.83)$。**

## 考試提醒
- 看到 variance 或 $\\sigma^2$，不要用 $t$；要用 $\\chi^2$。
- 如果題目問標準差 $\\sigma$，才需要把變異數區間上下界開根號。
- 卡方區間的分母大小會反過來影響上下界，代入時要小心順序。`
  },
  {
    id: 11,
    group: 'Assignment 7',
    title: 'Exercise 9.77',
    content: `## 題目目標
根據 Exercise 9.42：
- VW：$n_1=12,\\ s_1=1.0$
- Toyota：$n_2=10,\\ s_2=0.8$

求 $\\sigma_1/\\sigma_2$ 的 98% confidence interval。

## 題型辨識
- 題目問的是兩個母體標準差的比 $\\sigma_1/\\sigma_2$。
- $F$ 分配處理的是變異數比，所以要先建立 $\\sigma_1^2/\\sigma_2^2$ 的區間。
- 最後再對上下界開根號，才得到 $\\sigma_1/\\sigma_2$。
- 注意分子分母順序：VW 是 group 1，Toyota 是 group 2。

## 解題步驟
1. 算自由度 $v_1=n_1-1=11$、$v_2=n_2-1=9$。
2. 算樣本變異數比 $s_1^2/s_2^2$。
3. 98% CI 表示 $\\alpha=0.02$，所以用 $f_{0.01}$。
4. 下界除以 $f_{0.01}(v_1,v_2)$，上界乘以 $f_{0.01}(v_2,v_1)$。
5. 開根號得到標準差比。

## 解法
先求變異數比，再開根號：
$$ \\frac{s_1^2/s_2^2}{f_{\\alpha/2}(v_1,v_2)}<\\frac{\\sigma_1^2}{\\sigma_2^2}<\\frac{s_1^2}{s_2^2}f_{\\alpha/2}(v_2,v_1) $$

98% CI 中 $\\alpha=0.02$，所以 $\\alpha/2=0.01$。

$$ v_1=11,\\quad v_2=9 $$
$$ \\frac{s_1^2}{s_2^2}=\\frac{1.0^2}{0.8^2}=1.5625 $$

- $f_{0.01}(11,9)\\approx5.18$
- $f_{0.01}(9,11)\\approx4.63$

$$ \\frac{1.5625}{5.18}<\\frac{\\sigma_1^2}{\\sigma_2^2}<1.5625(4.63) $$
$$ 0.301<\\frac{\\sigma_1^2}{\\sigma_2^2}<7.234 $$
$$ 0.549<\\frac{\\sigma_1}{\\sigma_2}<2.690 $$

## 答案
**98% CI for $\\sigma_1/\\sigma_2$：$(0.549,\\ 2.690)$。**`
  },
  {
    id: 12,
    group: 'Assignment 7',
    title: 'Exercise 9.79',
    content: `## 題目目標
根據 Exercise 9.46，求 $\\sigma_1^2/\\sigma_2^2$ 的 90% confidence interval，並判斷先前是否應假設 $\\sigma_1^2=\\sigma_2^2$。

## 題型辨識
- 題目直接問 $\\sigma_1^2/\\sigma_2^2$，所以答案停在變異數比，不用開根號。
- 這題還要用區間判斷 equal variance assumption 是否合理。
- 判斷方法：如果 1 在區間內，變異數相等仍有可能；如果 1 不在區間內，不應假設相等。
- 兩組樣本數不同，自由度分別是 $v_1=4$、$v_2=6$。

資料：
- Company I：103, 94, 110, 87, 98
- Company II：97, 82, 123, 92, 175, 88, 118

## 樣本變異數
$$ n_1=5,\\quad s_1^2=76.3 $$
$$ n_2=7,\\quad s_2^2=1035.9 $$
$$ \\frac{s_1^2}{s_2^2}=\\frac{76.3}{1035.9}=0.0736 $$

## 解法
90% CI 中 $\\alpha=0.10$，所以 $\\alpha/2=0.05$。

$$ v_1=4,\\quad v_2=6 $$

- $f_{0.05}(4,6)=4.53$
- $f_{0.05}(6,4)=6.16$

$$ \\frac{0.0736}{4.53}<\\frac{\\sigma_1^2}{\\sigma_2^2}<0.0736(6.16) $$

## 答案
$$ 0.016<\\frac{\\sigma_1^2}{\\sigma_2^2}<0.454 $$

**90% CI：$(0.016,\\ 0.454)$。**

因為 1 不在區間內，兩母體變異數不太可能相等，所以不應該假設 $\\sigma_1^2=\\sigma_2^2$。`
  },
  {
    id: 13,
    group: 'Assignment 7',
    title: 'Exercise 10.9',
    content: `## 題目目標
研究報告指出，將飲食中 40% 的卡路里替換為維生素與蛋白質，能讓原本平均壽命 32 個月的老鼠活到約 40 個月，也就是宣稱 $\\mu=40$。

現有 $n=64$ 隻老鼠採用此飲食，平均壽命 $\\bar{x}=38$ 個月，標準差 $s=5.8$ 個月。是否有理由相信真實平均壽命 $\\mu<40$？請使用 P-value 下結論。

## 題型辨識
- 題目問「是否小於 40」，所以是左尾檢定。
- 要檢定的是母體平均數 $\\mu$。
- 樣本數 $n=64$ 是大樣本，因此可用 $Z$ 分配近似。
- 題目指定使用 P-value，因此不用只靠臨界值法。

## 1. 建立假設
虛無假設：
$$ H_0:\\mu=40 $$

對立假設：
$$ H_a:\\mu<40 $$

因為是 $\\mu<40$，所以是左尾檢定。

## 2. 計算檢定統計量
公式：
$$ z=\\frac{\\bar{x}-\\mu_0}{s/\\sqrt n} $$

代入：
$$ z=\\frac{38-40}{5.8/\\sqrt{64}} $$
$$ z=\\frac{-2}{5.8/8}=\\frac{-2}{0.725}=-2.758 $$

## 3. P-value
左尾檢定：
$$ P\\text{-value}=P(Z<-2.758) $$

查標準常態分配表：
$$ P(Z<-2.76)\\approx0.0029 $$

因為 P-value 很小，低於常見顯著水準，例如 $0.05$ 或 $0.01$。

## 答案
**Reject $H_0$。**

有充足的統計證據顯示，採用此飲食的老鼠真實平均壽命確實小於 40 個月，也就是 $\\mu<40$。

## 考試提醒
- 題目說 use a P-value，就要寫出 P-value 並和顯著水準比較。
- 左尾檢定的 P-value 是 $P(Z<z)$。
- 若 P-value 小於 $\\alpha$，結論是 reject $H_0$。`
  },
  {
    id: 14,
    group: 'Assignment 7',
    title: 'Exercise 10.17',
    content: `## 題目目標
檢定某種潤滑油的容器平均容量是否為 10 公升。隨機抽取 10 個容器，測得容量為：
$$ 10.2,\\ 9.7,\\ 10.1,\\ 10.3,\\ 10.1,\\ 9.8,\\ 9.9,\\ 10.4,\\ 10.3,\\ 9.8 $$

顯著水準 $\\alpha=0.01$，假設容量分佈呈常態。

## 題型辨識
- 題目問平均容量是否為 10 公升，所以是母體平均數檢定。
- 樣本數 $n=10<30$，且母體標準差未知。
- 題目假設常態分佈，因此使用 one-sample $t$ test。
- 「是否為 10」代表可能大於或小於 10，所以是雙尾檢定。

## 解題步驟
1. 算樣本平均數 $\\bar{x}$。
2. 算樣本標準差 $s$。
3. 寫 $H_0$ 和 $H_a$。
4. 用 $t=\\frac{\\bar{x}-\\mu_0}{s/\\sqrt n}$。
5. 雙尾檢定，查 $t_{0.005,9}$。

## 1. 計算樣本統計量
樣本大小：
$$ n=10 $$

總和：
$$ \\sum x_i=100.6 $$

樣本平均數：
$$ \\bar{x}=\\frac{100.6}{10}=10.06 $$

平方離差和：
$$ \\sum(x_i-\\bar{x})^2=0.544 $$

樣本變異數：
$$ s^2=\\frac{0.544}{9}=0.06044 $$

樣本標準差：
$$ s=\\sqrt{0.06044}=0.24585 $$

## 2. 建立假設
虛無假設：
$$ H_0:\\mu=10 $$

對立假設：
$$ H_a:\\mu\\ne10 $$

## 3. 計算檢定統計量
公式：
$$ t=\\frac{\\bar{x}-\\mu_0}{s/\\sqrt n} $$

代入：
$$ t=\\frac{10.06-10}{0.24585/\\sqrt{10}} $$
$$ t=\\frac{0.06}{0.07774}=0.772 $$

## 4. 臨界值與決策
自由度：
$$ df=n-1=9 $$

顯著水準 $\\alpha=0.01$，雙尾檢定：
$$ \\alpha/2=0.005 $$

查 t 表：
$$ t_{0.005,9}=3.250 $$

拒絕域：
$$ t>3.250\\quad\\text{or}\\quad t<-3.250 $$

因為：
$$ -3.250<0.772<3.250 $$

所以 $t=0.772$ 未落入拒絕域。

## 答案
**Fail to reject $H_0$。**

在 $\\alpha=0.01$ 下，沒有足夠證據證明潤滑油的平均容量不是 10 公升。

## 考試提醒
- 「是否為」通常是雙尾檢定。
- 小樣本、常態、$\\sigma$ 未知，使用 $t$ test。
- 沒有拒絕 $H_0$ 不等於證明平均值一定是 10，只是證據不足。`
  },
  {
    id: 15,
    group: 'Assignment 8',
    title: 'Exercise 10.29',
    content: `## 題目目標
過去經驗指出，高中生完成標準化測驗所需時間服從常態，標準差為 6 分鐘。現在抽樣 $n=20$，樣本標準差 $s=4.51$。用 $\\alpha=0.05$ 檢定：
$$ H_0:\\sigma=6,\\quad H_1:\\sigma<6 $$

## 題型辨識
- 題目問的是 standard deviation $\\sigma$，不是 mean $\\mu$。
- 母體近似常態，且要檢定標準差，所以使用 $\\chi^2$ test。
- 因為 $H_1:\\sigma<6$，這是左尾檢定。
- 檢定可以寫成 $\\sigma=6$，但計算時通常轉成 $\\sigma^2=36$。
- 自由度是 $df=n-1=19$。

## 解法
卡方檢定統計量：
$$ \\chi^2=\\frac{(n-1)s^2}{\\sigma_0^2} $$

代入：
$$ \\chi^2=\\frac{(20-1)(4.51)^2}{6^2}=10.735 $$

左尾檢定，$\\alpha=0.05$，$df=19$：
$$ \\chi^2_{0.95,19}=10.117 $$

拒絕域：
$$ \\chi^2<10.117 $$

## 結論
因為 $10.735>10.117$，沒有落入拒絕域，所以 **fail to reject $H_0$**。

在 0.05 顯著水準下，沒有足夠證據認為完成時間的母體標準差小於 6 分鐘。

## 考試提醒
- 看到 standard deviation、variance、$s$、$\\sigma$，要先想到 $\\chi^2$。
- 左尾卡方檢定常容易查表方向錯；這題拒絕域在小的 $\\chi^2$ 值。
- 結論不能寫「接受 $H_0$」，要寫 fail to reject $H_0$。`
  },
  {
    id: 16,
    group: 'Assignment 8',
    title: 'Exercise 10.43',
    content: `## 題目目標
建商聲稱該市新建房屋中，有 70% 安裝了熱泵 heat pumps。隨機調查 15 棟新屋，發現有 8 棟安裝了熱泵。在顯著水準 $\\alpha=0.10$ 下，你是否同意建商的聲稱？

## 題型辨識
- 題目問的是比例 $p$，因為每棟房屋只有「有安裝」或「沒有安裝」兩種結果。
- 樣本數 $n=15$ 很小。
- 在 $H_0:p=0.70$ 下，$np=10.5$，$n(1-p)=4.5<5$，所以嚴格來說不適合用常態近似。
- 正確做法是使用 exact binomial test。
- 題目問是否同意「70%」這個聲稱，代表檢定 $p=0.70$ 是否合理，使用雙尾檢定。

## 1. 建立假設
虛無假設：
$$ H_0:p=0.70 $$

對立假設：
$$ H_a:p\\ne0.70 $$

## 2. 使用二項分配求 P-value
令 $X$ 為 15 棟新屋中有安裝熱泵的房屋數量。

若 $H_0$ 為真：
$$ X\\sim Bin(15,0.70) $$

觀察到：
$$ x=8 $$

期望值：
$$ \\mu=np=15(0.70)=10.5 $$

因為觀察值 $8<10.5$，先算左尾機率：
$$ P(X\\le8\\mid n=15,p=0.70)=\\sum_{x=0}^{8}\\binom{15}{x}(0.70)^x(0.30)^{15-x} $$

查二項分配累加機率表或用公式計算：
$$ P(X\\le8)=0.1311 $$

雙尾檢定的 P-value：
$$ P\\text{-value}=2(0.1311)=0.2622 $$

## 3. 統計決策
比較：
$$ P\\text{-value}=0.2622>\\alpha=0.10 $$

## 結論
因為 P-value 大於顯著水準，所以 **fail to reject $H_0$**。

在 $\\alpha=0.10$ 下，沒有足夠證據反對建商所說的「70% 新屋有安裝熱泵」。因此可以說我們沒有理由不同意這項聲稱。

## 補充：若課堂允許常態近似
樣本比例：
$$ \\hat p=\\frac{8}{15}=0.533 $$

檢定統計量：
$$ z=\\frac{0.533-0.70}{\\sqrt{0.70(0.30)/15}}=-1.41 $$

雙尾 $\\alpha=0.10$ 的臨界值：
$$ z_{0.05}=\\pm1.645 $$

因為 $-1.41$ 沒有落入拒絕域，所以結論同樣是 fail to reject $H_0$。

## 考試提醒
- 小樣本比例題優先想 exact binomial test。
- 若 $np$ 或 $nq$ 小於 5，使用常態近似要很小心。
- P-value 大於 $\\alpha$ 時，不是「證明建商是對的」，而是沒有足夠證據反對建商聲稱。`
  }
];

const groupOrder: NoteGroup[] = [
  '考試範圍',
  'Assignment 5',
  'Assignment 6',
  'Assignment 7',
  'Assignment 8'
];

function Latex({ text, displayMode = false }: { text: string; displayMode?: boolean }) {
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    katex.render(text, containerRef.current, {
      displayMode,
      throwOnError: false,
      strict: false
    });
  }, [text, displayMode]);

  return (
    <span
      ref={containerRef}
      className={`${displayMode ? 'block my-8 text-center text-[1.15em]' : 'inline-block px-1.5 text-[1.05em]'} text-stone-800`}
    />
  );
}

function InlineText({ text }: { text: string }) {
  const tokens = text.split(/(\$.*?\$|\*\*.*?\*\*)/g);

  return (
    <>
      {tokens.map((token, index) => {
        if (token.startsWith('$') && token.endsWith('$')) {
          return <Latex key={`${token}-${index}`} text={token.slice(1, -1)} />;
        }
        if (token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={`${token}-${index}`} className="font-bold text-[#1f1a17]">
              {token.slice(2, -2)}
            </strong>
          );
        }
        return <span key={`${token}-${index}`}>{token}</span>;
      })}
    </>
  );
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const usefulRows = lines.filter((line) => !/^\|\s*:?-{3,}/.test(line.trim()));
  const rows = usefulRows.map((line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim())
  );
  const [head, ...body] = rows;

  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-[#e8e4db] bg-white">
      <table className="min-w-full text-left text-[14px]">
        <thead className="bg-[#f6f4ef] text-[#3b3631]">
          <tr>
            {head.map((cell, index) => (
              <th key={`${cell}-${index}`} className="whitespace-nowrap px-4 py-3 font-bold">
                <InlineText text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e8e4db]">
          {body.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="whitespace-nowrap px-4 py-3 text-[#3b3631]">
                  <InlineText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useRenderedContent(text: string) {
  return useMemo(() => {
    if (!text) return null;

    const lines = text.trim().split('\n');
    const blocks: React.ReactNode[] = [];
    let paragraph: string[] = [];
    let bulletList: string[] = [];
    let orderedList: string[] = [];
    let table: string[] = [];
    let mathLines: string[] = [];
    let collectingMath = false;

    const flushParagraph = () => {
      if (!paragraph.length) return;
      blocks.push(
        <p
          key={`p-${blocks.length}`}
          className="mb-5 text-[15.5px] leading-[1.85] tracking-[0.02em] text-[#3b3631] sm:text-[16px]"
        >
          {paragraph.map((line, lineIndex) => (
            <React.Fragment key={`${line}-${lineIndex}`}>
              <InlineText text={line} />
              {lineIndex < paragraph.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
      paragraph = [];
    };

    const flushBulletList = () => {
      if (!bulletList.length) return;
      blocks.push(
        <ul
          key={`ul-${blocks.length}`}
          className="mb-6 list-disc space-y-2 pl-6 text-[15.5px] leading-[1.85] text-[#3b3631] sm:text-[16px]"
        >
          {bulletList.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
      bulletList = [];
    };

    const flushOrderedList = () => {
      if (!orderedList.length) return;
      blocks.push(
        <ol
          key={`ol-${blocks.length}`}
          className="mb-6 list-decimal space-y-2 pl-6 text-[15.5px] leading-[1.85] text-[#3b3631] sm:text-[16px]"
        >
          {orderedList.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>
              <InlineText text={item} />
            </li>
          ))}
        </ol>
      );
      orderedList = [];
    };

    const flushTable = () => {
      if (!table.length) return;
      blocks.push(<MarkdownTable key={`table-${blocks.length}`} lines={table} />);
      table = [];
    };

    const flushMath = () => {
      if (!mathLines.length) return;
      const expression = mathLines
        .join('\n')
        .replace(/^\s*\$\$\s*/, '')
        .replace(/\s*\$\$\s*$/, '');
      blocks.push(
        <div key={`math-${blocks.length}`} className="flex justify-center overflow-x-auto">
          <Latex text={expression} displayMode />
        </div>
      );
      mathLines = [];
      collectingMath = false;
    };

    const flushAll = () => {
      flushParagraph();
      flushBulletList();
      flushOrderedList();
      flushTable();
      flushMath();
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trim();

      if (collectingMath) {
        mathLines.push(line);
        if (line.endsWith('$$')) flushMath();
        return;
      }

      if (!line) {
        flushAll();
        return;
      }

      if (line.startsWith('$$')) {
        flushAll();
        mathLines.push(line);
        if (line.endsWith('$$') && line.length > 2) flushMath();
        else collectingMath = true;
        return;
      }

      if (line.startsWith('|')) {
        flushParagraph();
        flushBulletList();
        flushOrderedList();
        table.push(line);
        return;
      }

      flushTable();

      if (line.startsWith('## ')) {
        flushAll();
        blocks.push(
          <h2
            key={`h2-${blocks.length}`}
            className="mb-4 mt-9 text-[22px] font-bold tracking-tight text-[#1f1a17] first:mt-0"
          >
            {line.slice(3)}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        flushAll();
        blocks.push(
          <h3 key={`h3-${blocks.length}`} className="mb-3 mt-7 text-[18px] font-bold text-[#3b3631]">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      if (line.startsWith('- ')) {
        flushParagraph();
        flushOrderedList();
        bulletList.push(line.slice(2));
        return;
      }

      const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
      if (orderedMatch) {
        flushParagraph();
        flushBulletList();
        orderedList.push(orderedMatch[1]);
        return;
      }

      flushBulletList();
      flushOrderedList();
      paragraph.push(line);
    });

    flushAll();

    return blocks;
  }, [text]);
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<number>(initialNotes[0].id);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', content: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0];
  const renderedContent = useRenderedContent(activeNote?.content ?? '');

  const filteredNotes = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(normalizedQuery) ||
        note.content.toLowerCase().includes(normalizedQuery) ||
        note.group.toLowerCase().includes(normalizedQuery)
    );
  }, [notes, searchQuery]);

  const handleEdit = () => {
    setEditForm({ title: activeNote.title, content: activeNote.content });
    setIsEditing(true);
  };

  const handleSave = () => {
    setNotes((currentNotes) =>
      currentNotes.map((note) => (note.id === activeNoteId ? { ...note, ...editForm } : note))
    );
    setIsEditing(false);
  };

  const handleAdd = () => {
    const newNote: Note = {
      id: Date.now(),
      group: '考試範圍',
      title: '未命名筆記',
      content: ''
    };
    setNotes((currentNotes) => [newNote, ...currentNotes]);
    setActiveNoteId(newNote.id);
    setEditForm({ title: newNote.title, content: newNote.content });
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (!window.confirm('確定要刪除這份筆記嗎？')) return;

    const newNotes = notes.filter((note) => note.id !== activeNoteId);
    setNotes(newNotes);
    if (newNotes.length > 0) setActiveNoteId(newNotes[0].id);
    setIsEditing(false);
  };

  const groupedNotes = groupOrder
    .map((group) => ({
      group,
      items: filteredNotes.filter((note) => note.group === group)
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <div className="flex h-screen bg-[#ece7df] p-0 font-sans selection:bg-[#d6cfc4] selection:text-[#1f1a17] sm:p-6">
      <div className="mx-auto flex w-full max-w-[1400px] overflow-hidden border border-[#e2ddd5] bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] sm:rounded-2xl">
        <div className="z-20 hidden w-72 flex-shrink-0 flex-col border-r border-[#e8e4db] bg-[#f6f4ef] md:flex">
          <div className="p-6 pb-4">
            <div className="mb-6 flex items-center gap-3 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b3631] text-[#f6f4ef] shadow-sm">
                <Library size={18} />
              </div>
              <h1 className="text-[17px] font-bold tracking-wide text-[#1f1a17]">機統筆記庫</h1>
            </div>

            <div className="relative mb-2">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-[#a8a196]"
              />
              <input
                type="text"
                placeholder="搜尋筆記..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-[#e8e4db] bg-white py-2 pl-9 pr-3 text-[14px] text-[#3b3631] shadow-sm transition-shadow placeholder:text-[#a8a196] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#d6cfc4]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {groupedNotes.map(({ group, items }) => (
              <section key={group} className="mb-5">
                <h2 className="mb-2 mt-2 px-3 text-[11px] font-bold uppercase tracking-wider text-[#a8a196]">
                  {group}
                </h2>
                <div className="space-y-[2px]">
                  {items.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        setActiveNoteId(note.id);
                        setIsEditing(false);
                      }}
                      className={`group flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all ${
                        activeNoteId === note.id
                          ? 'border-[#e8e4db] bg-white font-semibold text-[#1f1a17] shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                          : 'border-transparent text-[#6d665e] hover:bg-[#eeebe4]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                        <FileText
                          size={15}
                          className={activeNoteId === note.id ? 'text-[#8a8175]' : 'text-[#b5b0a6]'}
                        />
                        <span className="truncate text-[14px] leading-tight">{note.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="border-t border-[#e8e4db] bg-[#f6f4ef] p-4">
            <button
              onClick={handleAdd}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3b3631] py-2.5 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-[#1f1a17]"
            >
              <Plus size={16} />
              <span>新增筆記</span>
            </button>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col overflow-hidden bg-[#fcfbf9]">
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(#d6cfc4 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '-12px -12px'
            }}
          />

          {notes.length > 0 ? (
            <div className="relative z-10 flex h-full flex-1 flex-col">
              <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[#eee9e1] bg-[#fcfbf9]/90 px-4 py-3 backdrop-blur-sm transition-colors sm:px-8 sm:py-4 md:border-transparent">
                <select
                  value={activeNoteId}
                  onChange={(event) => {
                    setActiveNoteId(Number(event.target.value));
                    setIsEditing(false);
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-[#e8e4db] bg-white px-3 py-2 text-[14px] font-medium text-[#3b3631] shadow-sm outline-none focus:ring-2 focus:ring-[#d6cfc4] md:hidden"
                >
                  {groupedNotes.map(({ group, items }) => (
                    <optgroup key={group} label={group}>
                      {items.map((note) => (
                        <option key={note.id} value={note.id}>
                          {note.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 rounded-md bg-[#4a5d4e] px-4 py-1.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#3a4a3e]"
                  >
                    <Check size={14} /> 儲存編輯
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-[#6d665e] transition-colors hover:bg-[#eeebe4] hover:text-[#1f1a17]"
                    >
                      <Edit3 size={15} /> 編輯
                    </button>
                    <div className="mx-1 h-4 w-px bg-[#e8e4db]" />
                    <button
                      onClick={handleDelete}
                      className="rounded-md p-1.5 text-[#a8a196] transition-colors hover:bg-red-50 hover:text-red-600"
                      title="刪除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-24 pt-6 sm:px-8 md:px-16 md:pb-32 md:pt-8 lg:px-24">
                <div className="mx-auto w-full max-w-3xl">
                  {isEditing ? (
                    <div className="flex h-full w-full animate-in flex-col fade-in duration-200">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                        className="mb-8 w-full border-none bg-transparent font-serif text-3xl font-bold tracking-tight text-[#1f1a17] outline-none placeholder:text-[#d6cfc4] sm:text-4xl"
                        placeholder="請輸入標題..."
                      />

                      <textarea
                        value={editForm.content}
                        onChange={(event) => setEditForm({ ...editForm, content: event.target.value })}
                        className="min-h-[60vh] w-full flex-1 resize-none border-none bg-transparent font-mono text-[15px] leading-[1.8] tracking-wide text-[#3b3631] outline-none placeholder:text-[#b5b0a6] sm:text-[16px]"
                        placeholder="在此輸入您的筆記內容... (支援 Markdown 與 $...$ / $$...$$ 公式語法)"
                      />
                    </div>
                  ) : (
                    <div className="w-full animate-in fade-in duration-200">
                      <div className="mb-5 inline-flex rounded-full border border-[#e8e4db] bg-white/70 px-3 py-1 text-[12px] font-bold text-[#8a8175] shadow-sm">
                        {activeNote.group}
                      </div>
                      <h1 className="mb-10 border-b border-[#e8e4db] pb-6 font-serif text-3xl font-bold tracking-tight text-[#1f1a17] sm:text-4xl">
                        {activeNote.title}
                      </h1>

                      <div className="prose-custom">{renderedContent}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-[#b5b0a6]">
              <Book size={48} className="mb-4 text-[#e8e4db]" strokeWidth={1.5} />
              <p className="text-[15px] tracking-wide">筆記庫空空如也，點擊左側開始新增筆記吧。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
