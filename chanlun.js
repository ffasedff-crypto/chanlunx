// ChanlunX 缠论核心算法 —— 从 C++ 源码逐函数移植（笔/段/中枢）
// 纯算法，无 DOM 依赖；浏览器与 Node 均可使用。
(function (global) {
  'use strict';

  // ---------- K线包含处理：返回处理后的 K 线序列 ----------
  function processK(highs, lows) {
    const n = highs.length;
    const list = [];
    for (let i = 0; i < n; i++) {
      const gao = highs[i], di = lows[i];
      if (list.length === 0) {
        list.push({ gao, di, fangXiang: 1, kaiShi: 0, jieShu: 0, zhongJian: 0 });
      } else {
        const LK = list[list.length - 1];
        if (gao > LK.gao && di > LK.di) {
          list.push({ gao, di, fangXiang: 1, kaiShi: LK.jieShu + 1, jieShu: LK.jieShu + 1, zhongJian: LK.jieShu + 1 });
        } else if (gao < LK.gao && di < LK.di) {
          list.push({ gao, di, fangXiang: -1, kaiShi: LK.jieShu + 1, jieShu: LK.jieShu + 1, zhongJian: LK.jieShu + 1 });
        } else if (gao <= LK.gao && di >= LK.di) {
          // 前包含
          if (LK.fangXiang === 1) LK.di = di; else LK.gao = gao;
          LK.jieShu = LK.jieShu + 1;
        } else {
          // 后包含
          if (LK.fangXiang === 1) LK.gao = gao; else LK.di = di;
          LK.jieShu = LK.jieShu + 1;
          LK.zhongJian = LK.jieShu;
        }
      }
    }
    return list;
  }

  // ---------- 简笔（Func1） ----------
  function bi1(kxs) {
    const n = kxs.length;
    const out = new Array(n).fill(0);
    for (let i = 1; i < n; i++) {
      if (kxs[i - 1].fangXiang !== kxs[i].fangXiang) {
        out[kxs[i - 1].zhongJian] = kxs[i - 1].fangXiang;
      }
    }
    if (n > 0) out[kxs[n - 1].zhongJian] = kxs[n - 1].fangXiang;
    return out;
  }

  // ---------- 是否成笔 ----------
  function ifChengbi(temp, direction) {
    if (temp.length < 4) return false;
    if (direction === -1) {
      let i = 2;
      while (true) {
        for (; i < temp.length; i++) {
          if (temp[i].di < temp[i - 1].di && temp[i - 1].di < temp[i - 2].di) break;
        }
        if (i >= temp.length) return false;
        const zuiDiJia = temp[i].di;
        for (let j = i + 1; j < temp.length; j++) {
          if (temp[j].di < zuiDiJia) return true;
        }
        i = i + 1;
      }
    } else {
      let i = 2;
      while (true) {
        for (; i < temp.length; i++) {
          if (temp[i].gao > temp[i - 1].gao && temp[i - 1].gao > temp[i - 2].gao) break;
        }
        if (i >= temp.length) return false;
        const zuiGaoJia = temp[i].gao;
        for (let j = i + 1; j < temp.length; j++) {
          if (temp[j].gao > zuiGaoJia) return true;
        }
        i = i + 1;
      }
    }
    return false;
  }

  // ---------- 标准笔（Func2，主图用的 FRAC） ----------
  function bi2(kxs) {
    const n = kxs.length;
    const out = new Array(n).fill(0);
    if (n === 0) return out;
    const biList = [];
    biList.push({ fangXiang: 1, kaiShi: kxs[0].kaiShi, jieShu: kxs[0].jieShu, gao: kxs[0].gao, di: kxs[0].di, kxianList: [kxs[0]] });
    const temp = [];
    for (let idx = 1; idx < n; idx++) {
      const K = kxs[idx];
      const lastBi = biList[biList.length - 1];
      if (lastBi.fangXiang === 1) {
        if (K.gao >= lastBi.gao) {
          lastBi.jieShu = K.jieShu; lastBi.gao = K.gao;
          if (temp.length > 0) { for (const t of temp) lastBi.kxianList.push(t); temp.length = 0; }
          lastBi.kxianList.push(K);
        } else {
          temp.push(K);
          if (ifChengbi(temp, -1)) {
            const bi = { fangXiang: -1, kaiShi: lastBi.jieShu, jieShu: temp[temp.length - 1].jieShu, di: temp[temp.length - 1].di, gao: lastBi.gao, kxianList: [] };
            for (const t of temp) bi.kxianList.push(t);
            temp.length = 0;
            biList.push(bi);
          }
        }
      } else {
        if (K.di <= lastBi.di) {
          lastBi.jieShu = K.jieShu; lastBi.di = K.di;
          if (temp.length > 0) { for (const t of temp) lastBi.kxianList.push(t); temp.length = 0; }
          lastBi.kxianList.push(K);
        } else {
          temp.push(K);
          if (ifChengbi(temp, 1)) {
            const bi = { fangXiang: 1, kaiShi: lastBi.jieShu, jieShu: temp[temp.length - 1].jieShu, gao: temp[temp.length - 1].gao, di: lastBi.di, kxianList: [] };
            for (const t of temp) bi.kxianList.push(t);
            temp.length = 0;
            biList.push(bi);
          }
        }
      }
    }
    if (temp.length >= 4) {
      const lastBi = biList[biList.length - 1];
      if (lastBi.fangXiang === 1) {
        if (ifChengbi(temp, -1)) {
          const bi = { fangXiang: -1, kaiShi: lastBi.jieShu, jieShu: temp[temp.length - 1].jieShu, di: temp[temp.length - 1].di, gao: lastBi.gao, kxianList: [] };
          for (const t of temp) bi.kxianList.push(t);
          temp.length = 0; biList.push(bi);
        }
      } else if (lastBi.fangXiang === -1) {
        if (ifChengbi(temp, 1)) {
          const bi = { fangXiang: 1, kaiShi: lastBi.jieShu, jieShu: temp[temp.length - 1].jieShu, gao: temp[temp.length - 1].gao, di: lastBi.di, kxianList: [] };
          for (const t of temp) bi.kxianList.push(t);
          temp.length = 0; biList.push(bi);
        }
      }
    }
    for (const bi of biList) {
      out[bi.kxianList[bi.kxianList.length - 1].zhongJian] = bi.fangXiang;
    }
    return out;
  }

  // ---------- 段（Func3 标准画法） ----------
  function duan1(frac, highs, lows) {
    const n = frac.length;
    const out = new Array(n).fill(0);
    let nState = 0, nLastD = 0, nLastG = 0;
    let fTop0 = 0, fBot0 = 0, fTop1 = 0, fTop2 = 0, fBot1 = 0, fBot2 = 0;
    for (let i = 0; i < n; i++) {
      if (frac[i] === 1) { fTop1 = fTop2; fTop2 = highs[i]; }
      else if (frac[i] === -1) { fBot1 = fBot2; fBot2 = lows[i]; }
      if (nState === 0) {
        if (frac[i] === 1) { nState = 1; nLastG = i; out[nLastG] = 1; fTop0 = 0; fBot0 = 0; }
        else if (frac[i] === -1) { nState = -1; nLastD = i; out[nLastD] = -1; fTop0 = 0; fBot0 = 0; }
      } else if (nState === 1) {
        if (frac[i] === 1) {
          if (highs[i] > highs[nLastG]) { out[nLastG] = 0; nLastG = i; out[nLastG] = 1; fTop0 = 0; fBot0 = 0; }
        } else if (frac[i] === -1) {
          if (lows[i] < lows[nLastD]) { nState = -1; nLastD = i; out[nLastD] = -1; fTop0 = 0; fBot0 = 0; }
          else if (fTop1 > 0 && fTop2 > 0 && fBot1 > 0 && fBot2 > 0 && fTop2 < fTop1 && fBot2 < fBot1) { nState = -1; nLastD = i; out[nLastD] = -1; fTop0 = 0; fBot0 = 0; }
          else {
            if (fBot0 === 0) fBot0 = lows[i];
            else if (lows[i] < fBot0) { nState = -1; nLastD = i; out[nLastD] = -1; fTop0 = 0; fBot0 = 0; }
          }
        }
      } else if (nState === -1) {
        if (frac[i] === -1) {
          if (lows[i] < lows[nLastD]) { out[nLastD] = 0; nLastD = i; out[nLastD] = -1; fTop0 = 0; fBot0 = 0; }
        } else if (frac[i] === 1) {
          if (highs[i] > highs[nLastG]) { nState = 1; nLastG = i; out[nLastG] = 1; fTop0 = 0; fBot0 = 0; }
          else if (fTop1 > 0 && fTop2 > 0 && fBot1 > 0 && fBot2 > 0 && fTop2 > fTop1 && fBot2 > fBot1) { nState = 1; nLastG = i; out[nLastG] = 1; fTop0 = 0; fBot0 = 0; }
          else {
            if (fTop0 === 0) fTop0 = highs[i];
            else if (highs[i] > fTop0) { nState = 1; nLastG = i; out[nLastG] = 1; fTop0 = 0; fBot0 = 0; }
          }
        }
      }
    }
    return out;
  }

  // ---------- 中枢（ZS） ----------
  function rangeMax(a, s, e) { if (s + 1 >= e) return (a[s] || 0); let m = a[s + 1]; for (let k = s + 1; k < e; k++) if (a[k] > m) m = a[k]; return m; }
  function rangeMin(a, s, e) { if (s + 1 >= e) return (a[s] || 0); let m = a[s + 1]; for (let k = s + 1; k < e; k++) if (a[k] < m) m = a[k]; return m; }

  function ZhongShu() { this.Reset(); }
  ZhongShu.prototype.Reset = function () {
    this.bValid = false;
    this.nTop1 = 0; this.nTop2 = 0; this.nTop3 = 0;
    this.nBot1 = 0; this.nBot2 = 0; this.nBot3 = 0;
    this.fTop1 = 0; this.fTop2 = 0; this.fTop3 = 0;
    this.fBot1 = 0; this.fBot2 = 0; this.fBot3 = 0;
    this.nLines = 0; this.nStart = 0; this.nEnd = 0;
    this.fHigh = 0; this.fLow = 0; this.nDirection = 0; this.nTerminate = 0;
  };
  ZhongShu.prototype.PushHigh = function (i, v) {
    this.nTop3 = this.nTop2; this.fTop3 = this.fTop2;
    this.nTop2 = this.nTop1; this.fTop2 = this.fTop1;
    this.nTop1 = i; this.fTop1 = v;
    if (this.bValid) {
      if (this.fTop1 < this.fLow) { this.nTerminate = -1; if (this.nTop2 > this.nEnd) this.nEnd = this.nTop2; return true; }
      else { if (this.nBot1 > this.nEnd) this.nEnd = this.nBot1; }
    } else {
      if (this.nTop3 > 0 && this.nTop2 > 0 && this.nTop1 > 0 && this.nBot2 > 0 && this.nBot1 > 0) {
        const fTempHigh = (this.fTop1 < this.fTop2 ? this.fTop1 : this.fTop2);
        const fTempLow = (this.fBot1 > this.fBot2 ? this.fBot1 : this.fBot2);
        if (this.fTop3 > this.fTop2 && fTempHigh > fTempLow) {
          this.nDirection = -1; this.nStart = this.nBot2; this.nEnd = this.nTop1;
          this.fHigh = fTempHigh; this.fLow = fTempLow; this.bValid = true;
        }
      }
    }
    return false;
  };
  ZhongShu.prototype.PushLow = function (i, v) {
    this.nBot3 = this.nBot2; this.fBot3 = this.fBot2;
    this.nBot2 = this.nBot1; this.fBot2 = this.fBot1;
    this.nBot1 = i; this.fBot1 = v;
    if (this.bValid) {
      if (this.fBot1 > this.fHigh) { this.nTerminate = 1; if (this.nBot2 > this.nEnd) this.nEnd = this.nBot2; return true; }
      else { if (this.nTop1 > this.nEnd) this.nEnd = this.nTop1; }
    } else {
      if (this.nTop2 > 0 && this.nTop1 > 0 && this.nBot3 > 0 && this.nBot2 > 0 && this.nBot1 > 0) {
        const fTempHigh = (this.fTop1 < this.fTop2 ? this.fTop1 : this.fTop2);
        const fTempLow = (this.fBot1 > this.fBot2 ? this.fBot1 : this.fBot2);
        if (this.fBot3 < this.fBot2 && fTempHigh > fTempLow) {
          this.nDirection = 1; this.nStart = this.nTop2; this.nEnd = this.nBot1;
          this.fHigh = fTempHigh; this.fLow = fTempLow; this.bValid = true;
        }
      }
    }
    return false;
  };

  function ZS(nCount, pIn, pHigh, pLow) {
    const list = [];
    const zs = new ZhongShu();
    for (let i = 0; i < nCount; i++) {
      if (pIn[i] === 1) {
        if (zs.PushHigh(i, pHigh[i])) {
          let bValid = true, fHighValue = 0, nHighIndex = 0, nLowIndex = 0, nLowIndexTemp = 0, nHighCount = 0;
          if (zs.nDirection === 1 && zs.nTerminate === -1) {
            bValid = false;
            for (let x = zs.nStart; x <= zs.nEnd; x++) {
              if (pIn[x] === 1) {
                if (nHighCount === 0) { nHighCount++; fHighValue = pHigh[x]; nHighIndex = x; }
                else {
                  nHighCount++;
                  if (pHigh[x] >= fHighValue) { if (nHighCount > 2) bValid = true; fHighValue = pHigh[x]; nHighIndex = x; nLowIndex = nLowIndexTemp; }
                }
              } else if (pIn[x] === -1) { nLowIndexTemp = x; }
            }
            if (bValid) zs.nEnd = nLowIndex;
            i = nHighIndex - 1;
          } else { i = zs.nEnd - 1; }
          if (bValid) list.push({ s: zs.nStart, e: zs.nEnd, zg: zs.fHigh, zd: zs.fLow, direction: zs.nDirection, gg: rangeMax(pHigh, zs.nStart, zs.nEnd), dd: rangeMin(pLow, zs.nStart, zs.nEnd) });
          zs.Reset();
        }
      } else if (pIn[i] === -1) {
        if (zs.PushLow(i, pLow[i])) {
          let bValid = true, fLowValue = 0, nLowIndex = 0, nHighIndex = 0, nHighIndexTemp = 0, nLowCount = 0;
          if (zs.nDirection === -1 && zs.nTerminate === 1) {
            bValid = false;
            for (let x = zs.nStart; x <= zs.nEnd; x++) {
              if (pIn[x] === -1) {
                if (nLowCount === 0) { nLowCount++; fLowValue = pLow[x]; nLowIndex = x; }
                else {
                  nLowCount++;
                  if (pLow[x] <= fLowValue) { if (nLowCount > 2) bValid = true; fLowValue = pLow[x]; nLowIndex = x; nHighIndex = nHighIndexTemp; }
                }
              } else if (pIn[x] === 1) { nHighIndexTemp = x; }
            }
            if (bValid) zs.nEnd = nHighIndex;
            i = nLowIndex - 1;
          } else { i = zs.nEnd - 1; }
          if (bValid) list.push({ s: zs.nStart, e: zs.nEnd, zg: zs.fHigh, zd: zs.fLow, direction: zs.nDirection, gg: rangeMax(pHigh, zs.nStart, zs.nEnd), dd: rangeMin(pLow, zs.nStart, zs.nEnd) });
          zs.Reset();
        }
      }
    }
    if (zs.bValid) list.push({ s: zs.nStart, e: zs.nEnd, zg: zs.fHigh, zd: zs.fLow, direction: zs.nDirection, gg: rangeMax(pHigh, zs.nStart, zs.nEnd), dd: rangeMin(pLow, zs.nStart, zs.nEnd) });
    return list;
  }

  // ---------- 一键计算 ----------
  function computeChanlun(highs, lows) {
    const kxs = processK(highs, lows);
    const frac = bi2(kxs);          // 标准笔
    const duan = duan1(frac, highs, lows); // 段
    const biPivots = ZS(frac.length, frac, highs, lows);     // 笔中枢
    const duanPivots = ZS(duan.length, duan, highs, lows);   // 段中枢
    return { kxs, frac, duan, biPivots, duanPivots };
  }

  const api = { processK, bi1, bi2, duan1, ZS, computeChanlun };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.Chanlun = api;
})(typeof window !== 'undefined' ? window : globalThis);
