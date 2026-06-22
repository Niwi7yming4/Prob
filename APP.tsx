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
已知 $n_1=30,\\ \\bar{x}_1=65,\\ \\sigma_1=4$；$n_2=48,\\ \\bar{x}_2=58,\\ \\sigma_2=3$。求 $\\mu_1-\\mu_2$ 的 98% confidence interval。

## 題型辨識
- 關鍵字是 two random samples、two normal populations、standard deviation 已知。
- 要估的是 $\\mu_1-\\mu_2$，所以是兩母體平均數差的信賴區間。
- 題目直接給 $\\sigma_1$ 和 $\\sigma_2$，所以用 $z$，不是用 $t$。

## 解題步驟
1. 先決定點估計：$\\bar{x}_1-\\bar{x}_2$。
2. 再算標準誤：$SE=\\sqrt{\\sigma_1^2/n_1+\\sigma_2^2/n_2}$。
3. 98% CI 代表 $\\alpha=0.02$，兩尾各 $0.01$。
4. 查 $z_{0.01}=2.326$，最後做 point estimate $\\pm$ margin of error。

## 解法
兩母體標準差已知，用 $z$ interval：
$$ (\\bar{x}_1-\\bar{x}_2)\\pm z_{\\alpha/2}\\sqrt{\\frac{\\sigma_1^2}{n_1}+\\frac{\\sigma_2^2}{n_2}} $$

98% CI 中 $\\alpha=0.02$，所以 $z_{0.01}=2.326$。

$$ \\bar{x}_1-\\bar{x}_2=65-58=7 $$
$$ SE=\\sqrt{\\frac{4^2}{30}+\\frac{3^2}{48}}=0.8490 $$
$$ E=2.326(0.8490)=1.975 $$

## 答案
$$ 7\\pm1.975=(5.025,\\ 8.975) $$

**98% CI：$(5.02,\\ 8.98)$。**`
  },
  {
    id: 7,
    group: 'Assignment 5',
    title: 'Exercise 9.47',
    content: `## 題目目標
比較 8 家公司的 2014 與 2015 資產成長百分比，求平均改變量的 95% confidence interval。

## 題型辨識
- 同一家公司的 2014 和 2015 是成對資料，不是兩組獨立樣本。
- paired data 的第一步一定是先算差值 $d$。
- 只對差值做單一樣本 $t$ interval，因為母體標準差未知。
- 自由度是差值個數減 1，所以 $df=8-1=7$。

令 $d=2015-2014$。完整 8 筆差值：

| 公司 | A | B | C | D | E | F | G | H |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| $d$ | 4.6 | -4.3 | -5.1 | -2.5 | 3.5 | -3.2 | 1.1 | 2.2 |

## 解法
這是同一家公司前後兩年的比較，所以用 paired $t$ interval：
$$ \\bar d\\pm t_{\\alpha/2,n-1}\\frac{s_d}{\\sqrt n} $$

## 解題步驟
1. 算每家公司差值 $d_i=2015_i-2014_i$。
2. 算差值平均 $\\bar d$。
3. 算差值標準差 $s_d$。
4. 用 $t_{0.025,7}$，因為 95% CI 是雙尾。
5. 看區間是否包含 0，判斷平均改變是否明顯。

- $n=8$
- $\\bar d=-0.4625$
- $s_d=3.7557$
- $df=7$
- $t_{0.025,7}=2.365$

$$ E=2.365\\frac{3.7557}{\\sqrt8}=3.1399 $$

## 答案
$$ -0.4625\\pm3.1399=(-3.6024,\\ 2.6774) $$

**95% CI：$(-3.60\\%,\\ 2.68\\%)$。**

因為區間包含 0，平均成長率是否真的改變並不明顯。`
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
根據 Exercise 9.12：$n=10,\\ s=15$ calories，求母體標準差 $\\sigma$ 的 99% confidence interval。

## 題型辨識
- 題目問 $\\sigma$，不是 $\\mu$，所以不能用 $t$ interval。
- 單一常態母體的變異數/標準差信賴區間使用 $\\chi^2$。
- 公式先求 $\\sigma^2$，最後才開根號得到 $\\sigma$。
- 自由度是 $df=n-1=9$。

## 解題步驟
1. 寫出 $n=10$、$s=15$、$df=9$。
2. 99% CI 表示 $\\alpha=0.01$，兩尾各 $0.005$。
3. 查兩個卡方臨界值。
4. 套變異數區間公式。
5. 最後把上下界都開根號，答案才是標準差。

## 解法
常態母體下，標準差信賴區間先從變異數做起：
$$ \\frac{(n-1)s^2}{\\chi^2_{\\alpha/2}}<\\sigma^2<\\frac{(n-1)s^2}{\\chi^2_{1-\\alpha/2}} $$

99% CI 中 $\\alpha=0.01$，$df=n-1=9$。

- $\\chi^2_{0.005,9}=23.589$
- $\\chi^2_{0.995,9}=1.735$

$$ \\frac{9(15^2)}{23.589}<\\sigma^2<\\frac{9(15^2)}{1.735} $$
$$ 85.845<\\sigma^2<1167.147 $$
$$ \\sqrt{85.845}<\\sigma<\\sqrt{1167.147} $$

## 答案
**99% CI for $\\sigma$：$(9.265,\\ 34.163)$ calories。**`
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
    content: `## 題目摘要
乾洗店宣稱新的去污劑可去除超過 70% 的污漬。隨機挑 12 個污漬測試。若去除少於 11 個，則不拒絕 $H_0:p=0.7$；否則結論為 $p>0.7$。

## 題型辨識
- 這題不是 confidence interval，而是根據一個 decision rule 算錯誤機率。
- 成功/失敗型資料，樣本數小，所以用 binomial distribution。
- Type I error：$H_0$ 真的時候，結果卻落入拒絕域。
- Type II error：真實比例已經是替代情況，但結果沒有落入拒絕域。

也就是：
- $H_0:p=0.7$
- $H_1:p>0.7$
- 拒絕域：$X\\ge 11$，其中 $X$ 是 12 個中成功去除的污漬數。

## (a) Type I error
Type I error 是 $H_0$ 真的時候卻 reject $H_0$：
$$ \\alpha=P(X\\ge11\\mid p=0.7) $$
$$ \\alpha=P(X=11)+P(X=12) $$
$$ \\alpha=0.0712+0.0138=0.0850 $$

## (b) Type II error
若真實 $p=0.9$，但觀察到 $X\\le10$：
$$ \\beta=P(X\\le10\\mid p=0.9)=0.3410 $$

## 答案
- **$\\alpha=0.0850$**
- **$\\beta=0.3410$**`
  },
  {
    id: 14,
    group: 'Assignment 7',
    title: 'Exercise 10.17',
    content: `## 題目摘要
某 cement 的新 curing process 平均抗壓強度為 $5000$ kg/cm²，標準差 $\\sigma=120$。檢定：
$$ H_0:\\mu=5000,\\quad H_1:\\mu<5000 $$

抽樣 $n=50$，拒絕域定為：
$$ \\bar X<4970 $$

## 題型辨識
- 題目給的是拒絕域，不是叫你重新找拒絕域。
- 已知母體標準差 $\\sigma=120$，所以 $\\bar X$ 用 normal distribution。
- Type I error 用 $H_0$ true 的分配，也就是 $\\mu=5000$。
- Type II error 用題目指定的其他真實平均數，例如 $\\mu=4970$ 或 $\\mu=4960$。

## 解題步驟
1. 先算 $\\sigma_{\\bar X}=\\sigma/\\sqrt n$。
2. 算 $\\alpha=P(\\bar X<4970\\mid \\mu=5000)$。
3. 算 $\\beta=P(\\bar X\\ge4970\\mid \\mu=\\text{指定真值})$。
4. 注意 Type II error 是 nonrejection region 的機率。

## (a) Type I error
若 $H_0$ 為真，$\\mu=5000$。

$$ \\sigma_{\\bar X}=\\frac{120}{\\sqrt{50}}=16.971 $$
$$ z=\\frac{4970-5000}{16.971}=-1.77 $$
$$ \\alpha=P(Z<-1.77)=0.0384 $$

## (b) Type II error
Fail to reject $H_0$ 的區域是 $\\bar X\\ge4970$。

若 $\\mu=4970$：
$$ z=\\frac{4970-4970}{16.971}=0 $$
$$ \\beta=P(Z>0)=0.5 $$

若 $\\mu=4960$：
$$ z=\\frac{4970-4960}{16.971}=0.59 $$
$$ \\beta=P(Z>0.59)=0.2776 $$

## 答案
- **$\\alpha=0.0384$**
- **$\\beta=0.5$ when $\\mu=4970$**
- **$\\beta=0.2776$ when $\\mu=4960$**`
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
15 位受試者分別在 prefatigue 與 postfatigue 條件下完成任務。若 postfatigue 的 mean absolute time difference 增加，代表疲勞練習會干擾 performance mechanism。檢定此 claim。

## 題型辨識
- 同一位受試者在兩種狀態下測量，所以是 paired data。
- paired test 不比較兩組平均數本身，而是先算每位受試者的差值。
- 題目 claim 是 postfatigue 會增加 time difference，所以令 $d=post-pre$ 後，對立假設是 $H_1:\\mu_d>0$。
- 樣本數 15 且母體標準差未知，所以用 paired $t$ test。
- 自由度是差值個數減 1，也就是 $df=14$。

令：
$$ d=\\text{postfatigue}-\\text{prefatigue} $$

假設：
$$ H_0:\\mu_d=0,\\quad H_1:\\mu_d>0 $$

## 差值
$$ d_i=-67,-33,150,128,190,2,-56,119,-8,-1,79,153,34,107,15 $$

計算：
- $n=15$
- $\\bar d=54.133$
- $s_d=83.002$
- $df=14$

## 解題步驟
1. 先決定差值方向。這題要驗證 postfatigue 是否增加，所以用 $d=post-pre$。
2. 寫假設：$H_0:\\mu_d=0$，$H_1:\\mu_d>0$。
3. 算 $\\bar d$ 與 $s_d$。
4. 用 $t=\\frac{\\bar d-0}{s_d/\\sqrt n}$。
5. 右尾檢定，和 $t_{0.05,14}$ 比較。

## 檢定統計量
$$ t=\\frac{\\bar d-0}{s_d/\\sqrt n}=\\frac{54.133}{83.002/\\sqrt{15}}=2.526 $$

若題目未另給顯著水準，採常用 $\\alpha=0.05$。右尾檢定：
$$ t_{0.05,14}=1.761 $$

## 結論
因為 $2.526>1.761$，所以 **reject $H_0$**。

有足夠證據支持 postfatigue 條件下平均絕對時間差增加，也就是疲勞練習會干擾控制表現的機制。`
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
